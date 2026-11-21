import type { Lesson, Route } from './types';

export const ROUTES: Route[] = [
  {
    id: 'brasil',
    title: 'Clássicos do Brasil',
    subtitle: 'Os carros que estavam em toda garagem',
    flag: '🇧🇷',
    color: '#22C55E',
    carIds: ['fusca', 'kombi', 'opala', 'brasilia', 'gol', 'uno'],
  },
  {
    id: 'alemanha',
    title: 'Lendas Alemãs',
    subtitle: 'Engenharia, autobahn e muito estilo',
    flag: '🇩🇪',
    color: '#94A3B8',
    carIds: ['p911', 'sl300', 'golfgti', 'm3e30', 'quattro', 'gclass'],
  },
  {
    id: 'japao',
    title: 'Japão Raiz',
    subtitle: 'Drift, turbo e faróis escamoteáveis',
    flag: '🇯🇵',
    color: '#A78BFA',
    carIds: ['supra', 'r34', 'mx5', 'ae86', 'nsx', 'evo'],
  },
  {
    id: 'eua',
    title: 'Sonho Americano',
    subtitle: 'V8, cromados e cinema',
    flag: '🇺🇸',
    color: '#3B82F6',
    carIds: ['mustang', 'camaro', 'charger', 'corvette', 'belair', 'transam'],
  },
  {
    id: 'italia',
    title: 'Paixão Italiana',
    subtitle: 'Do Cinquecento às supermáquinas',
    flag: '🇮🇹',
    color: '#EF4444',
    carIds: ['fiat500', 'f40', 'countach', 'miura', 'testarossa', 'delta'],
  },
];

export const ROUTE_BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r])) as Record<
  Route['id'],
  Route
>;

/** Cada rota tem 4 etapas: duas de apresentação, uma revisão e um desafio. */
export const LESSONS: Lesson[] = ROUTES.flatMap((route) => {
  const first = route.carIds.slice(0, 3);
  const second = route.carIds.slice(3, 6);
  return [
    { id: `${route.id}-1`, route: route.id, title: 'Primeiro contato', level: 'intro', carIds: first },
    { id: `${route.id}-2`, route: route.id, title: 'Novos rostos', level: 'intro', carIds: second },
    { id: `${route.id}-3`, route: route.id, title: 'Revisão', level: 'review', carIds: route.carIds },
    { id: `${route.id}-4`, route: route.id, title: 'Desafio do zoom', level: 'challenge', carIds: route.carIds },
  ] satisfies Lesson[];
});

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const lessonsOfRoute = (routeId: Route['id']) => LESSONS.filter((l) => l.route === routeId);
