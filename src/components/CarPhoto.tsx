import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CAR_IMAGES } from '@/data/carImages';
import { colors } from '@/theme';

type Props = {
  carId: string;
  /** Ponto da foto (0–1) que fica no centro quando há zoom. */
  focusX?: number;
  focusY?: number;
  /** 1 = foto inteira. Mudanças são animadas (efeito "afastar a câmera"). */
  zoom?: number;
  blur?: number;
  style?: StyleProp<ViewStyle>;
};

/** Foto 4:3 de um carro, com zoom animado em um ponto de foco. */
export function CarPhoto({ carId, focusX = 0.5, focusY = 0.5, zoom = 1, blur, style }: Props) {
  const width = useSharedValue(0);
  const scale = useSharedValue(zoom);
  const fx = useSharedValue(focusX);
  const fy = useSharedValue(focusY);

  useEffect(() => {
    scale.value = withTiming(zoom, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [zoom, scale]);

  useEffect(() => {
    fx.value = focusX;
    fy.value = focusY;
  }, [focusX, focusY, fx, fy]);

  const animated = useAnimatedStyle(() => {
    const w = width.value;
    const h = w * 0.75;
    const s = scale.value;
    // Com escala a partir do centro, o deslocamento que centraliza o foco é s·(centro − foco),
    // limitado para a foto nunca deixar borda vazia.
    const maxX = ((s - 1) * w) / 2;
    const maxY = ((s - 1) * h) / 2;
    const tx = Math.min(maxX, Math.max(-maxX, s * (w / 2 - fx.value * w)));
    const ty = Math.min(maxY, Math.max(-maxY, s * (h / 2 - fy.value * h)));
    return { transform: [{ translateX: tx }, { translateY: ty }, { scale: s }] };
  });

  return (
    <View
      style={[styles.frame, style]}
      onLayout={(e) => {
        width.value = e.nativeEvent.layout.width;
      }}>
      <Animated.View style={[StyleSheet.absoluteFill, animated]}>
        <Image
          source={CAR_IMAGES[carId]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={blur}
          transition={120}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
});
