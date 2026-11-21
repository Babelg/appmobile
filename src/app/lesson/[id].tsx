import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarPhoto } from '@/components/CarPhoto';
import { OptionButton, type OptionState } from '@/components/OptionButton';
import { Button, Icon, ProgressBar, Stars, type IconName } from '@/components/ui';
import { CAR_BY_ID } from '@/data/cars';
import { LESSON_BY_ID, ROUTE_BY_ID } from '@/data/routes';
import type { Car } from '@/data/types';
import {
  buildLesson,
  kmForAnswer,
  LESSON_BONUS_KM,
  PERFECT_BONUS_KM,
  retryOf,
  zoomLevels,
  type Option,
  type Question,
} from '@/game/questions';
import { mulberry32 } from '@/game/random';
import { buzz } from '@/lib/haptics';
import { useProgress, type LessonSummary } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

type Tally = { km: number; answered: number; correct: number; identified: string[] };
type Result = LessonSummary & { km: number; accuracy: number };

const CHEERS = ['Mandou bem!', 'Na mosca!', 'Olho clínico!', 'Acertou em cheio!', 'Isso aí!'];

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSON_BY_ID[id];
  if (!lesson) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.prompt}>Etapa não encontrada.</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }
  return <LessonPlayer lessonId={lesson.id} />;
}

function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = LESSON_BY_ID[lessonId];
  const route = ROUTE_BY_ID[lesson.route];
  const insets = useSafeAreaInsets();
  const finishLesson = useProgress((s) => s.finishLesson);

  const [rng] = useState(() => mulberry32(Math.floor(Math.random() * 2 ** 31)));
  const [queue, setQueue] = useState<Question[]>(() => buildLesson(lesson, rng));
  const [index, setIndex] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [tally, setTally] = useState<Tally>({ km: 0, answered: 0, correct: 0, identified: [] });
  const [result, setResult] = useState<Result | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);

  if (result) return <LessonDone result={result} onClose={() => router.back()} />;

  const q = queue[index];
  const car = CAR_BY_ID[q.carId];
  const isRetry = q.key.endsWith('-retry');
  const levels = q.crop ? zoomLevels(q.crop) : [1];
  const answered = picked !== null;
  const correct = picked === q.answer;
  const zoom = answered ? 1 : levels[zoomStep];

  function choose(i: number) {
    if (answered) return;
    const ok = i === q.answer;
    setPicked(i);
    buzz(ok ? 'success' : 'error');
    const km = ok ? kmForAnswer(q, { zoomOuts: zoomStep, retry: isRetry, level: lesson.level }) : 0;
    setTally((t) => ({
      km: t.km + km,
      answered: t.answered + (isRetry ? 0 : 1),
      correct: t.correct + (ok && !isRetry ? 1 : 0),
      identified:
        ok && !isRetry && q.kind === 'identify' ? [...t.identified, q.carId] : t.identified,
    }));
    // Errou? A pergunta volta no fim da etapa (uma vez).
    if (!ok && !isRetry) setQueue((qs) => [...qs, retryOf(q, rng)]);
  }

  function next() {
    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setPicked(null);
      setZoomStep(0);
      return;
    }
    const accuracy = tally.answered ? tally.correct / tally.answered : 0;
    const km = tally.km + LESSON_BONUS_KM + (accuracy === 1 ? PERFECT_BONUS_KM : 0);
    const summary = finishLesson({
      lessonId,
      km,
      answered: tally.answered,
      correct: tally.correct,
      identified: tally.identified,
    });
    setResult({ ...summary, km, accuracy });
  }

  function optionState(i: number): OptionState {
    if (!answered) return 'idle';
    if (i === q.answer) return 'correct';
    if (i === picked) return 'wrong';
    return 'dim';
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space(2) }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da etapa"
          hitSlop={12}
          onPress={() => setConfirmExit(true)}>
          <Icon name="close" size={28} color={colors.textDim} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(index + (answered ? 1 : 0)) / queue.length} color={route.color} />
        </View>
        <View style={styles.kmBadge}>
          <Icon name="speedometer" size={18} color={colors.accent} />
          <Text style={styles.kmText}>{tally.km}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: answered ? 300 : space(8) }]}
        showsVerticalScrollIndicator={false}>
        <Animated.View key={q.key} entering={FadeInDown.duration(250)} style={{ gap: space(4) }}>
          {isRetry && <Text style={styles.retryTag}>REVISANDO UM ERRO</Text>}
          <Text style={styles.prompt}>{q.prompt}</Text>

          <View style={styles.photoWrap}>
            <CarPhoto carId={q.carId} focusX={q.crop?.x} focusY={q.crop?.y} zoom={zoom} />
            {(answered || !q.crop) && <Caption car={car} />}
            {q.crop && !answered && zoomStep < levels.length - 1 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Afastar a câmera (dica)"
                style={({ pressed }) => [styles.zoomBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  buzz('tap');
                  setZoomStep((s) => s + 1);
                }}>
                <Icon name="magnify-minus-outline" size={18} color={colors.text} />
                <Text style={styles.zoomText}>Afastar · −3 km</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.options}>
            {q.options.map((o, i) => (
              <OptionButton
                key={`${q.key}-${o.sub ?? ''}${o.label}`}
                index={i}
                label={o.label}
                sub={o.sub}
                state={optionState(i)}
                onPress={() => choose(i)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {answered && (
        <Feedback
          correct={correct}
          answer={q.options[q.answer]}
          fact={q.fact}
          cheer={CHEERS[index % CHEERS.length]}
          bottomInset={insets.bottom}
          onNext={next}
        />
      )}

      {confirmExit && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Sair da etapa?</Text>
            <Text style={styles.dialogText}>O progresso desta etapa vai se perder.</Text>
            <Button title="Continuar jogando" onPress={() => setConfirmExit(false)} />
            <Button title="Sair" variant="secondary" onPress={() => router.back()} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function Caption({ car }: { car: Car }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.caption}>
      <Text style={styles.captionMake}>{car.make}</Text>
      <Text style={styles.captionModel}>{car.model}</Text>
    </Animated.View>
  );
}

function Feedback(props: {
  correct: boolean;
  answer: Option;
  fact: string;
  cheer: string;
  bottomInset: number;
  onNext: () => void;
}) {
  const { correct, answer, fact, cheer, bottomInset, onNext } = props;
  const tint = correct ? colors.success : colors.danger;
  return (
    <Animated.View
      entering={SlideInDown.duration(260)}
      style={[
        styles.feedback,
        {
          paddingBottom: bottomInset + space(4),
          backgroundColor: correct ? colors.successBg : colors.dangerBg,
          borderColor: tint,
        },
      ]}>
      <View style={styles.feedbackInner}>
        <View style={styles.row}>
          <Icon name={correct ? 'check-circle' : 'close-circle'} size={28} color={tint} />
          <Text style={[styles.feedbackTitle, { color: tint }]}>{correct ? cheer : 'Não foi dessa vez'}</Text>
        </View>
        {!correct && (
          <Text style={styles.answerLine}>
            Resposta: <Text style={styles.answerStrong}>{answer.sub ? `${answer.sub} ${answer.label}` : answer.label}</Text>
          </Text>
        )}
        <View style={styles.factBox}>
          <Icon name="lightbulb-on-outline" size={20} color={colors.accent} />
          <Text style={styles.factText}>{fact}</Text>
        </View>
        <Button title="Continuar" variant={correct ? 'success' : 'danger'} onPress={onNext} />
      </View>
    </Animated.View>
  );
}

function LessonDone({ result, onClose }: { result: Result; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const pct = Math.round(result.accuracy * 100);
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.doneContent,
        { paddingTop: insets.top + space(10), paddingBottom: insets.bottom + space(6) },
      ]}>
      <Animated.View entering={ZoomIn.springify()}>
        <Icon name="flag-checkered" size={84} color={colors.accent} />
      </Animated.View>
      <Text style={styles.doneTitle}>Etapa concluída!</Text>
      <Animated.View entering={FadeInDown.delay(200)}>
        <Stars count={result.stars} size={40} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)} style={styles.statsRow}>
        <StatBox icon="speedometer" color={colors.accent} value={`+${result.km}`} label="km rodados" />
        <StatBox icon="bullseye-arrow" color={colors.success} value={`${pct}%`} label="precisão" />
        <StatBox icon="fire" color={colors.fire} value={String(result.streak)} label={result.streak === 1 ? 'dia seguido' : 'dias seguidos'} />
      </Animated.View>

      {result.streakUp && (
        <Text style={styles.streakNote}>
          {result.streak === 1 ? 'Sequência iniciada! Volte amanhã para manter.' : `Sequência de ${result.streak} dias. Não pare agora!`}
        </Text>
      )}

      {result.newCars.length > 0 && (
        <Animated.View entering={FadeInDown.delay(500)} style={{ width: '100%', gap: space(3) }}>
          <Text style={styles.sectionLabel}>NOVOS NA SUA GARAGEM</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(3) }}>
            {result.newCars.map((id) => (
              <View key={id} style={styles.newCar}>
                <CarPhoto carId={id} style={{ borderRadius: radius.sm }} />
                <Text style={styles.newCarText} numberOfLines={1}>
                  {CAR_BY_ID[id].model}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <Button title="Continuar" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: space(4) }} />
    </ScrollView>
  );
}

