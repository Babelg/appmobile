import type { Car } from './types';

/**
 * Catálogo de carros. Para adicionar um carro:
 * 1. Adicione a foto em `scripts/car-images.json` e rode `npm run images`.
 * 2. Adicione a entrada aqui (crops apontam para detalhes da foto 4:3).
 * 3. Inclua o id em uma rota em `routes.ts`.
 */
export const CARS: Car[] = [
  // ───────────── Brasil ─────────────
  {
    id: 'fusca',
    make: 'Volkswagen',
    model: 'Fusca',
    years: '1959–1996 no Brasil',
    launch: 1938,
    country: 'Alemanha',
    route: 'brasil',
    crops: [{ x: 0.27, y: 0.6, zoom: 3.2 }, { x: 0.55, y: 0.3, zoom: 2.6 }],
    facts: [
      'Foi projetado por Ferdinand Porsche nos anos 1930, com motor traseiro refrigerado a ar.',
      'No Brasil, foi fabricado de 1959 a 1986 e voltou à linha de 1993 a 1996, a pedido do presidente Itamar Franco.',
      'Mais de 21 milhões de unidades foram produzidas no mundo; a última saiu do México em 2003.',
    ],
    trivia: [
      {
        q: 'Onde fica o motor do Fusca?',
        a: 'Na traseira',
        wrong: ['Na dianteira', 'No meio, atrás dos bancos', 'Embaixo do banco do motorista'],
      },
      {
        q: 'Qual presidente trouxe o Fusca de volta à produção em 1993?',
        a: 'Itamar Franco',
        wrong: ['Fernando Collor', 'José Sarney', 'Fernando Henrique Cardoso'],
      },
    ],
  },
  {
    id: 'kombi',
    make: 'Volkswagen',
    model: 'Kombi',
    years: '1957–2013 no Brasil',
    launch: 1950,
    country: 'Alemanha',
    route: 'brasil',
    crops: [{ x: 0.22, y: 0.64, zoom: 3.2 }, { x: 0.42, y: 0.3, zoom: 2.4 }],
    facts: [
      'O nome é uma abreviação do alemão Kombinationsfahrzeug, "veículo combinado" para passageiros e carga.',
      'A produção brasileira começou em 1957 e só terminou em dezembro de 2013: o Brasil foi o último país do mundo a fabricá-la.',
      'Em 2005 trocou o motor a ar por um 1.4 refrigerado a água e ganhou uma grade preta na frente, para o radiador.',
    ],
    trivia: [
      {
        q: 'Qual foi o último país do mundo a fabricar a Kombi?',
        a: 'Brasil',
        wrong: ['México', 'Alemanha', 'Argentina'],
      },
      {
        q: 'Por que a Kombi ganhou uma grade na frente em 2005?',
        a: 'Para o radiador do novo motor a água',
        wrong: [
          'Para melhorar a aerodinâmica',
          'Por exigência de segurança contra impacto',
          'Para instalar faróis de neblina',
        ],
      },
    ],
  },
  {
    id: 'opala',
    make: 'Chevrolet',
    model: 'Opala',
    years: '1968–1992',
    launch: 1968,
    country: 'EUA',
    route: 'brasil',
    crops: [{ x: 0.6, y: 0.4, zoom: 3 }, { x: 0.33, y: 0.55, zoom: 2.8 }],
    facts: [
      'Foi o primeiro automóvel da Chevrolet fabricado no Brasil.',
      'Usava a carroceria do Opel Rekord alemão com motores de origem americana de 4 e 6 cilindros.',
      'A versão esportiva SS ficou famosa pelas faixas pretas no capô e nas laterais.',
      'Cerca de 1 milhão de unidades foram produzidas até 1992.',
    ],
    trivia: [
      {
        q: 'O Opala foi derivado de qual carro alemão?',
        a: 'Opel Rekord',
        wrong: ['BMW 2002', 'Mercedes-Benz 280', 'Volkswagen Passat'],
      },
      {
        q: 'Em que ano saiu da linha o último Opala?',
        a: '1992',
        wrong: ['1985', '1996', '2001'],
      },
    ],
  },
  {
    id: 'brasilia',
    make: 'Volkswagen',
    model: 'Brasília',
    years: '1973–1982',
    launch: 1973,
    country: 'Alemanha',
    route: 'brasil',
    crops: [{ x: 0.5, y: 0.6, zoom: 3 }, { x: 0.75, y: 0.35, zoom: 2.4 }],
    facts: [
      'Foi desenvolvida no Brasil, sobre a mecânica do Fusca, com motor traseiro refrigerado a ar.',
      'Leva o nome da capital federal, inaugurada pouco mais de uma década antes do lançamento do carro.',
      'Ficou eternizada na música "Pelados em Santos", dos Mamonas Assassinas: "minha Brasília amarela".',
    ],
    trivia: [
      {
        q: 'Qual banda cantou sobre uma "Brasília amarela"?',
        a: 'Mamonas Assassinas',
        wrong: ['Titãs', 'Raimundos', 'Legião Urbana'],
      },
      {
        q: 'A Brasília usava a base mecânica de qual carro?',
        a: 'Fusca',
        wrong: ['Gol', 'Chevette', 'Passat'],
      },
    ],
  },
  {
    id: 'gol',
    make: 'Volkswagen',
    model: 'Gol',
    nickname: 'Quadrado',
    years: '1980–1996 (1ª geração)',
    launch: 1980,
    country: 'Alemanha',
    route: 'brasil',
    crops: [{ x: 0.78, y: 0.38, zoom: 2.6 }, { x: 0.1, y: 0.56, zoom: 3 }],
    facts: [
      'Foi o carro mais vendido do Brasil por 27 anos seguidos, de 1987 a 2013.',
      'As primeiras versões usavam o motor 1.3 refrigerado a ar, herdado do Fusca.',
      'A primeira geração ganhou o apelido de "quadrado" por causa das linhas retas.',
      'Ficou em produção por mais de 40 anos, até dezembro de 2022.',
    ],
    trivia: [
      {
        q: 'Por quantos anos seguidos o Gol foi o carro mais vendido do Brasil?',
        a: '27 anos',
        wrong: ['10 anos', '15 anos', '40 anos'],
      },
      {
        q: 'Qual era o motor dos primeiros Gol, em 1980?',
        a: '1.3 a ar, herdado do Fusca',
        wrong: ['1.0 turbo', '1.6 AP a álcool', '2.0 a diesel'],
      },
    ],
  },
  {
    id: 'uno',
    make: 'Fiat',
    model: 'Uno',
    years: '1984–2013 no Brasil (1ª geração)',
    launch: 1983,
    country: 'Itália',
    route: 'brasil',
    crops: [{ x: 0.62, y: 0.38, zoom: 2.6 }, { x: 0.85, y: 0.55, zoom: 2.8 }],
    facts: [
      'Foi desenhado por Giorgetto Giugiaro e eleito Carro Europeu do Ano em 1984.',
      'O Uno Mille, de 1990, inaugurou a era dos carros 1.0 com imposto reduzido no Brasil.',
      'A série de despedida, em 2013, se chamou "Grazie Mille": "muito obrigado" em italiano.',
    ],
    trivia: [
      {
        q: 'Qual designer italiano desenhou o Fiat Uno?',
        a: 'Giorgetto Giugiaro',
        wrong: ['Marcello Gandini', 'Battista Pininfarina', 'Dante Giacosa'],
      },
      {
        q: 'Como se chamou a série de despedida do Uno Mille em 2013?',
        a: 'Grazie Mille',
        wrong: ['Ciao Uno', 'Ultima Edizione', 'Mille Addio'],
      },
    ],
  },

  // ───────────── Alemanha ─────────────
  {
    id: 'p911',
    make: 'Porsche',
    model: '911',
    years: '1964–1989 (série original)',
    launch: 1964,
    country: 'Alemanha',
    route: 'alemanha',
    crops: [{ x: 0.47, y: 0.6, zoom: 3.2 }, { x: 0.72, y: 0.52, zoom: 2.6 }],
    facts: [
      'Ia se chamar 901, mas a Peugeot tinha os direitos de nomes com três números e zero no meio. Virou 911.',
      'O motor boxer de 6 cilindros fica pendurado atrás do eixo traseiro.',
      'O desenho é de Ferdinand Alexander "Butzi" Porsche, neto do fundador.',
      'Está em produção contínua desde 1964 e já passou de 1 milhão de unidades.',
    ],
    trivia: [
      {
        q: 'Qual seria o nome original do Porsche 911?',
        a: '901',
        wrong: ['912', 'Carrera', '356 B'],
      },
      {
        q: 'Onde fica o motor do Porsche 911?',
        a: 'Atrás do eixo traseiro',
        wrong: ['Na dianteira', 'No centro, entre os eixos', 'Sob os bancos'],
      },
    ],
  },
  {
    id: 'sl300',
    make: 'Mercedes-Benz',
    model: '300 SL',
    nickname: 'Asa de Gaivota',
    years: '1954–1957 (cupê)',
    launch: 1954,
    country: 'Alemanha',
    route: 'alemanha',
    crops: [{ x: 0.75, y: 0.22, zoom: 2.6 }, { x: 0.33, y: 0.62, zoom: 3.2 }],
    facts: [
      'As portas abrem para cima, como asas de gaivota. Daí o apelido "Gullwing".',
      'As portas eram assim porque o chassi tubular tinha laterais altas demais para portas comuns.',
      'Foi o primeiro carro de produção com injeção direta de gasolina.',
      'Nasceu de um carro de corrida, o W194, vencedor das 24 Horas de Le Mans de 1952.',
    ],
    trivia: [
      {
        q: 'Por que o 300 SL tem portas "asa de gaivota"?',
        a: 'O chassi tubular tinha laterais muito altas',
        wrong: [
          'Para facilitar a entrada de pilotos de capacete',
          'Por exigência da lei americana',
          'Para economizar peso nas dobradiças',
        ],
      },
      {
        q: 'Qual tecnologia o 300 SL estreou nos carros de produção?',
        a: 'Injeção direta de gasolina',
        wrong: ['Freio ABS', 'Turbocompressor', 'Câmbio automático'],
      },
    ],
  },
  {
    id: 'm3e30',
    make: 'BMW',
    model: 'M3 (E30)',
    years: '1986–1991',
    launch: 1986,
    country: 'Alemanha',
    route: 'alemanha',
    crops: [{ x: 0.4, y: 0.57, zoom: 3.4 }, { x: 0.85, y: 0.62, zoom: 3 }],
    facts: [
      'Foi criado para homologar a BMW nas corridas de turismo do Grupo A.',
      'Virou um dos carros de turismo mais vitoriosos da história, com títulos no DTM e no Mundial de Turismo de 1987.',
      'Só o capô, o teto e o teto solar são iguais aos do Série 3 comum; o resto da carroceria foi redesenhado.',
    ],
    trivia: [
      {
        q: 'Para que o BMW M3 E30 foi criado?',
        a: 'Homologar a BMW em corridas de turismo',
        wrong: ['Servir de carro de polícia', 'Bater recorde de velocidade', 'Competir no Rally Dakar'],
      },
      {
        q: 'Qual carro comum serviu de base para o M3 E30?',
        a: 'BMW Série 3',
        wrong: ['BMW Série 5', 'BMW Z1', 'BMW M1'],
      },
    ],
  },
  {
    id: 'golfgti',
    make: 'Volkswagen',
    model: 'Golf GTI',
    years: '1976–1983 (1ª geração)',
    launch: 1976,
    country: 'Alemanha',
    route: 'alemanha',
    crops: [{ x: 0.25, y: 0.45, zoom: 2.6 }, { x: 0.6, y: 0.53, zoom: 3 }],
    facts: [
      'Nasceu como projeto paralelo de um pequeno grupo de engenheiros da Volkswagen.',
      'É considerado o pai dos "hot hatches", os hatches compactos esportivos.',
      'A bola de golfe na manopla do câmbio e o friso vermelho na grade viraram marcas registradas do GTI.',
      'Tinha motor 1.6 com injeção, de 110 cv, em um carro de cerca de 800 kg.',
    ],
    trivia: [
      {
        q: 'O Golf GTI é considerado o pai de qual categoria de carros?',
        a: 'Hot hatch',
        wrong: ['SUV', 'Muscle car', 'Station wagon'],
      },
      {
        q: 'Qual objeto decorava a manopla do câmbio do Golf GTI?',
        a: 'Uma bola de golfe',
        wrong: ['Uma bola de bilhar', 'Um dado', 'Uma bola de tênis'],
      },
    ],
  },
  {
    id: 'quattro',
    make: 'Audi',
    model: 'quattro',
    years: '1980–1991',
    launch: 1980,
    country: 'Alemanha',
    route: 'alemanha',
    crops: [{ x: 0.5, y: 0.52, zoom: 3 }, { x: 0.78, y: 0.45, zoom: 2.6 }],
    facts: [
      'Lançado em 1980, popularizou a tração integral permanente em carros esportivos.',
      'Revolucionou os ralis: depois dele, praticamente todo carro vencedor passou a ter tração nas quatro rodas.',
      'Seu motor de 5 cilindros turbo tem um ronco inconfundível, famoso entre os fãs de rali.',
    ],
    trivia: [
      {
        q: 'Qual tecnologia o Audi quattro popularizou?',
        a: 'Tração integral permanente',
        wrong: ['Motor elétrico', 'Freio a disco', 'Câmbio CVT'],
      },
      {
        q: 'Quantos cilindros tinha o motor do Audi quattro?',
        a: '5',
        wrong: ['4', '6', '8'],
      },
    ],
  },
  {
    id: 'gclass',
    make: 'Mercedes-Benz',
    model: 'Classe G',
    years: 'desde 1979',
    launch: 1979,
    country: 'Alemanha',
    route: 'alemanha',
    crops: [{ x: 0.65, y: 0.3, zoom: 2.6 }, { x: 0.3, y: 0.6, zoom: 3.4 }],
    facts: [
      'Foi desenvolvido para uso militar, por sugestão do Xá do Irã, então acionista da Mercedes.',
      'É montado em Graz, na Áustria, desde 1979.',
      'Um Classe G foi usado como papamóvel pelo papa João Paulo II.',
      'É o modelo da Mercedes-Benz há mais tempo em produção.',
    ],
    trivia: [
      {
        q: 'Em que país o Classe G é fabricado?',
        a: 'Áustria',
        wrong: ['Alemanha', 'Estados Unidos', 'Hungria'],
      },
      {
        q: 'Para que o Classe G foi desenvolvido originalmente?',
        a: 'Uso militar',
        wrong: ['Corridas de rali', 'Táxi de luxo', 'Ambulância'],
      },
    ],
  },

  // ───────────── Japão ─────────────
  {
    id: 'supra',
    make: 'Toyota',
    model: 'Supra (A80)',
    years: '1993–2002',
    launch: 1993,
    country: 'Japão',
    route: 'japao',
    crops: [{ x: 0.32, y: 0.56, zoom: 3.2 }, { x: 0.6, y: 0.45, zoom: 2.6 }],
    facts: [
      'Seu motor 2JZ-GTE, de 6 cilindros em linha biturbo, é famoso por aguentar potências enormes.',
      'Ficou famoso no primeiro "Velozes e Furiosos" (2001), com o Supra laranja de Brian O\'Conner.',
      'Saiu de linha em 2002 e só voltou em 2019, desenvolvido em parceria com a BMW.',
    ],
    trivia: [
      {
        q: 'Em qual filme um Supra laranja ficou famoso?',
        a: 'Velozes e Furiosos',
        wrong: ['Carros', 'Drive', 'Need for Speed'],
      },
      {
        q: 'Como se chama o lendário motor do Supra A80?',
        a: '2JZ',
        wrong: ['RB26', '13B', '4G63'],
      },
    ],
  },
  {
    id: 'r34',
    make: 'Nissan',
    model: 'Skyline GT-R (R34)',
    years: '1999–2002',
    launch: 1999,
    country: 'Japão',
    route: 'japao',
    crops: [{ x: 0.5, y: 0.57, zoom: 3.4 }, { x: 0.25, y: 0.38, zoom: 2.8 }],
    facts: [
      'A linhagem GT-R ganhou o apelido de "Godzilla" da imprensa australiana, por dominar as pistas.',
      'Nunca foi vendido oficialmente nos EUA, o que só aumentou sua fama.',
      'Usa o motor RB26DETT, 6 em linha biturbo, e tração integral ATTESA.',
      'Ficou famoso nos games "Gran Turismo" e no filme "+Velozes +Furiosos" (2003).',
    ],
    trivia: [
      {
        q: 'Qual é o apelido da linhagem Skyline GT-R?',
        a: 'Godzilla',
        wrong: ['Hachi-Roku', 'Samurai', 'Ronin'],
      },
      {
        q: 'Qual é o motor do Skyline GT-R R34?',
        a: 'RB26DETT',
        wrong: ['2JZ-GTE', 'VR38DETT', 'SR20DET'],
      },
    ],
  },
  {
    id: 'mx5',
    make: 'Mazda',
    model: 'MX-5 (NA)',
    nickname: 'Miata',
    years: '1989–1997',
    launch: 1989,
    country: 'Japão',
    route: 'japao',
    crops: [{ x: 0.68, y: 0.58, zoom: 3 }, { x: 0.45, y: 0.48, zoom: 2.4 }],
    facts: [
      'É o roadster de dois lugares mais vendido da história, segundo o Guinness.',
      'Foi inspirado nos roadsters britânicos dos anos 60, como o Lotus Elan.',
      'Os faróis escamoteáveis sobem quando são acesos.',
      'Seu lema é "Jinba Ittai": cavalo e cavaleiro como um só.',
    ],
    trivia: [
      {
        q: 'Que recorde o MX-5 tem no Guinness?',
        a: 'Roadster de dois lugares mais vendido',
        wrong: ['Carro mais rápido do Japão', 'Carro mais leve do mundo', 'Maior tempo em produção'],
      },
      {
        q: 'Que tipo de farol a 1ª geração do MX-5 tinha?',
        a: 'Escamoteável (pop-up)',
        wrong: ['Redondo fixo duplo', 'De LED', 'Escondido atrás da grade'],
      },
    ],
  },
  {
    id: 'nsx',
    make: 'Honda',
    model: 'NSX',
    years: '1990–2005 (1ª geração)',
    launch: 1990,
    country: 'Japão',
    route: 'japao',
    crops: [{ x: 0.3, y: 0.45, zoom: 2.8 }, { x: 0.72, y: 0.6, zoom: 3 }],
    facts: [
      'Foi o primeiro carro de produção em série com carroceria monobloco toda em alumínio.',
      'Ayrton Senna testou protótipos e ajudou a deixar o chassi mais rígido.',
      'Nos EUA era vendido com a marca Acura.',
    ],
    trivia: [
      {
        q: 'Qual piloto brasileiro ajudou no desenvolvimento do NSX?',
        a: 'Ayrton Senna',
        wrong: ['Nelson Piquet', 'Emerson Fittipaldi', 'Rubens Barrichello'],
      },
      {
        q: 'Qual material inovador formava a carroceria do NSX?',
        a: 'Alumínio',
        wrong: ['Fibra de carbono', 'Fibra de vidro', 'Titânio'],
      },
    ],
  },
  {
    id: 'ae86',
    make: 'Toyota',
    model: 'Corolla AE86',
    nickname: 'Hachi-Roku',
    years: '1983–1987',
    launch: 1983,
    country: 'Japão',
    route: 'japao',
    crops: [{ x: 0.6, y: 0.55, zoom: 3 }, { x: 0.35, y: 0.62, zoom: 2.6 }],
    facts: [
      '"Hachi-Roku" quer dizer "8-6" em japonês, por causa do código do chassi.',
      'Virou ícone do drift graças ao mangá e anime "Initial D", em que entrega tofu nas montanhas.',
      'Foi um dos últimos Corolla com tração traseira, o que o tornou querido nas pistas.',
      'A versão Sprinter Trueno tem faróis escamoteáveis; a Corolla Levin, faróis fixos.',
    ],
    trivia: [
      {
        q: 'O que significa "Hachi-Roku"?',
        a: '8-6 em japonês',
        wrong: ['Raio veloz', 'Montanha alta', 'Drift perfeito'],
      },
      {
        q: 'Em que anime o AE86 entrega tofu?',
        a: 'Initial D',
        wrong: ['Akira', 'Wangan Midnight', 'Speed Racer'],
      },
    ],
  },
  {
    id: 'evo',
    make: 'Mitsubishi',
    model: 'Lancer Evolution',
    years: '1992–2016 (10 gerações)',
    launch: 1992,
    country: 'Japão',
    route: 'japao',
    crops: [{ x: 0.65, y: 0.38, zoom: 3 }, { x: 0.45, y: 0.57, zoom: 3 }],
    facts: [
      'Com ele, o finlandês Tommi Mäkinen foi campeão mundial de rali quatro vezes seguidas, de 1996 a 1999.',
      'Teve dez gerações, numeradas em algarismos romanos de I a X.',
      'Seu motor 4G63 turbo, de 2.0 litros, é lendário entre os preparadores.',
    ],
    trivia: [
      {
        q: 'Qual piloto foi tetracampeão mundial de rali com o Lancer Evo?',
        a: 'Tommi Mäkinen',
        wrong: ['Colin McRae', 'Sébastien Loeb', 'Carlos Sainz'],
      },
      {
        q: 'Quantas gerações o Lancer Evolution teve?',
        a: '10',
        wrong: ['4', '6', '12'],
      },
    ],
  },

  // ───────────── EUA ─────────────
  {
    id: 'mustang',
    make: 'Ford',
    model: 'Mustang',
    years: '1964–1973 (1ª geração)',
    launch: 1964,
    country: 'EUA',
    route: 'eua',
    crops: [{ x: 0.3, y: 0.57, zoom: 3.2 }, { x: 0.62, y: 0.42, zoom: 2.6 }],
    facts: [
      'Lançado em abril de 1964, criou a categoria dos "pony cars".',
      'Recebeu cerca de 22 mil pedidos no primeiro dia de vendas.',
      'O Mustang GT 390 de Steve McQueen em "Bullitt" (1968) estrelou uma das perseguições mais famosas do cinema.',
    ],
    trivia: [
      {
        q: 'O Mustang criou qual categoria de carros?',
        a: 'Pony car',
        wrong: ['Muscle truck', 'Hot hatch', 'Roadster'],
      },
      {
        q: 'Em qual filme Steve McQueen pilotou um Mustang numa perseguição famosa?',
        a: 'Bullitt',
        wrong: ['Vanishing Point', 'Le Mans', 'Encurralado'],
      },
    ],
  },
  {
    id: 'camaro',
    make: 'Chevrolet',
    model: 'Camaro',
    years: '1967–1969 (1ª geração)',
    launch: 1967,
    country: 'EUA',
    route: 'eua',
    crops: [{ x: 0.5, y: 0.6, zoom: 3.2 }, { x: 0.45, y: 0.3, zoom: 2.6 }],
    facts: [
      'Foi a resposta da Chevrolet ao sucesso do Ford Mustang.',
      'Perguntados sobre o que era um "camaro", executivos da Chevrolet brincaram: "um animal pequeno e feroz que come Mustangs".',
      'Um Camaro amarelo e preto deu vida ao Bumblebee no filme "Transformers" (2007).',
    ],
    trivia: [
      {
        q: 'Segundo a Chevrolet, o que é um "camaro"?',
        a: 'Um animal feroz que come Mustangs',
        wrong: ['Um vento do deserto', 'Um peixe do Caribe', 'Um cavalo selvagem'],
      },
      {
        q: 'Qual Transformer é um Camaro nos filmes?',
        a: 'Bumblebee',
        wrong: ['Optimus Prime', 'Megatron', 'Jazz'],
      },
    ],
  },
  {
    id: 'charger',
    make: 'Dodge',
    model: 'Charger',
    years: '1968–1970 (2ª geração)',
    launch: 1968,
    country: 'EUA',
    route: 'eua',
    crops: [{ x: 0.6, y: 0.55, zoom: 3.2 }, { x: 0.25, y: 0.45, zoom: 2.6 }],
    facts: [
      'Os faróis ficam escondidos atrás da grade, que parece uma peça única.',
      'O General Lee, da série "Os Gatões", era um Charger 1969 laranja.',
      'O Charger de Dominic Toretto em "Velozes e Furiosos" é um modelo 1970.',
      'A versão Daytona, com aerofólio gigante, foi o primeiro carro a passar de 200 mph na NASCAR, em 1970.',
    ],
    trivia: [
      {
        q: 'Qual era o nome do Charger laranja da série "Os Gatões"?',
        a: 'General Lee',
        wrong: ['Eleanor', 'Christine', 'KITT'],
      },
      {
        q: 'Que detalhe marca a dianteira do Charger 1969?',
        a: 'Faróis escondidos atrás da grade',
        wrong: ['Quatro faróis redondos expostos', 'Grade cromada em "boca de tubarão"', 'Um farol único central'],
      },
    ],
  },
  {
    id: 'corvette',
    make: 'Chevrolet',
    model: 'Corvette Sting Ray (C2)',
    years: '1963–1967',
    launch: 1963,
    country: 'EUA',
    route: 'eua',
    crops: [{ x: 0.72, y: 0.58, zoom: 3.2 }, { x: 0.38, y: 0.42, zoom: 2.8 }],
    facts: [
      'O Corvette foi o primeiro carro de série americano com carroceria de fibra de vidro, em 1953.',
      'O cupê de 1963 tinha a famosa janela traseira dividida ("split window"), usada só naquele ano.',
      'Os faróis giram e se escondem dentro do capô.',
    ],
    trivia: [
      {
        q: 'De que material é a carroceria do Corvette?',
        a: 'Fibra de vidro',
        wrong: ['Alumínio', 'Aço inox', 'Fibra de carbono'],
      },
      {
        q: 'Que detalhe existiu só no Corvette cupê de 1963?',
        a: 'Janela traseira dividida',
        wrong: ['Teto de vidro', 'Portas asa de gaivota', 'Escapamento central'],
      },
    ],
  },
  {
    id: 'transam',
    make: 'Pontiac',
    model: 'Firebird Trans Am',
    years: '1970–1981 (2ª geração)',
    launch: 1970,
    country: 'EUA',
    route: 'eua',
    crops: [],
    facts: [
      'Ficou famoso como o carro preto e dourado de Burt Reynolds em "Agarra-me se Puderes" (1977).',
      'O enorme pássaro de fogo pintado no capô ganhou o apelido de "screaming chicken" (galinha gritando).',
      'KITT, de "A Super Máquina", era um Trans Am da geração seguinte, de 1982.',
      'A Pontiac, marca da General Motors, foi extinta em 2010.',
    ],
    trivia: [
      {
        q: 'Qual desenho decora o capô do Trans Am?',
        a: 'Um pássaro de fogo (fênix)',
        wrong: ['Uma cobra', 'Um cavalo', 'Um touro'],
      },
      {
        q: 'Que fim teve a marca Pontiac?',
        a: 'Foi extinta pela GM em 2010',
        wrong: ['Foi comprada pela Ford', 'Virou marca de caminhões', 'Mudou de nome para Buick'],
      },
    ],
  },
  {
    id: 'belair',
    make: 'Chevrolet',
    model: 'Bel Air',
    years: '1955–1957 (geração "Tri-Five")',
    launch: 1955,
    country: 'EUA',
    route: 'eua',
    crops: [{ x: 0.48, y: 0.55, zoom: 3.4 }, { x: 0.3, y: 0.6, zoom: 2.4 }],
    facts: [
      'O modelo 1957, com seus "rabos de peixe", virou símbolo dos anos 50 americanos.',
      'Os Chevrolet de 1955, 1956 e 1957 são chamados pelos fãs de "Tri-Five".',
      'Em 1955 estreou o V8 "small-block" da Chevrolet, família de motores usada por décadas.',
    ],
    trivia: [
      {
        q: 'Como são chamados os Chevrolet de 1955 a 1957?',
        a: 'Tri-Five',
        wrong: ['Big Three', 'Fab Four', 'Golden Trio'],
      },
      {
        q: 'Que detalhe da traseira marcou o Bel Air 1957?',
        a: 'Rabo de peixe',
        wrong: ['Aerofólio', 'Estepe exposto', 'Lanternas no teto'],
      },
    ],
  },

  // ───────────── Itália ─────────────
  {
    id: 'f40',
    make: 'Ferrari',
    model: 'F40',
    years: '1987–1992',
    launch: 1987,
    country: 'Itália',
    route: 'italia',
    crops: [],
    facts: [
      'Comemorou os 40 anos da Ferrari e foi o último carro aprovado pessoalmente por Enzo Ferrari.',
      'Foi o primeiro carro de produção a passar de 320 km/h.',
      'Para economizar peso, as portas abrem puxando um cabo e as janelas originais eram de correr, de plástico.',
    ],
    trivia: [
      {
        q: 'O que o nome F40 comemora?',
        a: 'Os 40 anos da Ferrari',
        wrong: ['40 vitórias na F1', '40 unidades fabricadas', 'Motor de 4.0 litros'],
      },
      {
        q: 'Que motor equipa a F40?',
        a: 'V8 biturbo',
        wrong: ['V12 aspirado', 'V6 elétrico híbrido', '4 cilindros turbo'],
      },
    ],
  },
  {
    id: 'countach',
    make: 'Lamborghini',
    model: 'Countach',
    years: '1974–1990',
    launch: 1974,
    country: 'Itália',
    route: 'italia',
    crops: [],
    facts: [
      'O nome vem de uma expressão de espanto do dialeto piemontês.',
      'Desenhado por Marcello Gandini, popularizou as portas tesoura, que abrem para cima.',
      'A visibilidade traseira era tão ruim que, para dar ré, o motorista sentava na soleira com a porta aberta.',
      'Foi o pôster na parede do quarto de toda uma geração nos anos 80.',
    ],
    trivia: [
      {
        q: 'Como abrem as portas do Countach?',
        a: 'Para cima, tipo tesoura',
        wrong: ['Para trás, tipo suicida', 'Deslizando para o lado', 'Para cima, tipo asa de gaivota'],
      },
      {
        q: 'O que significa "Countach"?',
        a: 'Uma expressão de espanto',
        wrong: ['Touro bravo', 'Relâmpago', 'Velocidade'],
      },
    ],
  },
  {
    id: 'fiat500',
    make: 'Fiat',
    model: '500',
    nickname: 'Cinquecento',
    years: '1957–1975',
    launch: 1957,
    country: 'Itália',
    route: 'italia',
    crops: [],
    facts: [
      'Projetado por Dante Giacosa, motorizou a Itália do pós-guerra.',
      'Tinha motor traseiro de 2 cilindros refrigerado a ar, com cerca de meio litro. Daí o nome 500.',
      'Luigi, o dono da loja de pneus em "Carros", da Pixar, é um Fiat 500 de 1959.',
    ],
    trivia: [
      {
        q: 'Qual personagem de "Carros" (Pixar) é um Fiat 500?',
        a: 'Luigi',
        wrong: ['Guido', 'Mate', 'Sargento'],
      },
      {
        q: 'Quantos cilindros tinha o motor do Fiat 500 original?',
        a: '2',
        wrong: ['3', '4', '6'],
      },
    ],
  },
  {
    id: 'miura',
    make: 'Lamborghini',
    model: 'Miura',
    years: '1966–1973',
    launch: 1966,
    country: 'Itália',
    route: 'italia',
    crops: [],
    facts: [
      'É considerado o primeiro superesportivo de rua com motor central.',
      'O nome homenageia Eduardo Miura, criador espanhol de touros de tourada.',
      'Os "cílios" ao redor dos faróis são um dos detalhes mais famosos do design.',
      'Um Miura laranja aparece na abertura do filme "Um Golpe à Italiana" (1969).',
    ],
    trivia: [
      {
        q: 'O nome Miura homenageia o quê?',
        a: 'Um criador de touros de tourada',
        wrong: ['Uma cidade italiana', 'Um piloto japonês', 'Um vento do Mediterrâneo'],
      },
      {
        q: 'Onde fica o motor V12 do Miura?',
        a: 'Atrás dos bancos, atravessado',
        wrong: ['Na dianteira', 'Atrás do eixo traseiro', 'Sob o assoalho'],
      },
    ],
  },
  {
    id: 'testarossa',
    make: 'Ferrari',
    model: 'Testarossa',
    years: '1984–1991',
    launch: 1984,
    country: 'Itália',
    route: 'italia',
    crops: [],
    facts: [
      '"Testa rossa" significa "cabeça vermelha", por causa das tampas de válvulas pintadas de vermelho.',
      'As grelhas laterais, apelidadas de "ralador de queijo", levam ar aos radiadores.',
      'Um Testarossa branco ficou famoso na série "Miami Vice".',
    ],
    trivia: [
      {
        q: 'O que significa "Testarossa"?',
        a: 'Cabeça vermelha',
        wrong: ['Rosa veloz', 'Teste de corrida', 'Cavalo vermelho'],
      },
      {
        q: 'Em qual série de TV um Testarossa branco fez sucesso?',
        a: 'Miami Vice',
        wrong: ['Magnum', 'A Super Máquina', 'CHiPs'],
      },
    ],
  },
  {
    id: 'delta',
    make: 'Lancia',
    model: 'Delta HF Integrale',
    years: '1987–1994',
    launch: 1987,
    country: 'Itália',
    route: 'italia',
    crops: [],
    facts: [
      'Com o Delta, a Lancia ganhou seis títulos seguidos de construtores no Mundial de Rali (1987–1992), um recorde.',
      'Os para-lamas alargados abrigavam rodas e suspensões mais largas para o rali.',
      'Nasceu como um hatch familiar e virou campeão com tração integral e turbo.',
    ],
    trivia: [
      {
        q: 'Quantos títulos seguidos de construtores no Mundial de Rali a Lancia ganhou com o Delta?',
        a: '6',
        wrong: ['2', '4', '9'],
      },
      {
        q: 'Em qual competição o Delta Integrale brilhou?',
        a: 'Mundial de Rali (WRC)',
        wrong: ['Fórmula 1', '24 Horas de Le Mans', 'NASCAR'],
      },
    ],
  },
];

export const CAR_BY_ID: Record<string, Car> = Object.fromEntries(CARS.map((c) => [c.id, c]));

export const carLabel = (car: Car) => `${car.make} ${car.model}`;

/** Marcas extras usadas como alternativas erradas nas perguntas de marca. */
export const EXTRA_MAKES = ['Renault', 'Peugeot', 'Alfa Romeo', 'Subaru', 'Opel', 'Volvo', 'Jaguar', 'Citroën'];
