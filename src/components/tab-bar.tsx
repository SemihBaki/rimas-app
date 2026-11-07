import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout } from '@/constants/theme';
import { useCartCount } from '@/store/shop';

import { Label } from './typography';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { active: 'storefront', idle: 'storefront-outline', label: 'Mağaza' },
  collections: { active: 'grid', idle: 'grid-outline', label: 'Koleksiyon' },
  favorites: { active: 'heart', idle: 'heart-outline', label: 'Favoriler' },
  cart: { active: 'bag', idle: 'bag-outline', label: 'Sepet' },
  account: { active: 'person', idle: 'person-outline', label: 'Hesap' },
};

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const count = useCartCount();

  return (
    <View
      style={{
        backgroundColor: Colors.paper,
        borderTopWidth: 1,
        borderTopColor: Colors.line,
        paddingBottom: insets.bottom,
      }}>
      <View style={{ flexDirection: 'row', height: Layout.tabBarHeight }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = ICONS[route.name];
          if (!meta) return null;
          const isCart = route.name === 'cart';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label.toLocaleUpperCase('tr-TR')}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              }}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                opacity: pressed ? 0.55 : 1,
              })}>
              <View>
                <Ionicons
                  name={focused ? meta.active : meta.idle}
                  size={19}
                  color={focused ? Colors.ink : Colors.inkMuted}
                />
                {isCart && count > 0 ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -7,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 7,
                      paddingHorizontal: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: Colors.ink,
                    }}>
                    <Label
                      style={{
                        color: Colors.paper,
                        fontSize: 7.5,
                        letterSpacing: 0,
                        lineHeight: 10,
                      }}>
                      {count}
                    </Label>
                  </View>
                ) : null}
              </View>
              <Label
                style={{
                  fontSize: 8,
                  letterSpacing: 1.1,
                  lineHeight: 10,
                  color: focused ? Colors.ink : Colors.inkMuted,
                }}>
                {meta.label}
              </Label>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
