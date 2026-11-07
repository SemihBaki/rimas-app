import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { Body, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { CATEGORIES, categoryName, productsByCategory, type CategoryId } from '@/data/catalog';
import { buildMetadata, firstParam } from '@/lib/seo';

export const generateMetadata: GenerateMetadataFunction = (_request, params) => {
  const slug = firstParam(params.slug);
  const isAll = !slug || slug === 'tumu';
  const category = isAll ? undefined : CATEGORIES.find((item) => item.id === slug);

  if (!isAll && !category) {
    return buildMetadata(
      {
        title: 'Koleksiyon bulunamadı — RİMAS',
        description: 'Aradığınız kategori kaldırılmış olabilir.',
        noIndex: true,
      },
      _request
    );
  }

  return buildMetadata(
    {
      title: `${isAll ? 'Tüm Parçalar' : (category?.name ?? '')} — RİMAS`,
      description: isAll
        ? 'Sonbahar / kış sezonunun tüm parçaları: trençkot, blazer, elbise, gömlek, triko, denim ve aksesuar.'
        : `${category?.name}: ${category?.caption}. Az sayıda üretilen, uzun ömürlü parçalar.`,
      path: `/collection/${slug ?? 'tumu'}`,
    },
    _request
  );
};

export default function CollectionScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isAll = !slug || slug === 'tumu';
  const category = isAll ? undefined : CATEGORIES.find((item) => item.id === slug);
  const valid = isAll || Boolean(category);

  const contentWidth = Math.min(width, Layout.maxWidth);
  const cardWidth = (contentWidth - Layout.gutter * 2 - 12) / 2;

  if (!valid) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.paper }}>
        <ScreenHeader title="Koleksiyon" />
        <EmptyState
          icon="search-outline"
          title="Koleksiyon bulunamadı"
          copy="Aradığınız kategori kaldırılmış olabilir. Tüm parçalara göz atın."
          actionLabel="Tüm parçalar"
          onAction={() => router.replace('/collection/tumu')}
        />
      </View>
    );
  }

  const activeId: CategoryId | 'tumu' = isAll ? 'tumu' : (slug as CategoryId);
  const products = productsByCategory(activeId);
  const title = isAll ? 'Tüm Parçalar' : categoryName(activeId as CategoryId);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader
        title={title}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ara"
            hitSlop={12}
            onPress={() => router.push('/search')}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 6 })}>
            <Ionicons name="search-outline" size={19} color={Colors.ink} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 26 }}>
          <Label style={{ color: Colors.inkMuted }}>
            {isAll ? 'Sezon 26' : 'Koleksiyon'}
          </Label>
          <Display level="xl" style={{ marginTop: 10 }}>
            {title}
          </Display>
          <Body style={{ marginTop: 10, maxWidth: 400 }}>
            {isAll
              ? 'Sonbahar / kış sezonunun tüm parçaları. Kumaş, kalıp ve terzilik detaylarıyla.'
              : category?.caption}
          </Body>
          <Small style={{ marginTop: 12, fontSize: 10.5, letterSpacing: 0.8 }}>
            {products.length} parça
          </Small>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Layout.gutter,
            paddingTop: 22,
            gap: 8,
          }}>
          <Chip
            label="Tümü"
            active={isAll}
            onPress={() => router.replace('/collection/tumu')}
          />
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              label={item.name}
              active={activeId === item.id}
              onPress={() => router.replace(`/collection/${item.id}`)}
            />
          ))}
        </ScrollView>

        {products.length === 0 ? (
          <EmptyState
            icon="shirt-outline"
            title="Bu kategoride henüz parça yok"
            copy="Yeni parçalar yakında eklenecek. Şimdilik tüm koleksiyona göz atabilirsiniz."
            actionLabel="Tüm parçalar"
            onAction={() => router.replace('/collection/tumu')}
          />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              paddingHorizontal: Layout.gutter,
              paddingTop: 26,
            }}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                width={cardWidth}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        height: 34,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: active ? Colors.ink : Colors.lineStrong,
        backgroundColor: active ? Colors.ink : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Label
        style={{
          color: active ? Colors.paper : Colors.ink,
          letterSpacing: 1.2,
          fontSize: 9,
        }}>
        {label}
      </Label>
    </Pressable>
  );
}
