import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout, Spacing } from '@/constants/theme';
import { isStandaloneWebApp } from '@/lib/standalone';
import { useCartCount } from '@/store/shop';

import { BrandMark } from './brand-mark';
import { Label } from './typography';

type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'light' | 'dark';
};

/** Slim editorial top bar used on inner screens. */
export function ScreenHeader({ title, onBack, right, style, tone = 'dark' }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const color = tone === 'light' ? Colors.paper : Colors.ink;

  return (
    <View
      style={[
        {
          paddingTop: insets.top + 4,
          backgroundColor: Colors.paper,
          borderBottomWidth: 1,
          borderBottomColor: Colors.line,
        },
        style,
      ]}>
      <View
        style={{
          height: 52,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.md,
        }}>
        <View style={{ width: 56, alignItems: 'flex-start' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Geri"
            hitSlop={12}
            onPress={onBack ?? (() => router.back())}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 6 })}>
            <Ionicons name="arrow-back" size={20} color={color} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title ? (
            <Label style={{ color, letterSpacing: 2 }} numberOfLines={1}>
              {title}
            </Label>
          ) : null}
        </View>
        <View style={{ width: 56, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
}

/**
 * Breathing room between the top of the viewport and the logo, per environment:
 *
 *  - a real safe-area inset (native iOS, Android) already covers the status bar,
 *    so only a small gap is added,
 *  - the installed iPhone app gets a slightly wider gap because the viewport
 *    begins right under the status bar and the logo needs air around it,
 *  - a desktop browser window stays as tight as it has always been.
 */
function homeHeaderTopGap(insetsTop: number) {
  if (insetsTop > 0) return 8;
  return isStandaloneWebApp() ? 13 : 10;
}

/**
 * Height of the brand bar below the safe area (top gap + logo + bottom padding).
 * Screens that overlay the bar — the home hero does — subtract this to know when
 * the bar has fully cleared the content underneath.
 */
export const homeHeaderContentHeight = (insetsTop: number) =>
  homeHeaderTopGap(insetsTop) + 48;

/** Brand bar for the home screen; sits above the hero image. */
export function HomeHeader({ light = false }: { light?: boolean }) {
  const insets = useSafeAreaInsets();
  const count = useCartCount();
  const color = light ? Colors.paper : Colors.ink;

  return (
    <View
      style={{
        paddingTop: insets.top + homeHeaderTopGap(insets.top),
        paddingHorizontal: Layout.gutter,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Koleksiyonlar"
          hitSlop={12}
          onPress={() => router.push('/collections')}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Ionicons name="grid-outline" size={20} color={color} />
        </Pressable>
      </View>

      <BrandMark height={38} tone={light ? 'paper' : 'ink'} style={{ marginHorizontal: 10 }} />

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 14,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ara"
          hitSlop={12}
          onPress={() => router.push('/search')}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Ionicons name="search-outline" size={20} color={color} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sepet"
          hitSlop={12}
          onPress={() => router.push('/cart')}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
          <Ionicons name="bag-outline" size={20} color={color} />
          {count > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -5,
                right: -7,
                minWidth: 15,
                height: 15,
                borderRadius: 8,
                paddingHorizontal: 3,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: light ? Colors.paper : Colors.ink,
              }}>
              <Label
                style={{
                  color: light ? Colors.ink : Colors.paper,
                  fontSize: 8,
                  letterSpacing: 0,
                  lineHeight: 11,
                }}>
                {count}
              </Label>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
