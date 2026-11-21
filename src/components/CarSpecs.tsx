import { StyleSheet, Text, View } from 'react-native';

import { CAR_BY_ID } from '@/data/cars';
import FIPE_DATA from '@/data/fipe.json';
import type { FipeInfo } from '@/data/types';
import { colors, radius, space } from '@/theme';

import { CarPhoto } from './CarPhoto';
import { Icon, type IconName } from './ui';

const FIPE = FIPE_DATA as Record<string, FipeInfo>;

/** "R$ 110.841,00" → "R$ 110.841" */
export function shortPrice(price: string) {
  return price.replace(/,00$/, '');
}

export function fipeOf(carId: string): FipeInfo | undefined {
  return FIPE[carId];
}

/** Grade com FIPE, ano e combustível de um carro. */
export function SpecGrid({ carId }: { carId: string }) {
  const car = CAR_BY_ID[carId];
  const fipe = FIPE[carId];
  return (
    <View style={styles.grid}>
      <SpecItem
        icon="cash"
        label="TABELA FIPE"
        value={fipe ? shortPrice(fipe.price) : 'Sem cotação'}
        detail={fipe ? `${fipe.model} · ${fipe.year}` : 'Clássico fora da tabela FIPE'}
        wide
      />
      <SpecItem icon="calendar-range" label="ANO" value={car.years} />
      <SpecItem icon="gas-station" label="COMBUSTÍVEL" value={car.fuel} />
      {fipe && <Text style={styles.ref}>Referência: {fipe.ref} · código FIPE {fipe.code}</Text>}
    </View>
  );
}

function SpecItem(props: { icon: IconName; label: string; value: string; detail?: string; wide?: boolean }) {
  return (
    <View style={[styles.item, props.wide && styles.itemWide]}>
      <View style={styles.itemHead}>
        <Icon name={props.icon} size={14} color={colors.textDim} />
        <Text style={styles.label}>{props.label}</Text>
      </View>
      <Text style={[styles.value, props.wide && styles.valueBig]}>{props.value}</Text>
      {props.detail && <Text style={styles.detail}>{props.detail}</Text>}
    </View>
  );
}

/** Ficha completa: foto, nome, FIPE/ano/combustível e uma curiosidade. */
export function CarSpecCard({ carId, fact }: { carId: string; fact: string }) {
  const car = CAR_BY_ID[carId];
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.thumb}>
          <CarPhoto carId={carId} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.make}>{car.make}</Text>
          <Text style={styles.model}>{car.model}</Text>
        </View>
      </View>
      <SpecGrid carId={carId} />
      <View style={styles.fact}>
        <Icon name="lightbulb-on-outline" size={18} color={colors.accent} />
        <Text style={styles.factText}>{fact}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: space(3),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  thumb: { width: 96, borderRadius: radius.sm, overflow: 'hidden' },
  make: { color: colors.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  model: { color: colors.text, fontSize: 19, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  item: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: space(3),
    gap: 2,
  },
  itemWide: { flexBasis: '100%' },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { color: colors.textDim, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  value: { color: colors.text, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  valueBig: { fontSize: 22, color: colors.success },
  detail: { color: colors.textDim, fontSize: 12 },
  ref: { color: colors.textFaint, fontSize: 11, width: '100%' },
  fact: {
    flexDirection: 'row',
    gap: space(2),
    backgroundColor: 'rgba(255,197,61,0.08)',
    borderRadius: radius.sm,
    padding: space(3),
  },
  factText: { color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
});
