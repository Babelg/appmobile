/**
 * Rota "Campeões de Vendas": perguntas sobre o carro mais vendido do Brasil em cada época.
 *
 * Líderes anuais usados (conferidos em mais de uma fonte, com base na Fenabrave):
 *   1980–1982 Fusca · 1983 Chevette · 1984–1986 Monza · 1987–2013 Gol (27 anos seguidos)
 *   2014 Palio · 2015–2020 Onix · 2021–2024 Strada (veículo mais vendido, contando picapes)
 *   2024 Polo (carro de passeio mais vendido, sem contar picapes)
 * Fontes: vrum.com.br (líderes de 1980 a 2013), infomoney.com.br (2003 a 2024),
 * autoentusiastas.com.br (Monza 1984–1986), motorshow.com.br e canaltech.com.br (2024).
 * Anos sem consenso entre as fontes (ex.: 2025) ficam de fora.
 */
export type PerguntaVendas = {
  q: string;
  a: string;
  wrong: [string, string, string];
  /** carro do catálogo que aparece depois da resposta (foto + ficha) */
  carId?: string;
  /** ano em destaque na placa da pergunta */
  ano?: number;
  fato: string;
};

const FATO_GOL = 'O Gol foi o carro mais vendido do Brasil por 27 anos seguidos, de 1987 a 2013.';
const FATO_ONIX = 'O Onix liderou as vendas por seis anos seguidos, de 2015 a 2020.';
const FATO_MONZA = 'O Monza liderou em 1984, 1985 e 1986, algo raro para um carro médio, e perdeu o posto para o Gol em 1987.';
const FATO_STRADA = 'Contando as picapes, a Strada foi o veículo mais vendido do Brasil de 2021 a 2024.';

