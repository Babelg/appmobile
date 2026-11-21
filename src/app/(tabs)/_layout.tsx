import { Tabs } from 'expo-router';

import { Icon } from '@/components/ui';
import { diarioDeHoje, useProgress } from '@/store/progress';
import { colors } from '@/theme';

export default function TabLayout() {
  // bolinha na aba enquanto a Nave do Dia de hoje não foi jogada
  const naveDoDiaPendente = useProgress((s) => diarioDeHoje(s.diario).km === null);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Estrada',
          tabBarIcon: ({ color, size }) => <Icon name="road-variant" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="diario"
        options={{
          title: 'Nave do Dia',
          tabBarIcon: ({ color, size }) => <Icon name="calendar-star" size={size} color={color as string} />,
          tabBarBadge: naveDoDiaPendente ? '' : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, minWidth: 10, height: 10, borderRadius: 5, top: 2 },
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: 'Garagem',
          tabBarIcon: ({ color, size }) => <Icon name="garage-variant" size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Icon name="account-circle-outline" size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
