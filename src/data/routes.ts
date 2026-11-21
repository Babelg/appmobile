import type { Lesson, Route } from './types';

export const ROUTES: Route[] = [
  {
    id: 'populares',
    title: 'Populares de Hoje',
    subtitle: 'Os carros que você vê em todo semáforo',
    flag: '🇧🇷',
    color: '#14B8A6',
    carIds: ['polo', 'onix', 'hb20', 'argo', 'mobi', 'kwid'],
  },
  {
    id: 'vendas',
    title: 'Campeões de Vendas',
    subtitle: 'Qual carro mandou no mercado em cada época?',
    flag: '🏆',
    color: '#65A30D',
    carIds: [],
  },
  {
    id: 'suvs',
    title: 'SUVs Compactos',
    subtitle: 'Os altinhos que tomaram conta das ruas',
    flag: '🇧🇷',
    color: '#0EA5E9',
    carIds: ['tracker', 'creta', 'nivus', 'kicks', 'renegade', 'pulse'],
  },
  {
    id: 'sedas',
    title: 'Hatches e Sedãs',
    subtitle: 'Do Civic ao C3: os carros de todo dia',
    flag: '🇧🇷',
    color: '#DB2777',
    carIds: ['civic', 'city', 'virtus', 'cronos', 'p208', 'c3'],
  },
  {
    id: 'utilitarios',
    title: 'Queridinhos de Agora',
    subtitle: 'Do Jetta à Hilux: os mais desejados',
    flag: '🇧🇷',
    color: '#F97316',
    carIds: ['jetta', 'corolla', 'tcross', 'compass', 'strada', 'hilux'],
  },
  {
    id: 'picapes',
    title: 'Picapes de Respeito',
    subtitle: 'Da Montana à Ram: caçamba é com elas',
    flag: '🇧🇷',
    color: '#B45309',
    carIds: ['toro', 'ranger', 's10', 'montana', 'amarok', 'ram'],
  },
  {
    id: 'suvsmedios',
    title: 'SUVs Médios e Grandes',
    subtitle: 'Sete lugares, tração e conforto',
    flag: '🇧🇷',
    color: '#4F46E5',
    carIds: ['corollacross', 'hrv', 'commander', 'taos', 'sw4', 'rav4'],
  },
  {
    id: 'eletricos',
    title: 'Elétricos e Chineses',
    subtitle: 'A nova onda que chegou com tudo',
    flag: '🔌',
    color: '#059669',
    carIds: ['dolphinmini', 'dolphin', 'songplus', 'seal', 'haval', 'tiggo7'],
  },
  {
    id: 'anos2000',
    title: 'Anos 90 e 2000',
    subtitle: 'Os carros da sua infância (ou do seu tio)',
    flag: '📼',
    color: '#7C3AED',
    carIds: ['celta', 'corsa', 'palio', 'fox', 'ka', 'ecosport'],
  },
  {
    id: 'brasil',
    title: 'Clássicos do Brasil',
    subtitle: 'Os carros que estavam em toda garagem',
    flag: '🇧🇷',
    color: '#22C55E',
    carIds: ['fusca', 'kombi', 'opala', 'brasilia', 'gol', 'uno'],
  },
  {
    id: 'nacionais',
    title: 'Nacionais dos Anos 70 e 80',
    subtitle: 'Chevette, Corcel, 147 e companhia',
    flag: '🇧🇷',
    color: '#CA8A04',
    carIds: ['chevette', 'passat', 'corcel', 'fiat147', 'santana', 'maverick'],
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
/** Etapas da rota de vendas: perguntas de história (src/data/vendas.ts), não de fotos. */
const ETAPAS_VENDAS: Lesson[] = [
  { id: 'vendas-1', route: 'vendas', title: 'Anos 80', level: 'intro', carIds: [] },
  { id: 'vendas-2', route: 'vendas', title: 'A era do Gol', level: 'intro', carIds: [] },
  { id: 'vendas-3', route: 'vendas', title: 'Anos 2010', level: 'review', carIds: [] },
  { id: 'vendas-4', route: 'vendas', title: 'Desafio dos recordes', level: 'challenge', carIds: [] },
];

/** Rotas de quiz histórico (sem carros próprios na garagem). */
export const ehRotaDeVendas = (id: Route['id']) => id === 'vendas';

export const LESSONS: Lesson[] = ROUTES.flatMap((route) => {
  if (ehRotaDeVendas(route.id)) return ETAPAS_VENDAS;
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
