import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/toast';
import { Colors, Layout, Shadow } from '@/constants/theme';
import { useShop } from '@/store/shop';

SplashScreen.preventAutoHideAsync();

const noopSubscribe = () => () => {};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.ink,
    background: Colors.paper,
    card: Colors.paper,
    text: Colors.ink,
    border: Colors.line,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Bodoni: require('../../assets/fonts/Bodoni.ttf'),
    Inter: require('../../assets/fonts/Inter.ttf'),
  });

  // Persisted cart/favorites are restored asynchronously; wait for them so the
  // UI never flashes empty cart state (and SSR/client markup stays identical).
  // `isClient` keeps the first client render identical to the server output.
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const hydrated = useSyncExternalStore(
    (onChange) => useShop.persist.onFinishHydration(onChange),
    () => useShop.persist.hasHydrated(),
    () => false
  );

  const ready = isClient && (fontsLoaded || Boolean(fontError)) && hydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="dark" />
          <View style={styles.desktopBackdrop}>
            <View style={styles.frame}>
              <ToastProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.paper },
                    animation: 'slide_from_right',
                  }}>
                  <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
                  <Stack.Screen name="product/[id]" />
                  <Stack.Screen name="collection/[slug]" />
                  <Stack.Screen
                    name="search"
                    options={{ animation: 'fade_from_bottom', presentation: 'modal' }}
                  />
                  <Stack.Screen name="checkout" />
                  <Stack.Screen
                    name="order/[id]"
                    options={{ animation: 'fade', gestureEnabled: false }}
                  />
                  <Stack.Screen name="about" />
                </Stack>
              </ToastProvider>
            </View>
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  desktopBackdrop: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#E6E1D9' : Colors.paper,
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxWidth,
    backgroundColor: Colors.paper,
    ...(Platform.OS === 'web'
      ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.line, ...Shadow }
      : null),
  },
});
