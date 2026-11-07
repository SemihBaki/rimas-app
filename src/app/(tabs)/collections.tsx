import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { Body, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { CATEGORIES, EDITORIALS } from '@/data/catalog';
import { buildMetadata } from '@/lib/seo';

export const generateMetadata: GenerateMetadataFunction = (request) =>
  buildMetadata(
    {
      title: 'Koleksiyon — RİMAS',
      description:
        'Sezonun tüm parçaları: dış giyim, elbise, gömlek, triko, denim ve aksesuar. Kumaş hikâyeleriyle birlikte, az sayıda üretildi.',
      path: '/collections',
    },
    request
  );

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const lookbook = EDITORIALS[0];
  const story = EDITORIALS[1];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={{ paddingTop: insets.top + 14, paddingHorizontal: Layout.gutter }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <BrandMark height={34} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ara"
              hitSlop={12}
              onPress={() => router.push('/search')}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Ionicons name="search-outline" size={20} color={Colors.ink} />
            </Pressable>
          </View>

          <Display level="xl" style={{ marginTop: 28 }}>
            Koleksiyon
          </Display>
          <Body style={{ marginTop: 12, maxWidth: 380 }}>
            Sezonun tüm parçaları, kumaş hikâyeleriyle birlikte. Az sayıda üretilir; uzun
            süre kullanılmak üzere tasarlanır.
          </Body>
        </View>

        {/* Lookbook */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lookbook.title}
          onPress={() => router.push('/collection/tumu')}
          style={({ pressed }) => ({ marginTop: 28, opacity: pressed ? 0.85 : 1 })}>
          <View style={{ height: 430, backgroundColor: Colors.ink }}>
            <Image
              source={lookbook.image}
              accessibilityLabel={lookbook.title}
              style={{ flex: 1 }}
              contentFit="cover"
              transition={400}
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(17,17,16,0.05)', 'rgba(17,17,16,0.68)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View
              style={{
                position: 'absolute',
                left: Layout.gutter,
                right: Layout.gutter,
                bottom: 28,
              }}>
              <Label tone="paper" style={{ letterSpacing: 2.6 }}>
                {lookbook.kicker}
              </Label>
              <Display
                level="xl"
                tone="paper"
                style={{ marginTop: 10, fontSize: 46, lineHeight: 48 }}>
                {lookbook.title}
              </Display>
              <Body
                tone="paper"
                style={{
                  marginTop: 10,
                  color: 'rgba(247,245,241,0.82)',
                  fontSize: 12.5,
                  maxWidth: 300,
                }}>
                {lookbook.copy}
              </Body>
              <Label tone="paper" style={{ marginTop: 18, letterSpacing: 2.2 }}>
                Koleksiyonu gör →
              </Label>
            </View>
          </View>
        </Pressable>

        {/* Categories */}
        <View style={{ paddingTop: 46, paddingHorizontal: Layout.gutter }}>
          <Label style={{ color: Colors.inkMuted }}>Kategoriler</Label>
          <Display level="m" style={{ marginTop: 8 }}>
            Bir bakışta
          </Display>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
            {CATEGORIES.map((category, index) => (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                onPress={() => router.push(`/collection/${category.id}`)}
                style={({ pressed }) => ({
                  width: index < 2 ? '100%' : undefined,
                  flexGrow: index < 2 ? 1 : 1,
                  flexBasis: index < 2 ? '100%' : '45%',
                  opacity: pressed ? 0.82 : 1,
                })}>
                <View style={{ backgroundColor: Colors.paperDeep }}>
                  <Image
                    source={category.image}
                    accessibilityLabel={`${category.name} koleksiyonu`}
                    style={{ width: '100%', height: index < 2 ? 260 : 210 }}
                    contentFit="cover"
                    transition={260}
                    cachePolicy="memory-disk"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: 14,
                      backgroundColor: 'rgba(17,17,16,0.28)',
                    }}>
                    <Label tone="paper" style={{ letterSpacing: 2 }}>
                      {category.name}
                    </Label>
                    <Small
                      style={{
                        color: 'rgba(247,245,241,0.78)',
                        fontSize: 10.5,
                        marginTop: 3,
                      }}>
                      {category.caption}
                    </Small>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Story */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/about')}
          style={({ pressed }) => ({
            marginTop: 48,
            marginHorizontal: Layout.gutter,
            opacity: pressed ? 0.85 : 1,
          })}>
          <Image
            source={story.image}
            accessibilityLabel={story.title}
            style={{ width: '100%', height: 300, backgroundColor: Colors.paperDeep }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <View style={{ paddingTop: 20 }}>
            <Label style={{ color: Colors.inkMuted }}>{story.kicker}</Label>
            <Display level="m" style={{ marginTop: 8 }}>
              {story.title.replace('\n', ' ')}
            </Display>
            <Body style={{ marginTop: 8, maxWidth: 420 }}>{story.copy}</Body>
            <Label style={{ marginTop: 14, letterSpacing: 1.8 }}>Hikâyeyi oku →</Label>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
