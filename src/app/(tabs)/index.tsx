import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, ProgressBar, StatPill, Stars } from '@/components/ui';
import { CARS } from '@/data/cars';
import { lessonsOfRoute, ROUTES } from '@/data/routes';
import type { Lesson, Route } from '@/data/types';
import { currentLessonId, dayKey, isLessonUnlocked, visibleStreak } from '@/game/progress';
import { buzz } from '@/lib/haptics';
import { DAILY_GOAL_KM, todayKmOf, useProgress } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

export default function RoadScreen() {
  const insets = useSafeAreaInsets();
  const { km, streak, lastPlayed, lessons, garage, todayKm } = useProgress();
  const shownStreak = visibleStreak(streak, lastPlayed, dayKey());
  const today = todayKmOf(todayKm);
  const current = currentLessonId(lessons);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Qual é a <Text style={{ color: colors.accent }}>Nave?</Text>
        </Text>
        <View style={styles.pills}>
          <StatPill icon="fire" color={shownStreak ? colors.fire : colors.textFaint} value={shownStreak} label="Dias seguidos" />
          <StatPill icon="speedometer" color={colors.accent} value={km} label="Quilômetros rodados" />
          <StatPill
            icon="garage-variant"
            color={colors.success}
            value={`${Object.keys(garage).length}/${CARS.length}`}
            label="Carros na garagem"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
          <RouteSection key={route.id} route={route} number={i + 1} current={current} />
        ))}

        <View style={styles.endSign}>
          <Icon name="road-variant" size={28} color={colors.textFaint} />
          <Text style={styles.endText}>Novas rotas em breve</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function RouteSection({ route, number, current }: { route: Route; number: number; current: string | null }) {
  const completed = useProgress((s) => s.lessons);
  const routeLessons = lessonsOfRoute(route.id);
  const locked = !isLessonUnlocked(routeLessons[0].id, completed);

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
        </View>
      </View>

      <View style={styles.road}>
        {routeLessons.map((lesson, i) => (
          <LessonStop
            key={lesson.id}
            lesson={lesson}
            number={i + 1}
            side={i % 2 === 0 ? 'left' : 'right'}
            color={route.color}
            state={
              lesson.id in completed
                ? 'done'
                : lesson.id === current
                  ? 'current'
                  : isLessonUnlocked(lesson.id, completed)
                    ? 'open'
                    : 'locked'
            }
            stars={completed[lesson.id]?.stars ?? 0}
          />
        ))}
      </View>
    </View>
  );
}

type StopState = 'done' | 'current' | 'open' | 'locked';

function LessonStop(props: {
  lesson: Lesson;
  number: number;
  side: 'left' | 'right';
  color: string;
  state: StopState;
  stars: number;
}) {
  const { lesson, number, side, color, state, stars } = props;
  const locked = state === 'locked';

  const label = (
    <View style={[styles.stopLabel, side === 'left' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
      <Text style={[styles.stopKicker, locked && { color: colors.textFaint }]}>ETAPA {number}</Text>
      <Text
        style={[styles.stopTitle, { textAlign: side === 'left' ? 'right' : 'left' }, locked && { color: colors.textFaint }]}>
        {lesson.title}
      </Text>
      {state === 'done' && <Stars count={stars} size={14} />}
      {state === 'current' && (
        <Text style={[styles.stopCta, { color, textAlign: side === 'left' ? 'right' : 'left' }]}>Toque para começar</Text>
      )}
    </View>
  );

  return (
    <View style={styles.stopRow}>
      <View style={styles.side}>{side === 'left' && label}</View>
      <View style={styles.lane}>
        <LaneDashes />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Etapa ${number}: ${lesson.title}${locked ? ' (bloqueada)' : ''}`}
          disabled={locked}
          onPress={() => {
            buzz('tap');
            router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } });
          }}
          style={({ pressed }) => [pressed && { transform: [{ scale: 0.94 }] }]}>
          {state === 'current' && <Pulse color={color} />}
          <View
            style={[
              styles.node,
              state === 'locked' && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              state === 'open' && { backgroundColor: colors.surface, borderColor: color },
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
              color={state === 'locked' ? colors.textFaint : state === 'open' ? color : colors.bg}
            />
          </View>
        </Pressable>
      </View>
      <View style={styles.side}>{side === 'right' && label}</View>
    </View>
  );
}

function LaneDashes() {
  return (
    <View style={styles.dashes} pointerEvents="none">
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={styles.dash} />
      ))}
    </View>
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
const LANE = 96;

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
  road: { paddingTop: space(2) },
  stopRow: { flexDirection: 'row', alignItems: 'stretch' },
  side: { flex: 1, justifyContent: 'center' },
  lane: {
    width: LANE,
    backgroundColor: colors.road,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space(4),
  },
  dashes: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  dash: { width: 5, height: 14, borderRadius: 2, backgroundColor: colors.accentDim },
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
  stopLabel: { paddingHorizontal: space(3), gap: 2 },
  stopKicker: { color: colors.textDim, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  stopTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  stopCta: { fontWeight: '700', fontSize: 13 },
  endSign: { alignItems: 'center', gap: space(2), paddingVertical: space(6) },
  endText: { color: colors.textFaint, fontWeight: '700' },
});
