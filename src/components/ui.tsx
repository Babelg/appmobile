import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radius, space } from '@/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon(props: ComponentProps<typeof MaterialCommunityIcons>) {
  return <MaterialCommunityIcons {...props} />;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
  const palette = {
    primary: { bg: colors.accent, fg: colors.onAccent },
    secondary: { bg: colors.surfaceAlt, fg: colors.text },
    danger: { bg: colors.danger, fg: '#2A0A0A' },
    success: { bg: colors.success, fg: '#052016' },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, opacity: disabled ? 0.4 : 1 },
        pressed && styles.pressed,
        style,
      ]}>
      {icon && <Icon name={icon} size={20} color={palette.fg} />}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.accent, height = 14 }: { value: number; color?: string; height?: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 450 });
  }, [value, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: height / 2 }, fill]} />
    </View>
  );
}

export function StatPill({ icon, value, color, label }: { icon: IconName; value: ReactNode; color: string; label?: string }) {
  return (
    <View style={styles.pill} accessibilityLabel={label}>
      <Icon name={icon} size={18} color={color} />
      <Text style={styles.pillText}>{value}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Stars({ count, size = 16, total = 3 }: { count: number; size?: number; total?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: total }, (_, i) => (
        <Icon key={i} name="star" size={size} color={i < count ? colors.accent : colors.border} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    paddingHorizontal: space(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space(2),
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  buttonText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  track: { width: '100%', backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
  },
  pillText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
  },
});