/** Uma lista por etapa da rota (anos 80, era do Gol, anos 2010, desafio). */
export const VENDAS: PerguntaVendas[][] = [
  [
    {
      q: 'Qual foi o carro mais vendido do Brasil em 1980?',
      a: 'Volkswagen Fusca',
      wrong: ['Chevrolet Chevette', 'Fiat 147', 'Ford Corcel'],
      carId: 'fusca',
      ano: 1980,
      fato: 'O Fusca ainda era o líder no começo dos anos 80, e segurou o posto até 1982.',
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 1983?',
      a: 'Chevrolet Chevette',
      wrong: ['Volkswagen Fusca', 'Volkswagen Gol', 'Fiat 147'],
      carId: 'chevette',
      ano: 1983,
      fato: 'Em 1983 o Chevette tirou o Fusca do primeiro lugar.',
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 1984?',
      a: 'Chevrolet Monza',
      wrong: ['Chevrolet Chevette', 'Volkswagen Fusca', 'Ford Corcel'],
      ano: 1984,
      fato: FATO_MONZA,
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 1986?',
      a: 'Chevrolet Monza',
      wrong: ['Volkswagen Gol', 'Volkswagen Santana', 'Chevrolet Opala'],
      ano: 1986,
      fato: FATO_MONZA,
    },
    {
      q: 'Qual carro tirou o Fusca da liderança de vendas, em 1983?',
      a: 'Chevrolet Chevette',
      wrong: ['Volkswagen Gol', 'Chevrolet Monza', 'Volkswagen Brasília'],
      carId: 'chevette',
      fato: 'O Fusca liderou até 1982; em 1983 o Chevette assumiu o primeiro lugar.',
    },
    {
      q: 'Qual carro médio foi o mais vendido do Brasil três anos seguidos, nos anos 80?',
      a: 'Chevrolet Monza',
      wrong: ['Volkswagen Santana', 'Chevrolet Opala', 'Ford Del Rey'],
      fato: FATO_MONZA,
    },
  ],
  [
    {
      q: 'Qual foi o carro mais vendido do Brasil em 1987?',
      a: 'Volkswagen Gol',
      wrong: ['Chevrolet Monza', 'Chevrolet Chevette', 'Fiat Uno'],
      carId: 'gol',
      ano: 1987,
      fato: 'Foi o primeiro ano de uma sequência de 27 anos do Gol no topo, até 2013.',
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 1994?',
      a: 'Volkswagen Gol',
      wrong: ['Fiat Uno', 'Chevrolet Corsa', 'Volkswagen Fusca'],
      carId: 'gol',
      ano: 1994,
      fato: 'Em 1994 o Gol passou de 220 mil unidades vendidas.',
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 2001?',
      a: 'Volkswagen Gol',
      wrong: ['Fiat Palio', 'Chevrolet Celta', 'Fiat Uno'],
      carId: 'gol',
      ano: 2001,
      fato: 'Em 2001 o Gol vendeu cerca de 266 mil unidades.',
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 2013?',
      a: 'Volkswagen Gol',
      wrong: ['Fiat Palio', 'Chevrolet Onix', 'Fiat Uno'],
      carId: 'gol',
      ano: 2013,
      fato: '2013 foi o último dos 27 anos seguidos do Gol no topo.',
    },
    {
      q: 'Por quantos anos seguidos o Gol foi o carro mais vendido do Brasil?',
      a: '27 anos',
      wrong: ['10 anos', '15 anos', '40 anos'],
      carId: 'gol',
      fato: FATO_GOL,
    },
    {
      q: 'Em que ano começou a sequência do Gol como carro mais vendido do Brasil?',
      a: '1987',
      wrong: ['1980', '1994', '2001'],
      carId: 'gol',
      fato: 'Antes do Gol, o Monza liderou de 1984 a 1986.',
    },
  ],
  [
    {
      q: 'Qual foi o carro mais vendido do Brasil em 2014?',
      a: 'Fiat Palio',
      wrong: ['Volkswagen Gol', 'Chevrolet Onix', 'Fiat Uno'],
      carId: 'palio',
      ano: 2014,
      fato: 'Foi o único ano do Palio no topo, e quebrou a sequência de 27 anos do Gol.',
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 2015?',
      a: 'Chevrolet Onix',
      wrong: ['Volkswagen Gol', 'Fiat Palio', 'Hyundai HB20'],
      carId: 'onix',
      ano: 2015,
      fato: FATO_ONIX,
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 2018?',
      a: 'Chevrolet Onix',
      wrong: ['Hyundai HB20', 'Renault Kwid', 'Volkswagen Gol'],
      carId: 'onix',
      ano: 2018,
      fato: FATO_ONIX,
    },
    {
      q: 'Qual foi o carro mais vendido do Brasil em 2020?',
      a: 'Chevrolet Onix',
      wrong: ['Hyundai HB20', 'Fiat Argo', 'Volkswagen Polo'],
      carId: 'onix',
      ano: 2020,
      fato: FATO_ONIX,
    },
    {
      q: 'Qual carro quebrou a sequência de 27 anos do Gol na liderança, em 2014?',
      a: 'Fiat Palio',
      wrong: ['Chevrolet Onix', 'Hyundai HB20', 'Fiat Uno'],
      carId: 'palio',
      fato: 'O Palio liderou só em 2014; no ano seguinte começou a era do Onix.',
    },
    {
      q: 'Por quantos anos seguidos o Onix foi o carro mais vendido do Brasil?',
      a: '6 anos',
      wrong: ['2 anos', '4 anos', '10 anos'],
      carId: 'onix',
      fato: FATO_ONIX,
    },
  ],
  [
    {
      q: 'Contando as picapes, qual foi o veículo mais vendido do Brasil em 2021?',
      a: 'Fiat Strada',
      wrong: ['Chevrolet Onix', 'Hyundai HB20', 'Toyota Hilux'],
      carId: 'strada',
      ano: 2021,
      fato: FATO_STRADA,
    },
    {
      q: 'Contando as picapes, qual foi o veículo mais vendido do Brasil em 2023?',
      a: 'Fiat Strada',
      wrong: ['Volkswagen Polo', 'Chevrolet Onix', 'Fiat Toro'],
      carId: 'strada',
      ano: 2023,
      fato: FATO_STRADA,
    },
    {
      q: 'Sem contar as picapes, qual foi o carro de passeio mais vendido do Brasil em 2024?',
      a: 'Volkswagen Polo',
      wrong: ['Chevrolet Onix', 'Hyundai HB20', 'Fiat Argo'],
      carId: 'polo',
      ano: 2024,
      fato: 'Contando as picapes, a Strada ficou na frente em 2024, com cerca de 144 mil unidades contra 140 mil do Polo.',
    },
    {
      q: 'Qual destes carros nunca foi o mais vendido do Brasil num ano inteiro?',
      a: 'Fiat Uno',
      wrong: ['Volkswagen Fusca', 'Chevrolet Monza', 'Fiat Palio'],
      carId: 'uno',
      fato: 'Mesmo com o sucesso do Mille, o Uno passou todos esses anos atrás do Gol.',
    },
  ],
];
