import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarPhoto } from '@/components/CarPhoto';
import { CarSpecCard } from '@/components/CarSpecs';
import { Button, Icon } from '@/components/ui';
import { CAR_BY_ID } from '@/data/cars';
import type { Car } from '@/data/types';
import {
  acertouTudo,
  ANO_PERTO,
  avaliar,
  buscarCarros,
  carroDeTreino,
  faixaDoAno,
  focoDoDiario,
  kmDoDiario,
  numeroDoDia,
  TENTATIVAS,
  terminou,
  textoCompartilhar,
  travas,
  zoomDaTentativa,
  type Avaliacao,
  type Cor,
  type Palpite,
} from '@/game/diario';
import { dayKey } from '@/game/progress';
import { mulberry32 } from '@/game/random';
import { buzz } from '@/lib/haptics';
import { useSons } from '@/lib/sons';
import { diarioDeHoje, useProgress, type DiarioStats } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

const ANO_MIN = 1930;
const ANO_MAX = new Date().getFullYear() + 1;

type Treino = { carId: string; palpites: Palpite[] };

export default function DiarioScreen() {
  const insets = useSafeAreaInsets();
  const tocarSom = useSons();
  const diario = useProgress((s) => s.diario);
  const stats = useProgress((s) => s.diarioStats);
  const chutarDiario = useProgress((s) => s.chutarDiario);

  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const hoje = dayKey(new Date(agora));
  const partida = diarioDeHoje(diario, hoje);

  const [treino, setTreino] = useState<Treino | null>(null);
  const [rng] = useState(() => mulberry32(Math.floor(Math.random() * 2 ** 31)));
  const [ajuda, setAjuda] = useState(() => stats.jogados === 0 && partida.palpites.length === 0);

  const alvo = CAR_BY_ID[treino ? treino.carId : partida.carId];
  const palpites = treino ? treino.palpites : partida.palpites;
  const avaliacoes = palpites.map((p) => avaliar(p, alvo));
  const fim = terminou(avaliacoes);
  const venceu = acertouTudo(avaliacoes.at(-1));
  const km = treino ? 0 : kmDoDiario(avaliacoes);
  const foco = focoDoDiario(alvo);

  function chutar(p: Palpite) {
    // som de acerto quando fecha tudo ou destrava um campo novo; de erro quando não avança
    const antes = travas(palpites, alvo);
    const av = avaliar(p, alvo);
    const ok =
      acertouTudo(av) ||
      (av.marca === 'certo' && !antes.marca) ||
      (av.modelo === 'certo' && !antes.carId) ||
      (av.ano === 'certo' && !antes.ano);
    tocarSom(ok);
    buzz(ok ? 'success' : 'error');
    if (treino) setTreino({ ...treino, palpites: [...treino.palpites, p] });
    else chutarDiario(p);
  }

  function novoTreino() {
    setTreino({ carId: carroDeTreino(rng, [partida.carId, ...(treino ? [treino.carId] : [])]).id, palpites: [] });
  }

  return (
    <ScrollView
      style={styles.screen}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space(4) }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{treino ? 'Treino livre' : 'Nave do Dia'}</Text>
          <Text style={styles.subtitle}>
            {treino ? 'Carro aleatório · não vale km' : `#${numeroDoDia(hoje)} · ${dataPorExtenso(agora)}`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ajuda ? 'Esconder como jogar' : 'Como jogar'}
          onPress={() => setAjuda(!ajuda)}
          hitSlop={8}
          style={({ pressed }) => [styles.helpButton, pressed && { opacity: 0.7 }]}>
          <Icon name={ajuda ? 'close' : 'help'} size={20} color={colors.text} />
        </Pressable>
      </View>

      {ajuda && <ComoJogar />}

      <View style={styles.photoCard}>
        <CarPhoto
          key={alvo.id}
          carId={alvo.id}
          focusX={foco.x}
          focusY={foco.y}
          zoom={fim ? 1 : zoomDaTentativa(alvo, palpites.length)}
        />
        <View style={styles.photoBadge}>
          <Icon name={fim ? 'eye-outline' : 'magnify-plus-outline'} size={16} color={colors.text} />
          <Text style={styles.photoBadgeText}>
            {fim ? 'Foto revelada' : `Palpite ${palpites.length + 1} de ${TENTATIVAS}`}
          </Text>
        </View>
      </View>

      {!fim && <Formulario key={`${alvo.id}-${palpites.length}`} alvo={alvo} palpites={palpites} onChutar={chutar} />}

      <Historico avaliacoes={avaliacoes} palpites={palpites} mostrarVazios={!fim} />

      {fim && (
        <Animated.View entering={FadeInDown.duration(350)} style={{ gap: space(3) }}>
          <Resultado alvo={alvo} venceu={venceu} usados={palpites.length} km={km} treino={!!treino} />
          {!treino && <Placar stats={stats} />}
          {!treino ? (
            <>
              <Text style={styles.proxima}>Próxima Nave em {tempoAteAmanha(agora)}</Text>
              <BotaoCompartilhar texto={textoCompartilhar(numeroDoDia(hoje), avaliacoes)} />
              <Button title="Treinar com outro carro" icon="dumbbell" variant="secondary" onPress={novoTreino} />
              {venceu && (
                <Button
                  title="Ver na garagem"
                  icon="garage-variant"
                  variant="secondary"
                  onPress={() => router.push({ pathname: '/car/[id]', params: { id: alvo.id } })}
                />
              )}
            </>
          ) : (
            <>
              <Button title="Outro carro" icon="refresh" onPress={novoTreino} />
              <Button title="Voltar para a Nave do Dia" variant="secondary" onPress={() => setTreino(null)} />
            </>
          )}
          <CarSpecCard carId={alvo.id} fact={alvo.facts[0]} />
        </Animated.View>
      )}

      {!fim && treino && (
        <Button title="Voltar para a Nave do Dia" variant="secondary" onPress={() => setTreino(null)} />
      )}
    </ScrollView>
  );
}

