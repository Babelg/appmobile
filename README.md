# Qual é a Nave? 🚗❓

> Nome provisório.

Um app de iPhone para **aprender a reconhecer carros jogando**, um pouco por dia, no estilo dos
apps de idiomas, só que com carros. O app mostra só um **pedaço da foto** (um farol, uma grade, uma
lanterna, a linha do teto) e você tenta adivinhar **a marca e o modelo**. Depois de cada resposta,
aparece uma **curiosidade** sobre o carro.

## A ideia

- **Aprender jogando**: lições curtas de 2 a 3 minutos, com progresso visível e motivo para voltar
  todo dia.
- **Imagem recortada como mecânica principal**: a câmera começa bem perto de um detalhe. Se travar,
  dá para "afastar a câmera" e ver mais do carro, mas a resposta vale menos.
- **Curiosidades como recompensa**: toda resposta, certa ou errada, ensina alguma coisa (história,
  cinema, recordes, apelidos).
- **Colecionar**: cada carro que você identifica é estacionado na sua **garagem**, com uma ficha
  completa.

## Como o jogo funciona

**Estrada (tela inicial):** a trilha de aprendizado é desenhada como uma estrada. Cada **rota** é um
tema e tem **4 etapas**:

1. Primeiro contato (3 carros novos)
2. Novos rostos (mais 3 carros)
3. Revisão (os 6 carros da rota)
4. Desafio do zoom (recortes mais fechados, vale mais)

**Tipos de pergunta**

| Tipo | Exemplo |
|---|---|
| Marca pelo detalhe | "De que marca é esse detalhe?" (recorte sem logotipo) |
| Modelo pelo detalhe | "Que carro é esse?" |
| Curiosidade | "Qual banda cantou sobre uma Brasília amarela?" |
| Década | "Em que década este modelo foi lançado?" |

**Regras**
- Errou? A pergunta volta no fim da etapa para fixar.
- **km rodados** são os pontos. Pedir para afastar a câmera custa km.
- **Meta diária** de km, **sequência de dias** seguidos e **estrelas** (1 a 3) por etapa.
- Acertar "que carro é esse?" coloca o carro na **garagem**.

## Conteúdo inicial: 5 rotas, 30 carros

| Rota | Carros |
|---|---|
| 🇧🇷 Clássicos do Brasil | Fusca, Kombi, Opala, Brasília, Gol "quadrado", Uno |
| 🇩🇪 Lendas Alemãs | Porsche 911, Mercedes 300 SL "Asa de Gaivota", Golf GTI, BMW M3 E30, Audi quattro, Classe G |
| 🇯🇵 Japão Raiz | Supra A80, Skyline GT-R R34, MX-5, Corolla AE86, NSX, Lancer Evolution |
| 🇺🇸 Sonho Americano | Mustang, Camaro, Charger, Corvette Sting Ray, Bel Air, Firebird Trans Am |
| 🇮🇹 Paixão Italiana | Fiat 500, Ferrari F40, Countach, Miura, Testarossa, Lancia Delta Integrale |

São cerca de 100 curiosidades e 60 perguntas, além das de marca, modelo e década, que são geradas
automaticamente.

## Visual

Tema escuro de "asfalto à noite", com amarelo de sinalização como destaque. As rotas aparecem como
placas de estrada e as etapas como paradas ao longo da pista. O ícone é uma interrogação cujo ponto
fica no horizonte de uma estrada.

## Tecnologia

- **Expo + React Native + TypeScript**: um só código para iPhone (e Android/web). O app de iPhone é
  gerado na nuvem pelo EAS Build, sem precisar de Mac.
- **Expo Router** (navegação), **Reanimated** (zoom animado), **zustand + AsyncStorage** (progresso
  salvo no aparelho).
- Fotos com licença livre do **Wikimedia Commons**, baixadas e recortadas por um script que também
  gera a página de créditos exigida pelas licenças.
- Testes automatizados da lógica do jogo e da consistência do conteúdo.

## Status

✅ **Protótipo jogável**, com todas as telas acima funcionando.
O código está na branch
[`claude/car-guessing-app-encqgz`](https://github.com/Babelg/appmobile/tree/claude/car-guessing-app-encqgz). O README de lá
explica como rodar, como adicionar carros e como publicar.

## Próximos passos

- [ ] Testar no iPhone (Expo Go) e ajustar
- [ ] Definir o nome final e a identidade visual
- [ ] Mais rotas e carros (França, Inglaterra, Coreia, picapes, F1…)
- [ ] Desafio diário igual para todos, com placar para compartilhar
- [ ] "Tanque de combustível": vidas que recarregam com o tempo (base para um plano premium)
- [ ] Novas perguntas: ronco do motor, lanterna traseira, silhueta
- [ ] Notificação diária para não perder a sequência
- [ ] Conta, sincronização e ranking entre amigos
- [ ] Versões em inglês e espanhol
- [ ] Publicar na App Store (conta Apple Developer, política de privacidade, prints)

## Direitos

App independente, sem afiliação com nenhuma montadora. Marcas e nomes de modelos pertencem aos seus
donos e são usados só para identificação. As fotos vêm do Wikimedia Commons, sob licenças Creative
Commons e similares, com autor e licença creditados dentro do app.
