import * as WebBrowser from 'expo-web-browser';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui';
import { CAR_BY_ID } from '@/data/cars';
import CREDITS from '@/data/credits.json';
import type { ImageCredit } from '@/data/types';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

const entries = Object.entries(CREDITS as Record<string, ImageCredit>);

export default function CreditsScreen() {
  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={([id]) => id}
      ListHeaderComponent={
        <Text style={styles.intro}>
          Todas as fotos vêm do Wikimedia Commons e foram recortadas e redimensionadas para o app. Toque em uma
          foto para ver a página original, com a licença completa.
        </Text>
      }
      renderItem={({ item: [id, credit] }) => {
        const car = CAR_BY_ID[id];
        return (
          <Pressable
            accessibilityRole="link"
            onPress={() => WebBrowser.openBrowserAsync(credit.source)}
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.surfaceAlt }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.car}>{car ? `${car.make} ${car.model}` : id}</Text>
              <Text style={styles.meta}>
                {credit.author} · {credit.license}
              </Text>
            </View>
            <Icon name="open-in-new" size={18} color={colors.textFaint} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: space(4),
    gap: space(2),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  intro: { color: colors.textDim, fontSize: 14, lineHeight: 20, marginBottom: space(2) },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
  },
  car: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.textDim, fontSize: 13 },
});
