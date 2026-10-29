import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Spacing } from '@/constants/theme';
import {
  entryPrice,
  packLabel,
  packListPrice,
  primaryPack,
  type Product,
} from '@/data/catalog';
import { formatPrice } from '@/lib/format';
import { useShop } from '@/store/shop';

import { BodyStrong, Label, Money, Small } from './typography';

type ProductCardProps = {
  product: Product;
  width?: number;
  style?: StyleProp<ViewStyle>;
  showFavorite?: boolean;
};

export function ProductCard({
  product,
  width,
  style,
  showFavorite = true,
}: ProductCardProps) {
  const favorite = useShop((state) => state.favorites.includes(product.id));
  const toggleFavorite = useShop((state) => state.toggleFavorite);
  const scale = useSharedValue(1);

  const pack = primaryPack(product);
  const price = entryPrice(product);
  const listPrice = pack ? packListPrice(product, pack) : product.listUnitPrice ?? null;
  const unitLabel = pack ? packLabel(pack) : 'Tek parça';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[width ? { width } : { flex: 1 }, animatedStyle, style]}>
      <View style={{ position: 'relative' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={product.name}
          onPressIn={() => {
            scale.set(withTiming(0.975, { duration: 120 }));
          }}
          onPressOut={() => {
            scale.set(withTiming(1, { duration: 180 }));
          }}
          onPress={() => router.push(`/product/${product.id}`)}>
          <View style={{ backgroundColor: Colors.paperDeep, overflow: 'hidden' }}>
            <Image
              source={product.images[0]}
              style={{ width: '100%', aspectRatio: 0.75 }}
              contentFit="cover"
              transition={260}
              cachePolicy="memory-disk"
            />

            {product.badge ? (
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: Colors.paper,
                  paddingHorizontal: 7,
                  paddingVertical: 4,
                }}>
                <Label style={{ fontSize: 8.5, letterSpacing: 1.2, lineHeight: 11 }}>
                  {product.badge}
                </Label>
              </View>
            ) : null}
          </View>

          <View style={{ paddingTop: 10, gap: 3 }}>
            <BodyStrong numberOfLines={1} style={{ fontSize: 12.5, lineHeight: 17 }}>
              {product.name}
            </BodyStrong>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
              <Money value={formatPrice(price)} size={12.5} />
              <Label style={{ fontSize: 8, letterSpacing: 1.2 }}>+ KDV</Label>
              {listPrice ? (
                <Small
                  style={{
                    fontSize: 11.5,
                    textDecorationLine: 'line-through',
                    color: Colors.inkMuted,
                  }}>
                  {formatPrice(listPrice)}
                </Small>
              ) : null}
            </View>
            <Small style={{ fontSize: 10.5, color: Colors.inkMuted, marginTop: 1 }}>
              {unitLabel} · {product.colors.length} renk
            </Small>
          </View>
        </Pressable>

        {showFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            hitSlop={8}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              toggleFavorite(product.id);
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: 'rgba(247,245,241,0.88)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={15} color={Colors.ink} />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} width={168} />
      ))}
    </View>
  );
}
