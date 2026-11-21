import { CAR_BY_ID, CARS, EXTRA_MAKES } from '@/data/cars';
import { ROUTE_BY_ID } from '@/data/routes';
import type { Car, Crop, Lesson, LessonLevel } from '@/data/types';

import { pick, shuffle, type Rng } from './random';

export type QuestionKind = 'brand' | 'identify' | 'trivia' | 'decade';

export type Option = { label: string; sub?: string };

export type Question = {
  key: string;
  kind: QuestionKind;
  carId: string;
  prompt: string;
  /** Recorte da foto; null = mostra a foto inteira. */
  crop: Crop | null;
  options: Option[];
  answer: number;
  /** Curiosidade mostrada depois da resposta. */
  fact: string;
};

const MAX_ZOOM = 4.5;
const LEVEL_ZOOM_BOOST: Record<LessonLevel, number> = { intro: 1, review: 1.1, challenge: 1.35 };

const ALL_MAKES = [...new Set([...CARS.map((c) => c.make), ...EXTRA_MAKES])];

function withOptions(correct: Option, wrong: Option[], rng: Rng) {
  const options = shuffle([correct, ...wrong], rng);
  return { options, answer: options.indexOf(correct) };
}

function cropFor(car: Car, index: number, boost: number): Crop {
  const base = car.crops.length ? car.crops[index % car.crops.length] : { x: 0.5, y: 0.5, zoom: 2 };
  return { ...base, zoom: Math.min(MAX_ZOOM, Math.max(1, base.zoom * boost)) };
}

/** Níveis de zoom ao pedir dica ("afastar a câmera"). */
export function zoomLevels(crop: Crop): number[] {
  const z = crop.zoom;
  if (z <= 1.05) return [1];
  return [z, 1 + (z - 1) * 0.5, 1 + (z - 1) * 0.2];
}

function identifyDistractors(car: Car, lesson: Lesson, rng: Rng): Car[] {
  const isOther = (c: Car) => c.id !== car.id;
  const lessonCars = lesson.level === 'intro' ? lesson.carIds.map((id) => CAR_BY_ID[id]).filter(isOther) : [];
  const routeCars = ROUTE_BY_ID[car.route].carIds.map((id) => CAR_BY_ID[id]).filter(isOther);
  const otherCars = CARS.filter((c) => c.route !== car.route);
  const ordered = [
    ...shuffle(lessonCars, rng),
    ...shuffle(routeCars, rng),
    ...shuffle(otherCars, rng),
  ];
  return [...new Set(ordered)].slice(0, 3);
}

function identifyQ(car: Car, lesson: Lesson, crop: Crop, rng: Rng): Question {
  const toOption = (c: Car): Option => ({ label: c.model, sub: c.make });
  const { options, answer } = withOptions(
    toOption(car),
    identifyDistractors(car, lesson, rng).map(toOption),
    rng,
  );
  return {
    key: `identify-${car.id}`,
    kind: 'identify',
    carId: car.id,
    prompt: 'Que carro é esse?',
    crop,
    options,
    answer,
    fact: pick(car.facts, rng),
  };
}

function brandQ(car: Car, crop: Crop, rng: Rng): Question {
  const wrong = shuffle(
    ALL_MAKES.filter((m) => m !== car.make),
    rng,
  )
    .slice(0, 3)
    .map((label) => ({ label }));
  const { options, answer } = withOptions({ label: car.make }, wrong, rng);
  return {
    key: `brand-${car.id}`,
    kind: 'brand',
    carId: car.id,
    prompt: 'De que marca é esse detalhe?',
    crop,
    options,
    answer,
    fact: pick(car.facts, rng),
  };
}

function triviaQ(car: Car, rng: Rng): Question {
  const t = pick(car.trivia, rng);
  const { options, answer } = withOptions(
    { label: t.a },
    t.wrong.map((label) => ({ label })),
    rng,
  );
  return {
    key: `trivia-${car.id}`,
    kind: 'trivia',
    carId: car.id,
    prompt: t.q,
    crop: null,
    options,
    answer,
    fact: pick(car.facts, rng),
  };
}

