import { CAR_BY_ID, CARS } from '@/data/cars';
import type { Car } from '@/data/types';

import { daysBetween } from './progress';
import { mulberry32, pick, shuffle, type Rng } from './random';

/**
 * "Nave do Dia": um carro por dia, o mesmo para todo mundo. O jogador vê um detalhe da foto e
 * tem TENTATIVAS palpites para acertar marca, modelo e ano de lançamento; a cada palpite a
 * câmera se afasta um pouco.
 */
export const TENTATIVAS = 6;
/** Diferença de anos que ainda conta como "perto". */
export const ANO_PERTO = 3;
/** Dia da Nave nº 1. */
export const PRIMEIRO_DIA = '2026-11-21';

const ZOOM_TETO = 4.5;
/** Zoom do último palpite (a foto inteira só aparece no fim). */
const ZOOM_ULTIMO = 1.2;

export type Palpite = { carId: string; ano: number };
export type Cor = 'certo' | 'perto' | 'errado';
export type Avaliacao = {
  marca: Cor;
  modelo: Cor;
  ano: Cor;
  /** O lançamento do carro certo é mais novo ("acima") ou mais antigo ("abaixo") que o chute. */
  seta: 'acima' | 'abaixo' | null;
};

/** Ordem fixa (embaralhada uma vez, por id) para o carro do dia não depender da ordem do catálogo. */
const ORDEM: string[] = shuffle(
  CARS.map((c) => c.id).sort(),
  mulberry32(20261121),
);

export function numeroDoDia(dia: string): number {
  return Math.max(0, daysBetween(PRIMEIRO_DIA, dia)) + 1;
}

export function carroDoDia(dia: string): Car {
  return CAR_BY_ID[ORDEM[(numeroDoDia(dia) - 1) % ORDEM.length]];
}

/** Carro aleatório para o treino livre (nunca o carro do dia, para não estragar a surpresa). */
export function carroDeTreino(rng: Rng, evitar: string[]): Car {
  const opcoes = CARS.filter((c) => !evitar.includes(c.id));
  return pick(opcoes.length ? opcoes : CARS, rng);
}

/** Pontos trocados onde o detalhe mais fechado entregava a resposta (logo, placa com o ano). */
const FOCO_AJUSTADO: Record<string, { x: number; y: number }> = {
  gol: { x: 0.45, y: 0.55 },
  countach: { x: 0.38, y: 0.6 },
  jetta: { x: 0.76, y: 0.72 },
};

/** Ponto da foto onde a câmera começa: o detalhe mais fechado entre os recortes do carro. */
export function focoDoDiario(car: Car): { x: number; y: number } {
  if (FOCO_AJUSTADO[car.id]) return FOCO_AJUSTADO[car.id];
  const c = car.crops.reduce((a, b) => (b.zoom > a.zoom ? b : a));
  return { x: c.x, y: c.y };
}

/** Zoom para o palpite `tentativa` (0 = primeiro). Vai do detalhe até quase a foto inteira. */
export function zoomDaTentativa(car: Car, tentativa: number): number {
  const topo = Math.min(ZOOM_TETO, Math.max(...car.crops.map((c) => c.zoom)) + 0.8);
  const t = Math.min(Math.max(tentativa, 0), TENTATIVAS - 1) / (TENTATIVAS - 1);
  return topo * Math.pow(ZOOM_ULTIMO / topo, t);
}

export function avaliar(palpite: Palpite, alvo: Car): Avaliacao {
  const chute = CAR_BY_ID[palpite.carId];
  const dif = alvo.launch - palpite.ano;
  return {
    marca: chute?.make === alvo.make ? 'certo' : 'errado',
    modelo: palpite.carId === alvo.id ? 'certo' : 'errado',
    ano: dif === 0 ? 'certo' : Math.abs(dif) <= ANO_PERTO ? 'perto' : 'errado',
    seta: dif > 0 ? 'acima' : dif < 0 ? 'abaixo' : null,
  };
}

export const acertouTudo = (a: Avaliacao | undefined) => !!a && a.modelo === 'certo' && a.ano === 'certo';

export function terminou(avaliacoes: Avaliacao[]): boolean {
  return avaliacoes.length >= TENTATIVAS || acertouTudo(avaliacoes.at(-1));
}

/** O que já está travado (acertado) e entra sozinho nos próximos palpites. */
export function travas(palpites: Palpite[], alvo: Car) {
  const avs = palpites.map((p) => avaliar(p, alvo));
  return {
    marca: avs.some((a) => a.marca === 'certo') ? alvo.make : null,
    carId: avs.some((a) => a.modelo === 'certo') ? alvo.id : null,
    ano: avs.some((a) => a.ano === 'certo') ? alvo.launch : null,
  };
}

/** Faixa de anos que sobra depois das setas dos palpites anteriores. */
export function faixaDoAno(palpites: Palpite[], alvo: Car): { min: number | null; max: number | null } {
  let min: number | null = null;
  let max: number | null = null;
  for (const p of palpites) {
    const { seta, ano } = avaliar(p, alvo);
    if (ano === 'certo') return { min: p.ano, max: p.ano };
    if (seta === 'acima') min = Math.max(min ?? -Infinity, p.ano + 1);
    if (seta === 'abaixo') max = Math.min(max ?? Infinity, p.ano - 1);
  }
  return { min, max };
}

/**
 * Km ganhos: acertar tudo vale 60 no 1º palpite e 10 a menos a cada palpite usado.
 * Quem não fecha ganha um prêmio de consolação pelo que chegou a acertar.
 */
export function kmDoDiario(avaliacoes: Avaliacao[]): number {
  if (acertouTudo(avaliacoes.at(-1))) return 10 * (TENTATIVAS + 1 - avaliacoes.length);
  const algum = (campo: 'marca' | 'modelo' | 'ano') => avaliacoes.some((a) => a[campo] === 'certo');
  return (algum('marca') ? 3 : 0) + (algum('modelo') ? 5 : 0) + (algum('ano') ? 2 : 0);
}

const QUADRADO: Record<Cor, string> = { certo: '🟩', perto: '🟨', errado: '⬛' };

/** Resultado sem spoiler, para mandar para os amigos. */
export function textoCompartilhar(numero: number, avaliacoes: Avaliacao[]): string {
  const placar = acertouTudo(avaliacoes.at(-1)) ? `${avaliacoes.length}/${TENTATIVAS}` : `X/${TENTATIVAS}`;
  const linhas = avaliacoes.map(
    (a) => `${QUADRADO[a.marca]}${QUADRADO[a.modelo]}${QUADRADO[a.ano]}${a.seta === 'acima' ? '⬆️' : a.seta === 'abaixo' ? '⬇️' : ''}`,
  );
  return [`Qual é a Nave? · Nave do Dia #${numero} · ${placar}`, '', ...linhas].join('\n');
}

/** Busca de carros para o palpite (ignora acentos e maiúsculas; respeita a marca travada). */
export function buscarCarros(texto: string, marcaTravada: string | null, limite = 6): Car[] {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  const termos = norm(texto).split(/\s+/).filter(Boolean);
  const base = marcaTravada ? CARS.filter((c) => c.make === marcaTravada) : CARS;
  if (!termos.length) return marcaTravada ? ordenar(base).slice(0, limite * 2) : [];
  const achados = base.filter((c) => {
    const alvo = norm(`${c.make} ${c.model} ${c.nickname ?? ''}`);
    return termos.every((t) => alvo.includes(t));
  });
  return ordenar(achados).slice(0, limite);
}

function ordenar(cars: Car[]): Car[] {
  return [...cars].sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`, 'pt-BR'));
}
