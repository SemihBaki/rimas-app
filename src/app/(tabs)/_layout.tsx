import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/tab-bar';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.paper },
      }}
      tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Mağaza' }} />
      <Tabs.Screen name="collections" options={{ title: 'Koleksiyon' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoriler' }} />
      <Tabs.Screen name="cart" options={{ title: 'Sepet' }} />
      <Tabs.Screen name="account" options={{ title: 'Hesap' }} />
    </Tabs>
  );
}
