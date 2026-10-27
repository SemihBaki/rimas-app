import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/toast';
import { Colors, Layout, Shadow } from '@/constants/theme';
import { useAuth } from '@/store/auth';
import { useShop } from '@/store/shop';
import { startAccountSync } from '@/store/sync';

SplashScreen.preventAutoHideAsync();

const noopSubscribe = () => () => {};

/**
 * iPhone "Ana Ekrana Ekle" modunda web görünümü durum çubuğunun altına kadar
 * uzar, ama Safari `env(safe-area-inset-top)` değerini 0 bildirir. Bu yüzden
 * üst boşluk cihazın durum çubuğu yüksekliğiyle telafi edilir; Dynamic Island
 * ve çentikli modeller farklı yükseklik kullandığı için ekran yüksekliğine
 * göre seçilir. Değer istemcide bir kez hesaplanır (sunucuda 0).
 */
let standaloneTopInset: number | null = null;

function readStandaloneTopInset(): number {
  if (standaloneTopInset !== null) return standaloneTopInset;

  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true);

  if (!standalone) {
    standaloneTopInset = 0;
    return standaloneTopInset;
  }

  const screenHeight = window.screen.height;
  standaloneTopInset = screenHeight >= 850 ? 59 : screenHeight >= 800 ? 47 : screenHeight >= 700 ? 20 : 0;
  return standaloneTopInset;
}

function StandaloneStatusBarInset({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const fallbackTop = useSyncExternalStore(noopSubscribe, readStandaloneTopInset, () => 0);
  const extraTop = insets.top === 0 ? fallbackTop : 0;

  return (
    <SafeAreaInsetsContext.Provider
      value={extraTop ? { ...insets, top: insets.top + extraTop } : insets}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

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

  // Restore the session and start favorites sync once, on the client only
  // (effects never run during server rendering).
  useEffect(() => {
    void useAuth.getState().bootstrap();
    startAccountSync();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StandaloneStatusBarInset>
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
                    <Stack.Screen
                      name="sign-in"
                      options={{ animation: 'fade_from_bottom', presentation: 'modal' }}
                    />
                    <Stack.Screen name="orders" />
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
        </StandaloneStatusBarInset>
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
