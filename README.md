# Qual é a Nave? 🚗❓

Quiz de carros no estilo "aprenda um pouco por dia": a foto aparece **recortada** em um detalhe
(farol, grade, lanterna…) e você tenta adivinhar a marca e o modelo. Se precisar, "afasta a câmera"
para ver mais, mas ganha menos km. Depois de cada resposta, aparece uma curiosidade sobre o carro.

> Nome provisório. Para trocar, mude `name` em `app.json` e o logo em `src/app/(tabs)/index.tsx`.

## O que já tem

- **Estrada** (tela inicial): 5 rotas temáticas (Brasil, Alemanha, Japão, EUA, Itália), cada uma
  com 4 etapas: duas de apresentação, uma revisão e um "desafio do zoom".
- **Lição**: perguntas de marca, de modelo, curiosidades e década de lançamento. Os erros voltam
  no fim da etapa para fixar. Feedback com vibração (haptics) no iPhone.
- **Progresso**: km rodados (pontos), meta diária, sequência de dias, estrelas por etapa.
  Tudo salvo no aparelho (AsyncStorage).
- **Garagem**: cada carro que você identifica fica guardado, com ficha e curiosidades.
- **Créditos** das fotos (exigido pelas licenças Creative Commons).
- 30 carros com fotos do Wikimedia Commons, 60 perguntas de curiosidade e ~100 curiosidades.

## Rodando

```bash
npm install
npm start          # abre o Expo; leia o QR code com o app Expo Go no iPhone
npm run web        # versão web, para testar no navegador
npm test           # testes da lógica do jogo e do conteúdo
npm run typecheck
npm run lint
```

## Estrutura

```
src/app/            telas (Expo Router: cada arquivo é uma rota)
  (tabs)/index.tsx  Estrada (trilha de etapas)
  (tabs)/garage.tsx Garagem
  (tabs)/profile.tsx Perfil
  lesson/[id].tsx   Lição
  car/[id].tsx      Ficha do carro
  credits.tsx       Créditos das fotos
src/data/           conteúdo: carros, rotas, créditos, mapa de imagens
src/game/           lógica pura (gera perguntas, pontuação, sequência) + testes
src/store/          progresso do jogador (zustand + AsyncStorage)
scripts/            baixa e recorta as fotos do Wikimedia Commons
```

## Adicionando um carro

1. Ache uma foto com licença livre no [Wikimedia Commons](https://commons.wikimedia.org)
   e adicione em `scripts/car-images.json` (`centerX`/`centerY` ajustam o recorte 4:3).
2. Rode `npm run images` (precisa de Python 3 com Pillow). Isso gera `assets/cars/<id>.jpg`,
   os créditos e o mapa de imagens.
3. Adicione o carro em `src/data/cars.ts` (recortes, curiosidades, perguntas) e o id em uma rota
   de `src/data/routes.ts`.
4. `npm test` confere se tudo está consistente.

Os recortes (`crops`) usam coordenadas de 0 a 1 sobre a foto 4:3. O primeiro recorte é usado na
pergunta de marca e deve evitar logotipos; o segundo, na pergunta de modelo.

## Próximos passos (ideias)

- Mais rotas e carros (França, Inglaterra, Coreia, picapes, F1, motos…).
- Desafio diário: 5 recortes iguais para todo mundo, com placar para compartilhar.
- "Tanque de combustível": vidas que recarregam com o tempo (e base para um plano premium).
- Novos tipos de pergunta: ouvir o ronco do motor, adivinhar pela lanterna traseira, pela silhueta.
- Sons, animação de "câmera afastando" mais caprichada, conquistas.
- Notificação diária para não perder a sequência (expo-notifications).
- Conta + sincronização na nuvem e ranking entre amigos.
- Versão em inglês/espanhol para lançar fora do Brasil.

## Publicando na App Store

1. Conta no [Apple Developer Program](https://developer.apple.com/programs/) (US$ 99/ano).
2. Troque `ios.bundleIdentifier` em `app.json` (ex.: `com.seunome.qualeanave`).
3. `npx eas-cli@latest build -p ios` gera o app na nuvem (não precisa de Mac).
4. `npx eas-cli@latest submit -p ios` envia para o App Store Connect → TestFlight → revisão.

Checklist para a revisão da Apple:
- Política de privacidade (o app não coleta dados; mesmo assim a Apple pede uma URL).
- Prints de tela do iPhone (6,9" e 6,5").
- O app já mostra que é independente das montadoras e credita todas as fotos.
