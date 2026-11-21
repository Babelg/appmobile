import { CAR_BY_ID } from '@/data/cars';
import { LESSONS } from '@/data/routes';

import { buildLesson, decadeLabel, kmForAnswer, retryOf, starsFor, zoomLevels } from '../questions';
import { mulberry32 } from '../random';

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

describe('buildLesson', () => {
  it.each(LESSONS.map((l) => [l.id, l] as const))('%s gera perguntas válidas', (_id, lesson) => {
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
    const intro = LESSONS.find((l) => l.level === 'intro')!;
    const kinds = buildLesson(intro, mulberry32(7)).map((q) => q.kind);
    expect(kinds).toEqual([
      'brand', 'brand', 'brand',
      'identify', 'identify', 'identify',
      'trivia', 'trivia', 'trivia',
    ]);
  });

  it('em revisão e desafio, foto inteira de um carro nunca aparece antes do recorte dele', () => {
    for (const lesson of LESSONS.filter((l) => l.level !== 'intro')) {
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
