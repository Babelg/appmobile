import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarPhoto } from '@/components/CarPhoto';
import { Icon, ProgressBar, type IconName } from '@/components/ui';
import { CAR_BY_ID, CARS } from '@/data/cars';
import { ROUTES } from '@/data/routes';
import { useProgress } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

export default function GarageScreen() {
  const insets = useSafeAreaInsets();
  const garage = useProgress((s) => s.garage);
  const total = Object.keys(garage).length;
  const [filtro, setFiltro] = useState<'todos' | 'meus'>('todos');
  // só os carros que você tem, numa grade única em ordem alfabética
  const meus = CARS.filter((c) => c.id in garage)
    .sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`, 'pt-BR'))
    .map((c) => c.id);

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

      <View style={styles.filtros} accessibilityRole="tablist">
        <Filtro icon="view-grid-outline" label="Todos" ativo={filtro === 'todos'} onPress={() => setFiltro('todos')} />
        <Filtro
          icon="garage-variant"
          label={`Só os meus (${meus.length})`}
          ativo={filtro === 'meus'}
          onPress={() => setFiltro('meus')}
        />
      </View>

      {filtro === 'meus' ? (
        meus.length ? (
          <View style={styles.grid}>
            {meus.map((id) => (
              <CarTile key={id} id={id} owned />
            ))}
            {/* com número ímpar, o último não estica para a largura toda */}
            {meus.length % 2 === 1 && <View style={[styles.tile, styles.espaco]} accessibilityElementsHidden />}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Icon name="garage-open-variant" size={40} color={colors.textFaint} />
            <Text style={styles.vazioTitulo}>Sua garagem está vazia</Text>
            <Text style={styles.vazioTexto}>
              Acerte “que carro é esse?” nas etapas ou a Nave do Dia para estacionar o primeiro.
            </Text>
          </View>
        )
      ) : (
        ROUTES.filter((route) => route.carIds.length > 0).map((route) => (
          <View key={route.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {route.flag} {route.title}
            </Text>
            <View style={styles.grid}>
              {route.carIds.map((id) => (
                <CarTile key={id} id={id} owned={id in garage} />
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Filtro({ icon, label, ativo, onPress }: { icon: IconName; label: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={({ pressed }) => [styles.filtro, ativo && styles.filtroAtivo, pressed && { opacity: 0.8 }]}>
      <Icon name={icon} size={18} color={ativo ? colors.onAccent : colors.textDim} />
      <Text style={[styles.filtroTexto, ativo && { color: colors.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

function CarTile({ id, owned }: { id: string; owned: boolean }) {
  const car = CAR_BY_ID[id];
  return (
    <Pressable
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
  filtros: { flexDirection: 'row', gap: space(2) },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space(4),
    paddingVertical: space(2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filtroAtivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  filtroTexto: { color: colors.textDim, fontWeight: '800', fontSize: 14 },
  espaco: { backgroundColor: 'transparent', borderWidth: 0 },
  vazio: { alignItems: 'center', gap: space(2), paddingVertical: space(8), paddingHorizontal: space(4) },
  vazioTitulo: { color: colors.text, fontSize: 18, fontWeight: '800' },
  vazioTexto: { color: colors.textDim, fontSize: 15, textAlign: 'center', lineHeight: 21 },
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
