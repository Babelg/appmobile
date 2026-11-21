import { CAR_BY_ID } from '@/data/cars';
import { ehRotaDeVendas, LESSONS } from '@/data/routes';

import { buildLesson, decadeLabel, dificuldadeDoNivel, kmForAnswer, retryOf, starsFor, zoomLevels } from '../questions';
import { mulberry32 } from '../random';

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const DE_CARROS = LESSONS.filter((l) => !ehRotaDeVendas(l.route));
const DE_VENDAS = LESSONS.filter((l) => ehRotaDeVendas(l.route));

describe('buildLesson', () => {
  it.each(DE_CARROS.map((l) => [l.id, l] as const))('%s gera perguntas válidas', (_id, lesson) => {
    for (const seed of SEEDS) {
      const questions = buildLesson(lesson, mulberry32(seed));
      expect(questions.length).toBeGreaterThanOrEqual(8);

      for (const q of questions) {
        const car = CAR_BY_ID[q.carId];
        expect(lesson.carIds).toContain(q.carId);
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        const labels = q.options.map((o) => `${o.sub ?? ''}|${o.label}`);
        expect(new Set(labels).size).toBe(4);

        const right = q.options[q.answer];
        if (q.kind === 'identify') expect(right).toEqual({ label: car.model, sub: car.make });
        if (q.kind === 'brand') expect(right.label).toBe(car.make);
        if (q.kind === 'decade') expect(right.label).toBe(decadeLabel(Math.floor(car.launch / 10) * 10));
        if (q.kind === 'trivia') expect(car.trivia.map((t) => t.a)).toContain(right.label);

        // Perguntas de recorte precisam de recorte; as de foto inteira, não.
        expect(q.crop === null).toBe(q.kind === 'trivia' || q.kind === 'decade');
      }
    }
  });

  it('etapas de apresentação seguem marca → modelo → curiosidade', () => {
    const intro = DE_CARROS.find((l) => l.level === 'intro')!;
    const kinds = buildLesson(intro, mulberry32(7)).map((q) => q.kind);
    expect(kinds).toEqual([
      'brand', 'brand', 'brand',
      'identify', 'identify', 'identify',
      'trivia', 'trivia', 'trivia',
    ]);
  });

  it('em revisão e desafio, foto inteira de um carro nunca aparece antes do recorte dele', () => {
    for (const lesson of DE_CARROS.filter((l) => l.level !== 'intro')) {
      for (const seed of SEEDS) {
        const questions = buildLesson(lesson, mulberry32(seed));
        questions.forEach((q, i) => {
          if (q.crop) return;
          const cropIndex = questions.findIndex((x) => x.carId === q.carId && x.crop);
          expect(cropIndex).toBeGreaterThanOrEqual(0);
          expect(cropIndex).toBeLessThan(i);
        });
      }
    }
  });

  it('desafio aproxima mais que a apresentação', () => {
    const intro = buildLesson(LESSONS.find((l) => l.id === 'brasil-1')!, mulberry32(3));
    const challenge = buildLesson(LESSONS.find((l) => l.id === 'brasil-4')!, mulberry32(3));
    const maxZoom = (qs: typeof intro) => Math.max(...qs.filter((q) => q.crop).map((q) => q.crop!.zoom));
    expect(maxZoom(challenge)).toBeGreaterThan(maxZoom(intro));
  });
});

describe('rota de vendas', () => {
  it.each(DE_VENDAS.map((l) => [l.id, l] as const))('%s gera perguntas válidas', (_id, lesson) => {
    for (const seed of SEEDS.slice(0, 10)) {
      const qs = buildLesson(lesson, mulberry32(seed));
      expect(qs.length).toBeGreaterThanOrEqual(4);
      expect(new Set(qs.map((q) => q.key)).size).toBe(qs.length);
      for (const q of qs) {
        expect(q.kind).toBe('vendas');
        expect(q.crop).toBeNull();
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
        if (q.carId) expect(CAR_BY_ID[q.carId]).toBeDefined();
        if (q.ano) expect(q.prompt).toContain(String(q.ano));
      }
    }
  });

  it('o desafio mistura perguntas das outras etapas', () => {
    const desafio = DE_VENDAS[DE_VENDAS.length - 1];
    const qs = buildLesson(desafio, mulberry32(3));
    expect(qs.some((q) => !q.key.startsWith('vendas-3-'))).toBe(true);
  });
});

