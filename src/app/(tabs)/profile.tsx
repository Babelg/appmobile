import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, type IconName } from '@/components/ui';
import { CARS } from '@/data/cars';
import { LESSONS } from '@/data/routes';
import { dayKey, faltamParaSubir, NIVEL_MAX, nivelDe, visibleStreak } from '@/game/progress';
import { useProgress } from '@/store/progress';
import { colors, MAX_CONTENT_WIDTH, radius, space } from '@/theme';

/** Atalho para testar as fases difíceis: aparece no modo de desenvolvimento e na versão web. */
const MOSTRAR_MODO_TESTE = __DEV__ || Platform.OS === 'web';
const FASE_FINAL = 'populares-4';

function abrirFaseFinal() {
  router.push({ pathname: '/lesson/[id]', params: { id: FASE_FINAL } });
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const p = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const done = Object.keys(p.lessons).length;
  const stars = Object.values(p.lessons).reduce((sum, l) => sum + l.stars, 0);
  const accuracy = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space(4) }]}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.grid}>
        <Stat icon="speedometer" color={colors.accent} value={p.km} label="km rodados" />
        <Stat icon="fire" color={colors.fire} value={visibleStreak(p.streak, p.lastPlayed, dayKey())} label="dias seguidos" />
        <Stat icon="trophy-outline" color={colors.fire} value={p.bestStreak} label="maior sequência" />
        <Stat icon="bullseye-arrow" color={colors.success} value={`${accuracy}%`} label="precisão" />
        <Stat icon="flag-checkered" color={colors.text} value={`${done}/${LESSONS.length}`} label="etapas" />
        <Stat icon="star" color={colors.accent} value={`${stars}/${LESSONS.length * 3}`} label="estrelas" />
        <Stat
          icon="garage-variant"
          color={colors.success}
          value={`${Object.keys(p.garage).length}/${CARS.length}`}
          label="na garagem"
        />
        <Stat icon="help-circle-outline" color={colors.textDim} value={p.answered} label="perguntas" />
        <Stat
          icon="stairs-up"
          color={colors.accent}
          value={`Nível ${nivelDe(done)}`}
          label={faltamParaSubir(done) === null ? 'nível máximo' : `faltam ${faltamParaSubir(done)} etapas p/ subir`}
        />
      </View>

      <Text style={styles.section}>AJUSTES E SOBRE</Text>
      <View style={styles.list}>
        <Row
          icon={p.som ? 'volume-high' : 'volume-off'}
          label={p.som ? 'Sons de acerto e erro: ligados' : 'Sons de acerto e erro: desligados'}
          onPress={p.alternarSom}
        />
        <Row icon="image-multiple-outline" label="Créditos das fotos" onPress={() => router.push('/credits')} />
      </View>
      <Text style={styles.disclaimer}>
        App independente, sem afiliação com nenhuma montadora. Marcas e nomes de modelos pertencem aos seus
        respectivos donos e são usados apenas para identificação. Fotos do Wikimedia Commons, sob licenças
        livres (veja os créditos).
      </Text>

      {MOSTRAR_MODO_TESTE && (
        <>
          <Text style={styles.section}>MODO TESTE</Text>
          <View style={styles.list}>
            {p.backupTeste ? (
              <>
                <Row icon="flag-checkered" label="Abrir uma fase final" onPress={abrirFaseFinal} />
                <Row
                  icon="backup-restore"
                  label="Sair do modo teste e voltar ao meu progresso"
                  onPress={p.sairModoTeste}
                />
              </>
            ) : (
              <Row
                icon="flask-outline"
                label="Ir para as fases finais (nível máximo)"
                onPress={() => {
                  p.entrarModoTeste();
                  abrirFaseFinal();
                }}
              />
            )}
          </View>
          <Text style={styles.disclaimer}>
            Libera a última etapa de todas as rotas no nível {NIVEL_MAX}: recortes mais fechados e sem dicas de
            afastar. Seu progresso de verdade fica guardado e volta quando você sair do modo teste.
          </Text>
        </>
      )}

      <Text style={styles.section}>DADOS</Text>
      {confirmReset ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>Apagar todo o progresso? Isso não pode ser desfeito.</Text>
          <Button
            title="Apagar tudo"
            variant="danger"
            onPress={() => {
              p.reset();
              setConfirmReset(false);
            }}
          />
          <Button title="Cancelar" variant="secondary" onPress={() => setConfirmReset(false)} />
        </View>
      ) : (
        <View style={styles.list}>
          <Row icon="delete-outline" label="Zerar progresso" danger onPress={() => setConfirmReset(true)} />
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ icon, color, value, label }: { icon: IconName; color: string; value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}>
      <Icon name={icon} size={22} color={danger ? colors.danger : colors.textDim} />
      <Text style={[styles.rowText, danger && { color: colors.danger }]}>{label}</Text>
      <Icon name="chevron-right" size={22} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: space(4),
    paddingBottom: space(12),
    gap: space(3),
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  stat: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
    gap: 2,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: space(1) },
  statLabel: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  section: { color: colors.textDim, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginTop: space(4) },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(4) },
  rowText: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 },
  disclaimer: { color: colors.textFaint, fontSize: 13, lineHeight: 19 },
  confirm: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: space(4),
    gap: space(3),
  },
  confirmText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
