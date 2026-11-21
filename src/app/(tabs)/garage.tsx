import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarPhoto } from '@/components/CarPhoto';
import { Icon, ProgressBar } from '@/components/ui';
import { CAR_BY_ID, CARS } from '@/data/cars';
import { ROUTES } from '@/data/routes';
import { useProgress } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

export default function GarageScreen() {
  const insets = useSafeAreaInsets();
  const garage = useProgress((s) => s.garage);
  const total = Object.keys(garage).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space(4) }]}>
      <Text style={styles.title}>Garagem</Text>
      <Text style={styles.subtitle}>
        Acerte “que carro é esse?” para estacionar o modelo aqui e liberar a ficha completa.
      </Text>
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {total} de {CARS.length} carros
        </Text>
        <ProgressBar value={total / CARS.length} color={colors.success} height={10} />
      </View>

      {ROUTES.map((route) => (
        <View key={route.id} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {route.flag} {route.title}
          </Text>
          <View style={styles.grid}>
            {route.carIds.map((id) => {
              const car = CAR_BY_ID[id];
              const owned = id in garage;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={owned ? `${car.make} ${car.model}` : 'Carro ainda não descoberto'}
                  disabled={!owned}
                  onPress={() => router.push({ pathname: '/car/[id]', params: { id } })}
                  style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}>
                  <View>
                    <CarPhoto carId={id} blur={owned ? undefined : 40} />
                    {!owned && (
                      <View style={styles.lockOverlay}>
                        <Icon name="help" size={34} color={colors.textDim} />
                      </View>
                    )}
                  </View>
                  <View style={styles.tileText}>
                    <Text style={styles.make} numberOfLines={1}>
                      {owned ? car.make : '???'}
                    </Text>
                    <Text style={[styles.model, !owned && { color: colors.textFaint }]} numberOfLines={1}>
                      {owned ? car.model : 'Não descoberto'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: space(4),
    paddingBottom: space(12),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: space(3),
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.textDim, fontSize: 15, lineHeight: 21 },
  counter: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: space(2),
  },
  counterText: { color: colors.text, fontWeight: '800' },
  section: { gap: space(3), marginTop: space(3) },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  tile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,17,21,0.55)',
  },
  tileText: { padding: space(3), gap: 1 },
  make: { color: colors.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  model: { color: colors.text, fontSize: 15, fontWeight: '800' },
});
