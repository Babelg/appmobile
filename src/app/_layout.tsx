import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';

import { useProgress } from '@/store/progress';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/** true quando o progresso salvo (AsyncStorage) já foi carregado. */
function useStoreHydrated() {
  const hasHydrated = () => useProgress.persist.hasHydrated();
  return useSyncExternalStore((onChange) => useProgress.persist.onFinishHydration(onChange), hasHydrated, hasHydrated);
}

export default function RootLayout() {
  const hydrated = useStoreHydrated();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="lesson/[id]"
          options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <Stack.Screen name="car/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen
          name="credits"
          options={{
            title: 'Créditos das fotos',
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerBackTitle: 'Voltar',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