function StatBox({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Icon name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space(4), padding: space(6) },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    paddingHorizontal: space(4),
    paddingBottom: space(3),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  kmBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 48 },
  kmText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  content: {
    paddingHorizontal: space(4),
    paddingTop: space(2),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  retryTag: { color: colors.fire, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  prompt: { color: colors.text, fontSize: 24, fontWeight: '800' },
  photoWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space(4),
    paddingVertical: space(3),
    backgroundColor: 'rgba(8,10,13,0.72)',
  },
  captionMake: { color: colors.textDim, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  captionModel: { color: colors.text, fontSize: 20, fontWeight: '800' },
  zoomBtn: {
    position: 'absolute',
    top: space(3),
    right: space(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(8,10,13,0.75)',
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: space(2),
  },
  zoomText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  options: { gap: space(2.5) },
  feedback: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 2,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space(5),
    paddingHorizontal: space(4),
  },
  feedbackInner: { gap: space(3), width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  feedbackTitle: { fontSize: 22, fontWeight: '800' },
  answerLine: { color: colors.text, fontSize: 16 },
  answerStrong: { fontWeight: '800' },
  factBox: {
    flexDirection: 'row',
    gap: space(2),
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.md,
    padding: space(3),
  },
  factText: { color: colors.text, fontSize: 15, lineHeight: 21, flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space(6),
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(5),
    gap: space(3),
  },
  dialogTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  dialogText: { color: colors.textDim, fontSize: 16, marginBottom: space(2) },
  doneContent: {
    alignItems: 'center',
    gap: space(4),
    paddingHorizontal: space(5),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  doneTitle: { color: colors.text, fontSize: 30, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: space(3), width: '100%', marginTop: space(2) },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space(4),
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  streakNote: { color: colors.fire, fontWeight: '700', fontSize: 15, textAlign: 'center' },
  sectionLabel: { color: colors.textDim, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  newCar: { width: 130, gap: space(1.5) },
  newCarText: { color: colors.text, fontWeight: '700', fontSize: 14 },
});
