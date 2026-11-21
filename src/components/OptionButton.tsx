import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space } from '@/theme';

import { Icon } from './ui';

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dim';

type Props = {
  label: string;
  sub?: string;
  index: number;
  state: OptionState;
  onPress: () => void;
};

const LETTERS = ['A', 'B', 'C', 'D'];

export function OptionButton({ label, sub, index, state, onPress }: Props) {
  const tone = {
    idle: { border: colors.border, bg: colors.surface, badge: colors.surfaceAlt, fg: colors.text },
    correct: { border: colors.success, bg: colors.successBg, badge: colors.success, fg: colors.text },
    wrong: { border: colors.danger, bg: colors.dangerBg, badge: colors.danger, fg: colors.text },
    dim: { border: colors.border, bg: colors.surface, badge: colors.surfaceAlt, fg: colors.textFaint },
  }[state];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sub ? `${sub} ${label}` : label}
      disabled={state !== 'idle'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { borderColor: tone.border, backgroundColor: tone.bg },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.badge, { backgroundColor: tone.badge }]}>
        {state === 'correct' ? (
          <Icon name="check-bold" size={16} color="#052016" />
        ) : state === 'wrong' ? (
          <Icon name="close-thick" size={16} color="#2A0A0A" />
        ) : (
          <Text style={[styles.letter, { color: tone.fg }]}>{LETTERS[index]}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        {sub && <Text style={[styles.sub, state === 'dim' && { color: colors.textFaint }]}>{sub}</Text>}
        <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: space(3),
    paddingHorizontal: space(3),
    minHeight: 58,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontWeight: '800', fontSize: 14 },
  sub: { color: colors.textDim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  label: { fontSize: 17, fontWeight: '700' },
});