describe('dificuldade por nível', () => {
  it('menos dicas e recorte mais fechado conforme o nível sobe', () => {
    expect(dificuldadeDoNivel(1)).toEqual({ nivel: 1, zoom: 1, dicas: 2 });
    expect(dificuldadeDoNivel(3).dicas).toBe(1);
    expect(dificuldadeDoNivel(5).dicas).toBe(0);
    expect(dificuldadeDoNivel(5).zoom).toBeGreaterThan(dificuldadeDoNivel(2).zoom);
  });

  it('zoomLevels respeita o número de dicas', () => {
    const crop = { x: 0.5, y: 0.5, zoom: 3 };
    expect(zoomLevels(crop, 2)).toHaveLength(3);
    expect(zoomLevels(crop, 1)).toEqual([3, 2]);
    expect(zoomLevels(crop, 0)).toEqual([3]);
  });

  it('no nível alto o recorte da etapa fica mais fechado (até o limite)', () => {
    const lesson = DE_CARROS[0];
    const max = (nivel: number) => Math.max(...buildLesson(lesson, mulberry32(5), nivel).filter((q) => q.crop).map((q) => q.crop!.zoom));
    expect(max(5)).toBeGreaterThan(max(1));
    expect(max(5)).toBeLessThanOrEqual(4.5);
  });

  it('acerto em nível alto vale mais km', () => {
    const q = buildLesson(DE_CARROS[0], mulberry32(1)).find((x) => x.kind === 'identify')!;
    expect(kmForAnswer(q, { zoomOuts: 0, retry: false, level: 'intro', nivel: 5 })).toBeGreaterThan(
      kmForAnswer(q, { zoomOuts: 0, retry: false, level: 'intro', nivel: 1 }),
    );
  });
});

describe('retryOf', () => {
  it('mantém a resposta certa após embaralhar', () => {
    const lesson = LESSONS[0];
    for (const seed of SEEDS) {
      const rng = mulberry32(seed);
      for (const q of buildLesson(lesson, rng)) {
        const r = retryOf(q, rng);
        expect(r.key).toBe(`${q.key}-retry`);
        expect(r.options[r.answer]).toEqual(q.options[q.answer]);
      }
    }
  });
});

describe('pontuação', () => {
  const lesson = LESSONS[0];
  const q = buildLesson(lesson, mulberry32(1)).find((x) => x.kind === 'identify')!;

  it('dica de zoom custa km, com piso', () => {
    const full = kmForAnswer(q, { zoomOuts: 0, retry: false, level: 'intro' });
    const hinted = kmForAnswer(q, { zoomOuts: 2, retry: false, level: 'intro' });
    expect(hinted).toBeLessThan(full);
    expect(kmForAnswer(q, { zoomOuts: 10, retry: false, level: 'intro' })).toBe(4);
  });

  it('desafio vale mais e repetição vale pouco', () => {
    expect(kmForAnswer(q, { zoomOuts: 0, retry: false, level: 'challenge' })).toBeGreaterThan(
      kmForAnswer(q, { zoomOuts: 0, retry: false, level: 'intro' }),
    );
    expect(kmForAnswer(q, { zoomOuts: 0, retry: true, level: 'challenge' })).toBe(2);
  });

  it('estrelas por precisão', () => {
    expect(starsFor(1)).toBe(3);
    expect(starsFor(0.9)).toBe(3);
    expect(starsFor(0.75)).toBe(2);
    expect(starsFor(0.2)).toBe(1);
  });

  it('níveis de zoom vão do recorte até perto da foto inteira', () => {
    expect(zoomLevels({ x: 0.5, y: 0.5, zoom: 3 })).toEqual([3, 2, 1.4]);
    expect(zoomLevels({ x: 0.5, y: 0.5, zoom: 1 })).toEqual([1]);
  });
});
