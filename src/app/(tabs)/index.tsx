import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Icon, ProgressBar, StatPill, Stars, type IconName } from '@/components/ui';
import { CARS } from '@/data/cars';
import { ehRotaDeVendas, lessonsOfRoute, ROUTES } from '@/data/routes';
import type { Lesson, Route } from '@/data/types';
import { ESTRADA, geometriaEstrada, type Parada } from '@/game/estrada';
import { dayKey, isLessonUnlocked, nivelDe, visibleStreak } from '@/game/progress';
import { buzz } from '@/lib/haptics';
import { DAILY_GOAL_KM, todayKmOf, useProgress } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

export default function RoadScreen() {
  const insets = useSafeAreaInsets();
  const { km, streak, lastPlayed, garage, todayKm, lessons, backupTeste } = useProgress();
  const nivel = nivelDe(Object.keys(lessons).length);
  const shownStreak = visibleStreak(streak, lastPlayed, dayKey());
  const today = todayKmOf(todayKm);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const routeY = useRef<Record<string, number>>({});

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Qual é a <Text style={{ color: colors.accent }}>Nave?</Text>
        </Text>
        <View style={styles.pills}>
          <StatPill icon="fire" color={shownStreak ? colors.fire : colors.textFaint} value={shownStreak} label="Dias seguidos" />
          <StatPill icon="stairs-up" color={colors.accent} value={`Nv ${nivel}`} label={`Nível ${nivel}`} />
          <StatPill icon="speedometer" color={colors.accent} value={km} label="Quilômetros rodados" />
          <StatPill
            icon="garage-variant"
            color={colors.success}
            value={`${Object.keys(garage).length}/${CARS.length}`}
            label="Carros na garagem"
          />
          {backupTeste && <StatPill icon="flask-outline" color={colors.fire} value="Teste" label="Modo teste ligado" />}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsBar}
        contentContainerStyle={styles.chips}>
        {ROUTES.map((route) => {
          const vendas = ehRotaDeVendas(route.id);
          const owned = vendas ? lessonsOfRoute(route.id).filter((l) => l.id in lessons).length : route.carIds.filter((id) => id in garage).length;
          const total = vendas ? lessonsOfRoute(route.id).length : route.carIds.length;
          return (
            <Pressable
              key={route.id}
              accessibilityRole="button"
              accessibilityLabel={`Ir para a rota ${route.title}`}
              onPress={() => {
                buzz('tap');
                scrollRef.current?.scrollTo({ y: Math.max(0, (routeY.current[route.id] ?? 0) - space(2)), animated: true });
              }}
              style={({ pressed }) => [styles.chip, { borderColor: route.color }, pressed && { opacity: 0.7 }]}>
              <Text style={styles.chipText}>
                {route.flag} {route.title}
              </Text>
              <Text style={[styles.chipCount, { color: route.color }]}>
                {owned}/{total}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.goal}>
          <View style={styles.goalTop}>
            <Text style={styles.goalTitle}>Meta do dia</Text>
            <Text style={styles.goalValue}>
              {Math.min(today, DAILY_GOAL_KM)}/{DAILY_GOAL_KM} km
            </Text>
          </View>
          <ProgressBar value={today / DAILY_GOAL_KM} height={10} />
        </View>

        {ROUTES.map((route, i) => (
          <View
            key={route.id}
            onLayout={(e) => {
              routeY.current[route.id] = e.nativeEvent.layout.y;
            }}>
            <RouteSection route={route} number={i + 1} />
          </View>
        ))}

        <View style={styles.endSign}>
          <Icon name="road-variant" size={28} color={colors.textFaint} />
          <Text style={styles.endText}>Novas rotas em breve</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function RouteSection({ route, number }: { route: Route; number: number }) {
  const completed = useProgress((s) => s.lessons);
  const owned = useProgress((s) => route.carIds.filter((id) => id in s.garage).length);
  const routeLessons = lessonsOfRoute(route.id);
  const locked = !isLessonUnlocked(routeLessons[0].id, completed);
  const [largura, setLargura] = useState(0);
  const estados: StopState[] = routeLessons.map((l) => (l.id in completed ? 'done' : isLessonUnlocked(l.id, completed) ? 'current' : 'locked'));

  return (
    <View style={styles.route}>
      {/* Placa de estrada indicando a rota */}
      <View style={[styles.sign, { backgroundColor: locked ? colors.surfaceAlt : route.color }]}>
        <View style={styles.signInner}>
          <Text style={[styles.signKicker, locked && { color: colors.textFaint }]}>
            ROTA {number} {route.flag}
          </Text>
          <Text style={[styles.signTitle, locked && { color: colors.textDim }]}>{route.title}</Text>
          <Text style={[styles.signSubtitle, locked && { color: colors.textFaint }]}>{route.subtitle}</Text>
          <Text style={styles.signCount}>
            {ehRotaDeVendas(route.id)
              ? `${estados.filter((e) => e === 'done').length}/${routeLessons.length} etapas concluídas`
              : `${owned}/${route.carIds.length} carros na garagem`}
          </Text>
        </View>
      </View>

      <View style={[styles.road, { height: ALTURA_ESTRADA }]} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
        {largura > 0 ? (
          <EstradaSinuosa largura={largura} route={route} lessons={routeLessons} estados={estados} completed={completed} inverte={number % 2 === 0} enfeiteBase={number} />
        ) : null}
      </View>
    </View>
  );
}

type StopState = 'done' | 'current' | 'locked';

const ALTURA_ESTRADA = ESTRADA.topo + 3 * ESTRADA.passo + ESTRADA.fim;
const ENFEITES: IconName[] = ['pine-tree', 'traffic-cone', 'sign-direction', 'gas-station'];

/** A pista sinuosa da rota: asfalto em curvas, faixa central na cor da rota no trecho já rodado. */
function EstradaSinuosa(props: {
  largura: number;
  route: Route;
  lessons: Lesson[];
  estados: StopState[];
  completed: Record<string, { stars: number }>;
  inverte: boolean;
  enfeiteBase: number;
}) {
  const { largura, route, lessons, estados, completed, inverte, enfeiteBase } = props;
  const g = geometriaEstrada(largura, lessons.length, inverte);
  // o trecho j chega na parada j (ou, o último, na saída da rota)
  const rodado = (j: number) => (j < lessons.length ? estados[j] !== 'locked' : estados.every((e) => e === 'done'));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={largura} height={g.altura} style={StyleSheet.absoluteFill}>
        {g.trechos.map((d, j) => (
          <Path key={`acostamento${j}`} d={d} stroke={colors.border} strokeWidth={ESTRADA.pista + 10} strokeLinecap="round" fill="none" />
        ))}
        {g.trechos.map((d, j) => (
          <Path key={`asfalto${j}`} d={d} stroke={colors.road} strokeWidth={ESTRADA.pista} strokeLinecap="round" fill="none" />
        ))}
        {g.trechos.map((d, j) => (
          <Path
            key={`faixa${j}`}
            d={d}
            stroke={rodado(j) ? route.color : colors.accentDim}
            strokeWidth={rodado(j) ? 5 : 4}
            strokeDasharray="14 12"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </Svg>
      {g.enfeites.map((e, i) => (
        <View key={`enfeite${i}`} pointerEvents="none" style={{ position: 'absolute', left: e.x - 13, top: e.y - 13, opacity: 0.55 }}>
          <Icon name={ENFEITES[(i + enfeiteBase) % ENFEITES.length]} size={26} color={colors.textFaint} />
        </View>
      ))}
      {lessons.map((lesson, i) => (
        <LessonStop
          key={lesson.id}
          lesson={lesson}
          number={i + 1}
          parada={g.pontos[i]}
          largura={largura}
          color={route.color}
          state={estados[i]}
          stars={completed[lesson.id]?.stars ?? 0}
        />
      ))}
    </View>
  );
}

function LessonStop(props: {
  lesson: Lesson;
  number: number;
  parada: Parada;
  largura: number;
  color: string;
  state: StopState;
  stars: number;
}) {
  const { lesson, number, parada, largura, color, state, stars } = props;
  const locked = state === 'locked';
  // o rótulo fica do lado oposto ao da parada, onde a pista não passa
  const aDireita = parada.lado === 'esquerda';
  const textAlign = aDireita ? 'left' : 'right';
  const posRotulo = aDireita
    ? { left: parada.x + NODE / 2 + 14, right: 0, alignItems: 'flex-start' as const }
    : { left: 0, right: largura - (parada.x - NODE / 2 - 14), alignItems: 'flex-end' as const };

  return (
    <>
      <View pointerEvents="none" style={[styles.stopLabel, posRotulo, { top: parada.y - 50 }]}>
        <Text style={[styles.stopKicker, locked && { color: colors.textFaint }]}>ETAPA {number}</Text>
        <Text style={[styles.stopTitle, { textAlign }, locked && { color: colors.textFaint }]}>{lesson.title}</Text>
        {state === 'done' && <Stars count={stars} size={14} />}
        {state === 'current' && <Text style={[styles.stopCta, { color, textAlign }]}>Toque para começar</Text>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Etapa ${number}: ${lesson.title}${locked ? ' (bloqueada)' : ''}`}
        disabled={locked}
        onPress={() => {
          buzz('tap');
          router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } });
        }}
        style={({ pressed }) => [{ position: 'absolute', left: parada.x - NODE / 2, top: parada.y - NODE / 2 }, pressed && { transform: [{ scale: 0.94 }] }]}>
        {state === 'current' && <Pulse color={color} />}
        <View
          style={[
            styles.node,
            state === 'locked' && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            (state === 'done' || state === 'current') && { backgroundColor: color, borderColor: colors.bg },
          ]}>
          <Icon
            name={
              state === 'locked'
                ? 'lock'
                : state === 'done'
                  ? 'check-bold'
                  : lesson.level === 'challenge'
                    ? 'magnify-plus'
                    : lesson.level === 'review'
                      ? 'refresh'
                      : 'car-sports'
            }
            size={30}
            color={state === 'locked' ? colors.textFaint : colors.bg}
          />
        </View>
      </Pressable>
    </>
  );
}

function Pulse({ color }: { color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 0 })), -1);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - t.value),
    transform: [{ scale: 1 + t.value * 0.45 }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.pulse, { borderColor: color }, style]} />;
}

const NODE = 72;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: space(4),
    paddingTop: space(3),
    paddingBottom: space(3),
    gap: space(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  logo: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  pills: { flexDirection: 'row', gap: space(2), flexWrap: 'wrap' },
  scroll: {
    paddingHorizontal: space(4),
    paddingTop: space(4),
    paddingBottom: space(12),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  chipsBar: { flexGrow: 0, flexShrink: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  chips: { gap: space(2), paddingHorizontal: space(4), paddingVertical: space(3) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2),
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  chipCount: { fontWeight: '800', fontSize: 12, fontVariant: ['tabular-nums'] },
  goal: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: space(2),
    marginBottom: space(6),
  },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between' },
  goalTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  goalValue: { color: colors.textDim, fontWeight: '700', fontSize: 14 },
  route: { marginBottom: space(6) },
  sign: { borderRadius: radius.md, padding: 4 },
  signInner: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.md - 3,
    paddingVertical: space(3),
    paddingHorizontal: space(4),
    gap: 2,
  },
  signKicker: { color: 'rgba(255,255,255,0.85)', fontWeight: '800', fontSize: 12, letterSpacing: 1.2 },
  signTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 22 },
  signSubtitle: { color: 'rgba(255,255,255,0.85)', fontWeight: '600', fontSize: 14 },
  signCount: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, marginTop: space(1), letterSpacing: 0.4 },
  road: { marginTop: 0 },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 4,
  },
  stopLabel: { position: 'absolute', height: 100, justifyContent: 'center', gap: 2 },
  stopKicker: { color: colors.textDim, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  stopTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  stopCta: { fontWeight: '700', fontSize: 13 },
  endSign: { alignItems: 'center', gap: space(2), paddingVertical: space(6) },
  endText: { color: colors.textFaint, fontWeight: '700' },
});
