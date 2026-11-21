import { Link, router, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarPhoto } from '@/components/CarPhoto';
import { Button, Icon } from '@/components/ui';
import { CAR_BY_ID } from '@/data/cars';
import CREDITS from '@/data/credits.json';
import { ROUTE_BY_ID } from '@/data/routes';
import type { ImageCredit } from '@/data/types';
import { useProgress } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

export default function CarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const car = CAR_BY_ID[id];
  const owned = useProgress((s) => (car ? car.id in s.garage : false));

  if (!car || !owned) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.title}>Carro ainda não descoberto</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const route = ROUTE_BY_ID[car.route];
  const credit = (CREDITS as Record<string, ImageCredit>)[car.id];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space(8) }}>
        <View style={styles.inner}>
          <View>
            <CarPhoto carId={car.id} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={() => router.back()}
              style={[styles.close, { top: space(3) }]}>
              <Icon name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.make}>{car.make}</Text>
            <Text style={styles.title}>{car.model}</Text>

            <View style={styles.chips}>
              <Chip icon="calendar-range" text={car.years} />
              <Chip icon="map-marker-outline" text={`Marca: ${car.country}`} />
              {car.nickname && <Chip icon="tag-outline" text={`"${car.nickname}"`} />}
              <Chip icon="road-variant" text={`${route.flag} ${route.title}`} />
            </View>

            <Text style={styles.section}>CURIOSIDADES</Text>
            <View style={{ gap: space(3) }}>
              {car.facts.map((fact) => (
                <View key={fact} style={styles.fact}>
                  <Icon name="lightbulb-on-outline" size={20} color={colors.accent} />
                  <Text style={styles.factText}>{fact}</Text>
                </View>
              ))}
            </View>

            {credit && (
              <Link href={credit.source as Href} target="_blank" style={styles.credit}>
                Foto: {credit.author} · {credit.license} · Wikimedia Commons (recortada)
              </Link>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Chip({ icon, text }: { icon: React.ComponentProps<typeof Icon>['name']; text: string }) {
  return (
    <View style={styles.chip}>
      <Icon name={icon} size={15} color={colors.textDim} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space(4), padding: space(6) },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  close: {
    position: 'absolute',
    right: space(3),
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(8,10,13,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: space(5), gap: space(3) },
  make: { color: colors.textDim, fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  chip: {
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
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  section: { color: colors.textDim, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginTop: space(3) },
  fact: {
    flexDirection: 'row',
    gap: space(3),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
  },
  factText: { color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 },
  credit: { color: colors.textFaint, fontSize: 12, marginTop: space(4), lineHeight: 17 },
});
