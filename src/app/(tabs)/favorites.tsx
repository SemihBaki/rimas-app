import { router } from 'expo-router';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ProductCard } from '@/components/product-card';
import { Body, Display, Label } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { buildMetadata } from '@/lib/seo';
import { useFavorites } from '@/store/shop';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Favoriler — RİMAS',
    description: 'Kaydettiğiniz parçalar tek bir listede.',
    noIndex: true,
  });

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const favorites = useFavorites();

  const contentWidth = Math.min(width, Layout.maxWidth);
  const cardWidth = (contentWidth - Layout.gutter * 2 - 12) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: Layout.gutter }}>
          <Label style={{ color: Colors.inkMuted }}>Listem</Label>
          <Display level="xl" style={{ marginTop: 10 }}>
            Favoriler
          </Display>
          <Body style={{ marginTop: 10 }}>
            {favorites.length > 0
              ? `${favorites.length} parça kaydedildi.`
              : 'Beğendiğiniz parçaları kalp ikonuyla kaydedin.'}
          </Body>
        </View>

        {favorites.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            kicker="Henüz boş"
            title="Listeniz sizi bekliyor"
            copy="Koleksiyonda gezinirken kalp ikonuna dokunun; parçalar burada sizin için saklansın."
            actionLabel="Koleksiyona git"
            onAction={() => router.push('/collections')}
          />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              paddingHorizontal: Layout.gutter,
              paddingTop: 28,
            }}>
            {favorites.map((product) => (
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