export function decadeLabel(decade: number) {
  return decade >= 2000 ? `Anos ${decade}` : `Anos ${String(decade).slice(2)}`;
}

function decadeQ(car: Car, rng: Rng): Question {
  const decade = Math.floor(car.launch / 10) * 10;
  const offset = Math.floor(rng() * 4);
  const start = Math.min(1990, Math.max(1930, decade - offset * 10));
  const decades = [0, 1, 2, 3].map((i) => start + i * 10);
  return {
    key: `decade-${car.id}`,
    kind: 'decade',
    carId: car.id,
    prompt: 'Em que década foi lançada a geração deste carro?',
    crop: null,
    options: decades.map((d) => ({ label: decadeLabel(d) })),
    answer: decades.indexOf(decade),
    fact: `Esta geração foi lançada em ${car.launch}. ${pick(car.facts, rng)}`,
  };
}

/**
 * Perguntas de foto inteira entregam o nome do carro, então são
 * inseridas sempre depois da pergunta de recorte do mesmo carro.
 */
function placeAfterOwnCar(base: Question[], extras: Question[], rng: Rng): Question[] {
  const out = [...base];
  for (const q of extras) {
    const min = out.findIndex((x) => x.carId === q.carId) + 1;
    const pos = min + Math.floor(rng() * (out.length - min + 1));
    out.splice(pos, 0, q);
  }
  return out;
}

export function buildLesson(lesson: Lesson, rng: Rng): Question[] {
  const cars = lesson.carIds.map((id) => CAR_BY_ID[id]);
  const boost = LEVEL_ZOOM_BOOST[lesson.level];

  if (lesson.level === 'intro') {
    // Rodada 1: marca → Rodada 2: modelo → Rodada 3: curiosidades.
    return [
      ...shuffle(cars, rng).map((c) => brandQ(c, cropFor(c, 0, boost), rng)),
      ...shuffle(cars, rng).map((c) => identifyQ(c, lesson, cropFor(c, 1, boost), rng)),
      ...shuffle(cars, rng).map((c) => triviaQ(c, rng)),
    ];
  }

  const base = shuffle(cars, rng).map((c) =>
    identifyQ(c, lesson, cropFor(c, Math.floor(rng() * Math.max(1, c.crops.length)), boost), rng),
  );
  const [a, b, c] = shuffle(cars, rng);
  const extras =
    lesson.level === 'review'
      ? [triviaQ(a, rng), triviaQ(b, rng), decadeQ(c, rng)]
      : [decadeQ(a, rng), triviaQ(b, rng)];
  return placeAfterOwnCar(base, extras, rng);
}

/** Cópia da pergunta para repetir no fim da lição, com alternativas reembaralhadas. */
export function retryOf(q: Question, rng: Rng): Question {
  const correct = q.options[q.answer];
  const options = q.kind === 'decade' ? q.options : shuffle(q.options, rng);
  return { ...q, key: `${q.key}-retry`, options, answer: options.indexOf(correct) };
}

// ───────────── Pontuação ─────────────

const BASE_KM: Record<QuestionKind, number> = { brand: 8, identify: 12, trivia: 8, decade: 8 };
const LEVEL_MULT: Record<LessonLevel, number> = { intro: 1, review: 1.2, challenge: 1.5 };

export function kmForAnswer(
  q: Question,
  opts: { zoomOuts: number; retry: boolean; level: LessonLevel },
): number {
  if (opts.retry) return 2;
  const base = Math.max(4, BASE_KM[q.kind] - opts.zoomOuts * 3);
  return Math.round(base * LEVEL_MULT[opts.level]);
}

export const LESSON_BONUS_KM = 10;
export const PERFECT_BONUS_KM = 10;

export function starsFor(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  return 1;
}