// --- formulário do palpite ----------------------------------------------------------------------

function Formulario({ alvo, palpites, onChutar }: { alvo: Car; palpites: Palpite[]; onChutar: (p: Palpite) => void }) {
  const trava = travas(palpites, alvo);
  const faixa = faixaDoAno(palpites, alvo);
  const ultimoAno = palpites.at(-1)?.ano;
  const [busca, setBusca] = useState('');
  const [escolhido, setEscolhido] = useState<string | null>(trava.carId);
  const [anoTexto, setAnoTexto] = useState(trava.ano ? String(trava.ano) : ultimoAno ? String(ultimoAno) : '');

  const ano = Number(anoTexto);
  const anoValido = anoTexto.length === 4 && ano >= ANO_MIN && ano <= ANO_MAX;
  const carro = escolhido ? CAR_BY_ID[escolhido] : null;
  const sugestoes = carro ? [] : buscarCarros(busca, trava.marca);
  const jaChutados = new Set(palpites.map((p) => p.carId));

  function mudarAno(delta: number) {
    const base = anoValido ? ano : (faixa.min ?? faixa.max ?? 2010);
    setAnoTexto(String(Math.min(ANO_MAX, Math.max(ANO_MIN, base + delta))));
  }

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.form}>
      <Text style={styles.label}>CARRO</Text>
      {trava.carId && carro ? (
        <Travado texto={`${carro.make} ${carro.model}`} />
      ) : carro ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Trocar ${carro.make} ${carro.model}`}
          onPress={() => {
            setEscolhido(null);
            setBusca('');
          }}
          style={styles.escolhido}>
          <View style={{ flex: 1 }}>
            <Text style={styles.escolhidoMarca}>{carro.make}</Text>
            <Text style={styles.escolhidoModelo}>{carro.model}</Text>
          </View>
          <Icon name="close-circle" size={22} color={colors.textDim} />
        </Pressable>
      ) : (
        <>
          <View style={styles.inputBox}>
            <Icon name="magnify" size={20} color={colors.textFaint} />
            <TextInput
              accessibilityLabel="Buscar marca ou modelo"
              value={busca}
              onChangeText={setBusca}
              placeholder={trava.marca ? `Modelo da ${trava.marca}…` : 'Digite a marca ou o modelo'}
              placeholderTextColor={colors.textFaint}
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
          {trava.marca && <Text style={styles.dica}>Marca certa: {trava.marca}. Agora é só o modelo.</Text>}
          {sugestoes.length > 0 && (
            <View style={styles.sugestoes}>
              {sugestoes.map((c) => {
                const repetido = jaChutados.has(c.id);
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Escolher ${c.make} ${c.model}`}
                    onPress={() => setEscolhido(c.id)}
                    style={({ pressed }) => [styles.sugestao, pressed && { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.sugestaoMarca, repetido && styles.apagado]}>{c.make}</Text>
                    <Text style={[styles.sugestaoModelo, repetido && styles.apagado]} numberOfLines={1}>
                      {c.model}
                      {repetido ? ' · já chutado' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {!trava.marca && busca.trim().length > 0 && sugestoes.length === 0 && (
            <Text style={styles.dica}>Nenhum carro do catálogo com esse nome.</Text>
          )}
        </>
      )}

      <Text style={[styles.label, { marginTop: space(2) }]}>ANO DE LANÇAMENTO</Text>
      {trava.ano ? (
        <Travado texto={String(trava.ano)} />
      ) : (
        <>
          <View style={styles.anoRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Ano anterior" onPress={() => mudarAno(-1)} style={styles.anoBotao}>
              <Icon name="minus" size={22} color={colors.text} />
            </Pressable>
            <TextInput
              accessibilityLabel="Ano de lançamento"
              value={anoTexto}
              onChangeText={(t) => setAnoTexto(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="ex.: 2012"
              placeholderTextColor={colors.textFaint}
              keyboardType="number-pad"
              maxLength={4}
              style={[styles.input, styles.anoInput]}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Próximo ano" onPress={() => mudarAno(1)} style={styles.anoBotao}>
              <Icon name="plus" size={22} color={colors.text} />
            </Pressable>
          </View>
          {(faixa.min !== null || faixa.max !== null) && (
            <Text style={styles.dica}>
              Pelas setas: {faixa.min !== null && faixa.max !== null
                ? `entre ${faixa.min} e ${faixa.max}`
                : faixa.min !== null
                  ? `${faixa.min} ou depois`
                  : `${faixa.max} ou antes`}
              .
            </Text>
          )}
        </>
      )}

      <Button
        title="Chutar"
        icon="send"
        disabled={!carro || !anoValido}
        onPress={() => carro && onChutar({ carId: carro.id, ano })}
        style={{ marginTop: space(2) }}
      />
    </Animated.View>
  );
}

function Travado({ texto }: { texto: string }) {
  return (
    <View style={[styles.escolhido, styles.travado]}>
      <Icon name="check-circle" size={20} color={colors.success} />
      <Text style={[styles.escolhidoModelo, { color: colors.success, flex: 1 }]}>{texto}</Text>
      <Icon name="lock" size={18} color={colors.success} />
    </View>
  );
}

// --- histórico ----------------------------------------------------------------------------------

const COR: Record<Cor, { bg: string; borda: string; texto: string }> = {
  certo: { bg: colors.successBg, borda: colors.success, texto: colors.success },
  perto: { bg: colors.accentDim, borda: colors.accent, texto: colors.accent },
  errado: { bg: colors.surfaceAlt, borda: colors.border, texto: colors.textDim },
};

function Historico({ avaliacoes, palpites, mostrarVazios }: { avaliacoes: Avaliacao[]; palpites: Palpite[]; mostrarVazios: boolean }) {
  if (!palpites.length && !mostrarVazios) return null;
  const vazios = mostrarVazios ? TENTATIVAS - palpites.length : 0;
  return (
    <View style={styles.historico}>
      <View style={styles.histHeader}>
        <Text style={[styles.label, { flex: 1.1 }]}>MARCA</Text>
        <Text style={[styles.label, { flex: 1.3 }]}>MODELO</Text>
        <Text style={[styles.label, { flex: 0.9 }]}>ANO</Text>
      </View>
      {palpites.map((p, i) => {
        const car = CAR_BY_ID[p.carId];
        const a = avaliacoes[i];
        return (
          <Animated.View key={i} entering={FadeInDown.duration(250)} style={styles.histRow}>
            <Celula cor={a.marca} texto={car.make} flex={1.1} />
            <Celula cor={a.modelo} texto={car.model} flex={1.3} />
            <Celula
              cor={a.ano}
              texto={String(p.ano)}
              flex={0.9}
              icone={a.seta === 'acima' ? 'arrow-up-bold' : a.seta === 'abaixo' ? 'arrow-down-bold' : undefined}
              rotulo={a.seta === 'acima' ? 'o carro é mais novo' : a.seta === 'abaixo' ? 'o carro é mais antigo' : undefined}
            />
          </Animated.View>
        );
      })}
      {Array.from({ length: vazios }, (_, i) => (
        <View key={`v${i}`} style={styles.histRow}>
          <View style={[styles.celula, styles.vazia, { flex: 1.1 }]} />
          <View style={[styles.celula, styles.vazia, { flex: 1.3 }]} />
          <View style={[styles.celula, styles.vazia, { flex: 0.9 }]} />
        </View>
      ))}
    </View>
  );
}

function Celula({
  cor,
  texto,
  flex,
  icone,
  rotulo,
}: {
  cor: Cor;
  texto: string;
  flex: number;
  icone?: 'arrow-up-bold' | 'arrow-down-bold';
  rotulo?: string;
}) {
  const c = COR[cor];
  return (
    <View
      accessibilityLabel={`${texto}: ${cor}${rotulo ? `, ${rotulo}` : ''}`}
      style={[styles.celula, { flex, backgroundColor: c.bg, borderColor: c.borda }]}>
      <Text style={[styles.celulaTexto, { color: c.texto }]} numberOfLines={2}>
        {texto}
      </Text>
      {icone && <Icon name={icone} size={16} color={c.texto} />}
    </View>
  );
}

// --- fim de jogo --------------------------------------------------------------------------------

function Resultado({ alvo, venceu, usados, km, treino }: { alvo: Car; venceu: boolean; usados: number; km: number; treino: boolean }) {
  return (
    <View style={[styles.resultado, { borderColor: venceu ? colors.success : colors.border }]}>
      <Icon name={venceu ? 'trophy' : 'car-off'} size={34} color={venceu ? colors.accent : colors.textDim} />
      <Text style={styles.resultadoTitulo}>
        {venceu ? (usados === 1 ? 'De primeira!' : `Acertou em ${usados} de ${TENTATIVAS}!`) : 'Não foi dessa vez'}
      </Text>
      <Text style={styles.resultadoTexto}>
        Era o {alvo.make} {alvo.model}, lançado em {alvo.launch}.
        {venceu && !treino ? ' Ele já está estacionado na sua garagem.' : ''}
      </Text>
      {!treino && (
        <View style={styles.kmPill}>
          <Icon name="speedometer" size={18} color={colors.accent} />
          <Text style={styles.kmTexto}>+{km} km</Text>
        </View>
      )}
    </View>
  );
}

function Placar({ stats }: { stats: DiarioStats }) {
  const pct = stats.jogados ? Math.round((stats.vitorias / stats.jogados) * 100) : 0;
  const maior = Math.max(1, ...stats.porTentativa);
  return (
    <View style={styles.placar}>
      <View style={styles.placarNumeros}>
        <Numero valor={stats.jogados} rotulo="jogos" />
        <Numero valor={`${pct}%`} rotulo="acertos" />
        <Numero valor={stats.sequencia} rotulo="sequência" />
        <Numero valor={stats.melhor} rotulo="melhor" />
      </View>
      <Text style={styles.label}>ACERTOS POR PALPITE</Text>
      {stats.porTentativa.map((n, i) => (
        <View key={i} style={styles.barraLinha}>
          <Text style={styles.barraNum}>{i + 1}</Text>
          <View style={[styles.barra, { width: `${Math.max(8, (n / maior) * 100)}%`, backgroundColor: n ? colors.success : colors.surfaceAlt }]}>
            <Text style={styles.barraValor}>{n}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Numero({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.numero}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

function BotaoCompartilhar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  async function compartilhar() {
    try {
      await Share.share({ message: texto });
      return;
    } catch {
      // sem folha de compartilhar (navegador de computador): copia o texto
    }
    const nav = (globalThis as { navigator?: { clipboard?: { writeText(t: string): Promise<void> } } }).navigator;
    try {
      await nav?.clipboard?.writeText(texto);
      setCopiado(true);
    } catch {}
  }
  return <Button title={copiado ? 'Copiado! É só colar' : 'Compartilhar resultado'} icon="share-variant" onPress={compartilhar} />;
}

// --- como jogar ---------------------------------------------------------------------------------

function ComoJogar() {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.ajuda}>
      <Text style={styles.ajudaTitulo}>Como jogar</Text>
      <Text style={styles.ajudaTexto}>
        Todo dia aparece um carro novo, o mesmo para todo mundo. A câmera começa colada num detalhe e você tem{' '}
        {TENTATIVAS} palpites para acertar a <Text style={styles.forte}>marca</Text>, o{' '}
        <Text style={styles.forte}>modelo</Text> e o <Text style={styles.forte}>ano de lançamento</Text> da geração da
        foto. A cada palpite, a câmera se afasta um pouco.
      </Text>
      <Legenda cor="certo" texto="Acertou. Fica preenchido nos próximos palpites." />
      <Legenda cor="perto" texto={`Ano quase lá: até ${ANO_PERTO} anos de diferença.`} />
      <Legenda cor="errado" texto="Errou. No ano, a seta mostra se o carro é mais novo (↑) ou mais antigo (↓)." />
      <Text style={styles.ajudaTexto}>
        Acertar tudo vale <Text style={styles.forte}>60 km</Text> no 1º palpite, 50 no 2º e assim por diante até 10 no
        último. Errou tudo? Ainda ganha uns km pelo que acertou. E o carro da Nave vai para a sua garagem.
      </Text>
    </Animated.View>
  );
}

function Legenda({ cor, texto }: { cor: Cor; texto: string }) {
  return (
    <View style={styles.legenda}>
      <View style={[styles.legendaCor, { backgroundColor: COR[cor].bg, borderColor: COR[cor].borda }]} />
      <Text style={[styles.ajudaTexto, { flex: 1 }]}>{texto}</Text>
    </View>
  );
}

// --- datas --------------------------------------------------------------------------------------

function dataPorExtenso(agora: number) {
  try {
    return new Date(agora).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return dayKey(new Date(agora));
  }
}

function tempoAteAmanha(agora: number) {
  const d = new Date(agora);
  const amanha = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  const min = Math.max(1, Math.ceil((amanha - agora) / 60_000));
  const h = Math.floor(min / 60);
  return h ? `${h} h ${min % 60} min` : `${min} min`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: space(4),
    paddingBottom: space(12),
    gap: space(3),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.textDim, fontSize: 14, fontWeight: '600', marginTop: 2 },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCard: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  photoBadge: {
    position: 'absolute',
    top: space(3),
    left: space(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14,17,21,0.78)',
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: 6,
  },
  photoBadgeText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: space(2),
  },
  label: { color: colors.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2),
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space(3),
  },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700', paddingVertical: space(3), minWidth: 0 },
  sugestoes: { borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  sugestao: { paddingHorizontal: space(3), paddingVertical: space(2), borderBottomWidth: 1, borderBottomColor: colors.border },
  sugestaoMarca: { color: colors.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  sugestaoModelo: { color: colors.text, fontSize: 16, fontWeight: '700' },
  apagado: { color: colors.textFaint },
  escolhido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2),
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: space(3),
    paddingVertical: space(2),
  },
  travado: { borderColor: colors.success, backgroundColor: colors.successBg, paddingVertical: space(3) },
  escolhidoMarca: { color: colors.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  escolhidoModelo: { color: colors.text, fontSize: 17, fontWeight: '800' },
  dica: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  anoRow: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  anoBotao: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anoInput: {
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space(2),
  },
  historico: { gap: space(2) },
  histHeader: { flexDirection: 'row', gap: space(2), paddingHorizontal: 2 },
  histRow: { flexDirection: 'row', gap: space(2) },
  celula: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    paddingHorizontal: space(2),
    paddingVertical: space(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  celulaTexto: { fontSize: 13, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  vazia: { borderStyle: 'dashed', borderColor: colors.border, backgroundColor: 'transparent' },
  resultado: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: space(5),
    alignItems: 'center',
    gap: space(2),
  },
  resultadoTitulo: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  resultadoTexto: { color: colors.textDim, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  kmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: space(4),
    paddingVertical: space(2),
    marginTop: space(1),
  },
  kmTexto: { color: colors.text, fontWeight: '900', fontSize: 16 },
  proxima: { color: colors.textDim, textAlign: 'center', fontWeight: '700' },
  placar: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: space(2),
  },
  placarNumeros: { flexDirection: 'row', marginBottom: space(2) },
  numero: { color: colors.text, fontSize: 24, fontWeight: '900' },
  numeroRotulo: { color: colors.textDim, fontSize: 12, fontWeight: '700' },
  barraLinha: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  barraNum: { color: colors.textDim, fontWeight: '800', width: 14, textAlign: 'center' },
  barra: { borderRadius: 6, paddingHorizontal: space(2), paddingVertical: 3, alignItems: 'flex-end' },
  barraValor: { color: colors.text, fontWeight: '800', fontSize: 12 },
  ajuda: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: space(3),
  },
  ajudaTitulo: { color: colors.text, fontSize: 20, fontWeight: '900' },
  ajudaTexto: { color: colors.textDim, fontSize: 15, lineHeight: 21 },
  forte: { color: colors.text, fontWeight: '800' },
  legenda: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  legendaCor: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5 },
});
