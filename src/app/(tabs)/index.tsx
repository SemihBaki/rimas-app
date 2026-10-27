import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { HomeHeader, homeHeaderContentHeight } from '@/components/header';
import { Marquee } from '@/components/marquee';
import { ProductCard } from '@/components/product-card';
import { Gutter } from '@/components/screen';
import { SectionHeading } from '@/components/section-heading';
import { useToast } from '@/components/toast';
import { Body, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { CATEGORIES, EDITORIALS, HERO_IMAGE, PRODUCTS } from '@/data/catalog';
import { buildMetadata } from '@/lib/seo';

export const generateMetadata = () =>
  buildMetadata({
    title: 'RİMAS — Sessiz Zarafet',
    description:
      'Sonbahar / Kış 26 koleksiyonu: trençkot, blazer, triko, denim ve aksesuar. Az sayıda üretilen, uzun ömürlü parçalar.',
  });

const SERVICES = [
  { icon: 'cube-outline', title: 'Ücretsiz Kargo', copy: '2.000 ₺ üzeri' },
  { icon: 'refresh-outline', title: '30 Gün İade', copy: 'Koşulsuz' },
  { icon: 'shield-checkmark-outline', title: 'Güvenli Ödeme', copy: '256-bit SSL' },
] as const;

/**
 * The frosted plate reaches past the bar so the glass can dissolve instead of
 * ending on a hard edge. The solid part has to cover the whole bar — logo
 * included — otherwise the lower half of the logo sits on weaker blur and the
 * image behind starts to show through it. So the fade starts at the bar's bottom
 * edge and completes in the overhang below it. Native keeps a clean edge, which
 * is the iOS norm.
 */
const GLASS_OVERHANG = 22;

/** Full-strength glass down to `barHeight`, then a soft dissolve to nothing. */
function glassFeather(barHeight: number): ViewStyle {
  const end = barHeight + GLASS_OVERHANG;
  return {
    maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) ${barHeight}px, rgba(0,0,0,0) ${end}px)`,
  } as ViewStyle;
}

/** The veil fades where the plate feathers out, so no line is left behind. */
function glassVeilLocations(barHeight: number): [number, number, number] {
  if (Platform.OS !== 'web') return [0, 0.9, 1];
  return [0, barHeight / (barHeight + GLASS_OVERHANG), 1];
}

const DARK_GLASS = 'rgba(17,17,16,0.10)';
const LIGHT_GLASS = 'rgba(247,245,241,0.24)';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [email, setEmail] = useState('');

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const heroHeight = Math.min(width * 1.38, 620);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-120, 0, 500], [-40, 0, 90], Extrapolation.CLAMP) },
      { scale: 1.06 },
    ],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 240], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, 240], [0, 40], Extrapolation.CLAMP) },
    ],
  }));

  const contentWidth = Math.min(width, Layout.maxWidth);
  const cardWidth = (contentWidth - Layout.gutter * 2 - 12) / 2;
  const editorial = EDITORIALS[0];
  const story = EDITORIALS[1];

  // The brand bar floats above the page: it stays put while the hero scrolls
  // away, then crossfades from paper to ink once the dark hero is no longer
  // behind it. A frosted-glass plate sits underneath so the bar never turns
  // fully transparent: dark over the hero photo, warm paper over the content.
  const barHeight = homeHeaderContentHeight(insets.top);
  const glassPlate: StyleProp<ViewStyle> =
    Platform.OS === 'web'
      ? [StyleSheet.absoluteFill, { bottom: -GLASS_OVERHANG }]
      : StyleSheet.absoluteFill;
  const feather = Platform.OS === 'web' ? glassFeather(barHeight) : null;
  const veilLocations = glassVeilLocations(barHeight);

  const headerSwitchAt = Math.max(0, heroHeight - insets.top - barHeight);
  const inkHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [headerSwitchAt - 60, headerSwitchAt],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));
  const paperHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [headerSwitchAt - 60, headerSwitchAt],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));
  const lightGlassStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [headerSwitchAt - 90, headerSwitchAt - 10],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));
  const darkGlassStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [headerSwitchAt - 90, headerSwitchAt - 10],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 0 }}>
        {/* Hero */}
        <View style={{ height: heroHeight, overflow: 'hidden', backgroundColor: Colors.ink }}>
          <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
            <Image
              source={HERO_IMAGE}
              style={{ flex: 1 }}
              contentFit="cover"
              transition={500}
              cachePolicy="memory-disk"
            />
          </Animated.View>
          <LinearGradient
            colors={[Colors.scrimTop, 'rgba(17,17,16,0.05)', Colors.scrimBottom]}
            locations={[0, 0.42, 1]}
            style={StyleSheet.absoluteFill}
          />

          <Animated.View
            style={[
              {
                position: 'absolute',
                left: Layout.gutter,
                right: Layout.gutter,
                bottom: 36,
              },
              copyStyle,
            ]}>
            <Label tone="paper" style={{ letterSpacing: 3.2, fontSize: 9.5 }}>
              Sonbahar / Kış 26
            </Label>
            <Display
              level="xl"
              tone="paper"
              style={{ marginTop: 14, fontSize: 54, lineHeight: 55, letterSpacing: -0.8 }}>
              Sessiz{'\n'}Zarafet
            </Display>
            <Body
              tone="paper"
              style={{ marginTop: 16, maxWidth: 250, color: 'rgba(247,245,241,0.82)', fontSize: 13 }}>
              Az sayıda, uzun ömürlü parça. Yeni sezon koleksiyonu şimdi mağazada.
            </Body>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/collection/tumu')}
              style={({ pressed }) => ({
                marginTop: 24,
                alignSelf: 'flex-start',
                borderBottomWidth: 1,
                borderBottomColor: Colors.paper,
                paddingBottom: 5,
                opacity: pressed ? 0.6 : 1,
              })}>
              <Label tone="paper" style={{ letterSpacing: 2.2 }}>
                Koleksiyonu keşfet
              </Label>
            </Pressable>
          </Animated.View>
        </View>

        <Marquee text="Ücretsiz kargo · 30 gün içinde iade · Türkiye’de üretim" />

        {/* Categories */}
        <View style={{ paddingTop: 44 }}>
          <Gutter>
            <SectionHeading
              kicker="Koleksiyon"
              title="Sezonun Yönü"
              actionLabel="Tümü"
              onAction={() => router.push('/collections')}
            />
          </Gutter>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Layout.gutter,
              paddingTop: 20,
              gap: 10,
            }}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                onPress={() => router.push(`/collection/${category.id}`)}
                style={({ pressed }) => ({ width: 116, opacity: pressed ? 0.75 : 1 })}>
                <Image
                  source={category.image}
                  style={{ width: 116, height: 154, backgroundColor: Colors.paperDeep }}
                  contentFit="cover"
                  transition={250}
                  cachePolicy="memory-disk"
                />
                <Label style={{ marginTop: 9, letterSpacing: 1.4 }}>{category.name}</Label>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* New arrivals */}
        <View style={{ paddingTop: 48 }}>
          <Gutter>
            <SectionHeading
              kicker="Bu hafta"
              title="Yeni Gelenler"
              actionLabel="Tümü"
              onAction={() => router.push('/collection/tumu')}
            />
          </Gutter>
          <Gutter style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 20 }}>
            {PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                width={cardWidth}
              />
            ))}
          </Gutter>
        </View>

        {/* Campaign */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/collection/tumu')}
          style={{ marginTop: 48 }}>
          <View style={{ height: 440, backgroundColor: Colors.paperDeep }}>
            <Image
              source={editorial.image}
              style={{ flex: 1 }}
              contentFit="cover"
              transition={400}
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(17,17,16,0)', 'rgba(17,17,16,0.72)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ position: 'absolute', left: Layout.gutter, right: Layout.gutter, bottom: 26 }}>
              <Label tone="paper" style={{ letterSpacing: 2.4 }}>
                {editorial.kicker}
              </Label>
              <Display level="xl" tone="paper" style={{ marginTop: 10, fontSize: 42, lineHeight: 44 }}>
                {editorial.title}
              </Display>
              <Label tone="paper" style={{ marginTop: 14, letterSpacing: 2 }}>
                Keşfet →
              </Label>
            </View>
          </View>
        </Pressable>

        {/* Services */}
        <Gutter
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 30,
            paddingBottom: 4,
          }}>
          {SERVICES.map((service) => (
            <View key={service.title} style={{ alignItems: 'center', flex: 1, gap: 7 }}>
              <Ionicons name={service.icon} size={19} color={Colors.ink} />
              <Label style={{ fontSize: 8.5, letterSpacing: 1, textAlign: 'center' }}>
                {service.title}
              </Label>
              <Small style={{ fontSize: 10, marginTop: -3 }}>{service.copy}</Small>
            </View>
          ))}
        </Gutter>

        {/* Story */}
        <View style={{ marginTop: 46 }}>
          <Image
            source={story.image}
            style={{ width: '100%', height: 380, backgroundColor: Colors.paperDeep }}
            contentFit="cover"
            transition={400}
            cachePolicy="memory-disk"
          />
          <Gutter style={{ paddingTop: 24 }}>
            <Label style={{ color: Colors.inkMuted }}>{story.kicker}</Label>
            <Display level="l" style={{ marginTop: 10 }}>
              {story.title}
            </Display>
            <Body style={{ marginTop: 12, maxWidth: 420 }}>{story.copy}</Body>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/about')}
              style={({ pressed }) => ({
                marginTop: 18,
                alignSelf: 'flex-start',
                opacity: pressed ? 0.6 : 1,
              })}>
              <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.ink, paddingBottom: 4 }}>
                <Label style={{ letterSpacing: 1.8 }}>Hikâyeyi oku</Label>
              </View>
            </Pressable>
          </Gutter>
        </View>

        {/* Newsletter */}
        <View
          style={{
            marginTop: 52,
            backgroundColor: Colors.paperDeep,
            paddingHorizontal: Layout.gutter,
            paddingVertical: 44,
          }}>
          <Label align="center" style={{ color: Colors.inkMuted, letterSpacing: 2.4 }}>
            Bülten
          </Label>
          <Display level="m" align="center" style={{ marginTop: 12 }}>
            İlk haber sizde
          </Display>
          <Body align="center" style={{ marginTop: 8, fontSize: 12.5 }}>
            Yeni koleksiyonlar, RİMAS notları ve özel davetler.
          </Body>
          <View
            style={{
              marginTop: 22,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: Colors.lineStrong,
              paddingBottom: 8,
            }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresiniz"
              placeholderTextColor={Colors.inkMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                flex: 1,
                fontFamily: 'Inter',
                fontSize: 13,
                color: Colors.ink,
                paddingVertical: 4,
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abone ol"
              hitSlop={10}
              onPress={() => {
                if (!email.includes('@')) {
                  toast.show('Geçerli bir e-posta girin');
                  return;
                }
                setEmail('');
                toast.show('Bültene kaydınız alındı');
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Ionicons name="arrow-forward" size={18} color={Colors.ink} />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingTop: 40, paddingBottom: 8, alignItems: 'center' }}>
          <BrandMark height={46} />
          <Small style={{ marginTop: 10, fontSize: 10.5, letterSpacing: 0.6 }}>
            İstanbul · 2026
          </Small>
          <View
            style={{
              flexDirection: 'row',
              gap: 18,
              marginTop: 18,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            {['Hakkımızda', 'Kargo', 'İade', 'İletişim'].map((item) => (
              <Pressable key={item} onPress={() => router.push('/about')}>
                <Small style={{ fontSize: 10, letterSpacing: 0.8 }}>{item}</Small>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </Animated.ScrollView>

      <View style={styles.floatingHeader} pointerEvents="box-none">
        {/* Frosted plate: dark over the hero, warm paper over the page. */}
        <Animated.View
          style={[StyleSheet.absoluteFill, darkGlassStyle]}
          pointerEvents="none">
          <BlurView
            intensity={26}
            tint="dark"
            style={[glassPlate, feather]}
          />
          <LinearGradient
            colors={[DARK_GLASS, DARK_GLASS, 'rgba(17,17,16,0)']}
            locations={veilLocations}
            style={glassPlate}
          />
        </Animated.View>
        <Animated.View
          style={[StyleSheet.absoluteFill, lightGlassStyle]}
          pointerEvents="none">
          <BlurView
            intensity={40}
            tint="light"
            style={[glassPlate, feather]}
          />
          <LinearGradient
            colors={[LIGHT_GLASS, LIGHT_GLASS, 'rgba(247,245,241,0)']}
            locations={veilLocations}
            style={glassPlate}
          />
        </Animated.View>

        <Animated.View style={paperHeaderStyle} pointerEvents="none">
          <HomeHeader light />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, inkHeaderStyle]}>
          <HomeHeader />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
