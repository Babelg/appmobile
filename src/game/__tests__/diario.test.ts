import { CAR_BY_ID, CARS } from '@/data/cars';

import {
  acertouTudo,
  avaliar,
  buscarCarros,
  faixaDoAno,
  carroDeTreino,
  carroDoDia,
  focoDoDiario,
  kmDoDiario,
  numeroDoDia,
  PRIMEIRO_DIA,
  TENTATIVAS,
  terminou,
  textoCompartilhar,
  travas,
  zoomDaTentativa,
} from '../diario';
import { mulberry32 } from '../random';

const dia = (offset: number) => {
  const d = new Date(2026, 10, 21 + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

describe('carro do dia', () => {
  it('começa na Nave nº 1 e é sempre o mesmo para a mesma data', () => {
    expect(numeroDoDia(PRIMEIRO_DIA)).toBe(1);
    expect(numeroDoDia(dia(9))).toBe(10);
    expect(numeroDoDia('2020-01-01')).toBe(1);
    expect(carroDoDia(dia(3)).id).toBe(carroDoDia(dia(3)).id);
  });

  it('não repete carro até passar pelo catálogo inteiro', () => {
    const ids = Array.from({ length: CARS.length }, (_, i) => carroDoDia(dia(i)).id);
    expect(new Set(ids).size).toBe(CARS.length);
    expect(carroDoDia(dia(CARS.length)).id).toBe(ids[0]);
  });

  it('o treino nunca sorteia o carro a evitar', () => {
    const rng = mulberry32(4);
    for (let i = 0; i < 200; i++) expect(carroDeTreino(rng, ['onix']).id).not.toBe('onix');
  });
});

describe('câmera', () => {
  it.each(CARS.map((c) => [c.id, c] as const))('%s: zoom cai a cada palpite, do detalhe até quase a foto inteira', (_id, car) => {
    const zooms = Array.from({ length: TENTATIVAS }, (_, i) => zoomDaTentativa(car, i));
    for (let i = 1; i < zooms.length; i++) expect(zooms[i]).toBeLessThan(zooms[i - 1]);
    expect(zooms[0]).toBeLessThanOrEqual(4.5);
    expect(zooms[0]).toBeGreaterThan(2.5);
    expect(zooms.at(-1)).toBeCloseTo(1.2);
    const foco = focoDoDiario(car);
    expect(foco.x).toBeGreaterThanOrEqual(0);
    expect(foco.y).toBeLessThanOrEqual(1);
  });
});

describe('avaliação dos palpites', () => {
  const onix = CAR_BY_ID.onix;

  it('marca, modelo e ano certos', () => {
    const a = avaliar({ carId: 'onix', ano: onix.launch }, onix);
    expect(a).toEqual({ marca: 'certo', modelo: 'certo', ano: 'certo', seta: null });
    expect(acertouTudo(a)).toBe(true);
  });

  it('mesma marca, outro modelo; ano perto com seta', () => {
    const outro = CARS.find((c) => c.make === onix.make && c.id !== 'onix')!;
    const a = avaliar({ carId: outro.id, ano: onix.launch - 2 }, onix);
    expect(a).toMatchObject({ marca: 'certo', modelo: 'errado', ano: 'perto', seta: 'acima' });
    expect(avaliar({ carId: outro.id, ano: onix.launch + 10 }, onix)).toMatchObject({ ano: 'errado', seta: 'abaixo' });
  });

  it('as setas estreitam a faixa de anos', () => {
    const p = (ano: number) => ({ carId: 'fusca', ano });
    expect(faixaDoAno([], onix)).toEqual({ min: null, max: null });
    expect(faixaDoAno([p(onix.launch - 5), p(onix.launch + 4), p(onix.launch - 2)], onix)).toEqual({
      min: onix.launch - 1,
      max: onix.launch + 3,
    });
  });

  it('trava o que já foi acertado', () => {
    const outro = CARS.find((c) => c.make === onix.make && c.id !== 'onix')!;
    expect(travas([{ carId: outro.id, ano: onix.launch }], onix)).toEqual({ marca: onix.make, carId: null, ano: onix.launch });
  });
});

describe('fim de jogo e km', () => {
  const onix = CAR_BY_ID.onix;
  const errado = { carId: 'fusca', ano: 1950 };
  const certo = { carId: 'onix', ano: onix.launch };

  it('acertar tudo vale 60 km no 1º palpite e 10 a menos a cada palpite', () => {
    expect(kmDoDiario([avaliar(certo, onix)])).toBe(60);
    const em3 = [errado, errado, certo].map((p) => avaliar(p, onix));
    expect(terminou(em3)).toBe(true);
    expect(kmDoDiario(em3)).toBe(40);
  });

  it('acaba depois de 6 palpites, com consolação pelo que acertou', () => {
    const avs = Array.from({ length: TENTATIVAS }, () => avaliar({ carId: 'onix', ano: 1950 }, onix));
    expect(terminou(avs.slice(0, 5))).toBe(false);
    expect(terminou(avs)).toBe(true);
    expect(kmDoDiario(avs)).toBe(8);
    expect(kmDoDiario(Array.from({ length: TENTATIVAS }, () => avaliar(errado, onix)))).toBe(0);
  });

  it('texto de compartilhar não entrega a resposta', () => {
    const texto = textoCompartilhar(7, [errado, certo].map((p) => avaliar(p, onix)));
    expect(texto).toContain('#7');
    expect(texto).toContain('2/6');
    expect(texto).not.toMatch(/onix|chevrolet/i);
    expect(texto.split('\n')).toHaveLength(4);
  });
});

describe('busca de carros', () => {
  it('acha por modelo, marca ou apelido, sem ligar para acentos', () => {
    expect(buscarCarros('onix', null).map((c) => c.id)).toContain('onix');
    expect(buscarCarros('citroen', null).every((c) => c.make === 'Citroën')).toBe(true);
    expect(buscarCarros('', null)).toEqual([]);
  });

  it('com a marca travada, só mostra modelos dela', () => {
    const lista = buscarCarros('', 'Chevrolet');
    expect(lista.length).toBeGreaterThan(1);
    expect(lista.every((c) => c.make === 'Chevrolet')).toBe(true);
  });
});
