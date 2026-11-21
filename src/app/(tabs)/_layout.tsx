import { Tabs } from 'expo-router';

import { Icon } from '@/components/ui';
import { colors } from '@/theme';

export default function TabLayout() {
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
