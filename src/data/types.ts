export type RouteId = 'brasil' | 'alemanha' | 'japao' | 'eua' | 'italia';

/**
 * Ponto de foco de um "recorte" da foto. As fotos são sempre 4:3;
 * x/y vão de 0 a 1 (canto superior esquerdo = 0,0) e zoom é o quanto
 * a câmera começa aproximada (1 = foto inteira).
 */
export type Crop = { x: number; y: number; zoom: number };

export type Trivia = {
  q: string;
  a: string;
  wrong: [string, string, string];
};

export type Car = {
  id: string;
  make: string;
  model: string;
  /** Apelido popular, ex.: "Quadrado". */
  nickname?: string;
  /** Período de produção mostrado na ficha. */
  years: string;
  /** Ano de lançamento do modelo (usado nas perguntas de década). */
  launch: number;
  country: string;
  route: RouteId;
  /** Detalhes da foto usados nas perguntas de recorte. */
  crops: Crop[];
  facts: string[];
  trivia: Trivia[];
};

export type Route = {
  id: RouteId;
  title: string;
  subtitle: string;
  flag: string;
  color: string;
  carIds: string[];
};

export type LessonLevel = 'intro' | 'review' | 'challenge';

export type Lesson = {
  id: string;
  route: RouteId;
  title: string;
  level: LessonLevel;
  carIds: string[];
};

export type ImageCredit = {
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};
