import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accordion } from '@/components/accordion';
import { PrimaryButton, TextButton } from '@/components/button';
import { ProductCard } from '@/components/product-card';
import { Rule } from '@/components/screen';
import { SectionHeading } from '@/components/section-heading';
import { SizeGuideSheet } from '@/components/size-guide';
import { useToast } from '@/components/toast';
import { Body, BodyStrong, Display, Label, Money, Small } from '@/components/typography';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { categoryName, getProduct, relatedProducts, sizeGuideFor } from '@/data/catalog';
import { formatPrice } from '@/lib/format';
import { buildMetadata, firstParam } from '@/lib/seo';
import { useShop } from '@/store/shop';

export const generateMetadata: GenerateMetadataFunction = (_request, params) => {
  const product = getProduct(firstParam(params.id));

  if (!product) {
    return buildMetadata({
      title: 'Ürün bulunamadı — RİMAS',
      description: 'Aradığınız parça koleksiyondan kaldırılmış olabilir.',
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${product.name} — RİMAS`,
    description: product.summary,
  });
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const toast = useToast();

  const addToCart = useShop((state) => state.addToCart);
  const toggleFavorite = useShop((state) => state.toggleFavorite);
  const favorite = useShop((state) =>
    product ? state.favorites.includes(product.id) : false
  );

  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<string | null>(
    product && product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const pageWidth = Math.min(width, Layout.maxWidth);

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Display level="m">Ürün bulunamadı</Display>
        <TextButton label="Geri dön" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const color = product.colors[colorIndex];
  const related = relatedProducts(product);
  const guide = sizeGuideFor(product);

  const handleAdd = () => {
    if (!size) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      toast.show('Lütfen bir beden seçin');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addToCart(product.id, size, color.name, quantity);
    toast.show('Ürün sepete eklendi');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        {/* Gallery */}
        <View style={{ backgroundColor: Colors.paperDeep }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
              setActiveImage(index);
            }}>
            {product.images.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={{ width: pageWidth, height: pageWidth * 1.28 }}
                contentFit="cover"
                transition={250}
                cachePolicy="memory-disk"
              />
            ))}
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              bottom: 14,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === activeImage ? 18 : 5,
                  height: 2,
                  backgroundColor:
                    index === activeImage ? Colors.ink : 'rgba(17,17,16,0.28)',
                }}
              />
            ))}
          </View>
        </View>

        {/* Floating controls */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: Layout.gutter,
            right: Layout.gutter,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Geri"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.circleButton, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="arrow-back" size={18} color={Colors.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Favorilere ekle"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              toggleFavorite(product.id);
            }}
            style={({ pressed }) => [styles.circleButton, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={18}
              color={Colors.ink}
            />
          </Pressable>
        </View>

        {/* Info */}
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 26 }}>
          <Label style={{ color: Colors.inkMuted }}>{categoryName(product.category)}</Label>
          <Display level="m" style={{ marginTop: 10 }}>
            {product.name}
          </Display>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <Money value={formatPrice(product.price)} size={15} />
            {product.compareAt ? (
              <Small
                style={{
                  textDecorationLine: 'line-through',
                  fontSize: 12.5,
                  color: Colors.inkMuted,
                }}>
                {formatPrice(product.compareAt)}
              </Small>
            ) : null}
            {product.compareAt ? (
              <View style={{ backgroundColor: Colors.ink, paddingHorizontal: 6, paddingVertical: 3 }}>
                <Label style={{ color: Colors.paper, fontSize: 8, letterSpacing: 1 }}>
                  İndirim
                </Label>
              </View>
            ) : null}
          </View>

          <Body style={{ marginTop: 16 }}>{product.summary}</Body>
        </View>

        {/* Color */}
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Label>Renk</Label>
            <Label style={{ color: Colors.ink, letterSpacing: 1 }}>
              {color.name}
            </Label>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {product.colors.map((option, index) => {
              const selected = index === colorIndex;
              return (
                <Pressable
                  key={option.name}
                  accessibilityRole="button"
                  accessibilityLabel={option.name}
                  onPress={() => setColorIndex(index)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: selected ? Colors.ink : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: option.hex,
                      borderWidth: option.hex === '#F7F6F3' ? 1 : 0,
                      borderColor: Colors.line,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Size */}
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 26 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label>Beden</Label>
            {guide ? (
              <TextButton
                label="Beden tablosu"
                underline={false}
                onPress={() => setSizeGuideOpen(true)}
              />
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {product.sizes.map((option) => {
              const soldOut = product.soldOutSizes?.includes(option) ?? false;
              const selected = size === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={
                    option.toLocaleLowerCase('tr').startsWith('tek ')
                      ? option
                      : `${option} beden`
                  }
                  disabled={soldOut}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSize(option);
                  }}
                  style={{
                    minWidth: 48,
                    height: 40,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: selected ? Colors.ink : Colors.lineStrong,
                    backgroundColor: selected ? Colors.ink : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: soldOut ? 0.35 : 1,
                  }}>
                  <Label
                    style={{
                      color: selected ? Colors.paper : Colors.ink,
                      letterSpacing: 1.2,
                      textDecorationLine: soldOut ? 'line-through' : 'none',
                    }}>
                    {option}
                  </Label>
                </Pressable>
              );
            })}
          </View>
          <Small style={{ marginTop: 10, fontSize: 11 }}>
            {product.fit}
          </Small>
        </View>

        {/* Quantity */}
        <View
          style={{
            marginTop: 26,
            paddingHorizontal: Layout.gutter,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Label>Adet</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <Pressable
              hitSlop={10}
              onPress={() => setQuantity((value) => Math.max(1, value - 1))}
              style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}>
              <Ionicons name="remove" size={16} color={Colors.ink} />
            </Pressable>
            <BodyStrong style={{ minWidth: 18, textAlign: 'center' }}>{quantity}</BodyStrong>
            <Pressable
              hitSlop={10}
              onPress={() => setQuantity((value) => Math.min(10, value + 1))}
              style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}>
              <Ionicons name="add" size={16} color={Colors.ink} />
            </Pressable>
          </View>
        </View>

        {/* Details */}
        <View style={{ paddingHorizontal: Layout.gutter, marginTop: 30 }}>
          <Rule />
          <Accordion title="Ürün Detayı" defaultOpen>
            <Body style={{ marginBottom: 10 }}>{product.summary}</Body>
            {product.details.map((detail) => (
              <View key={detail} style={{ flexDirection: 'row', gap: 8, marginBottom: 5 }}>
                <Body style={{ color: Colors.inkMuted }}>—</Body>
                <Body style={{ flex: 1 }}>{detail}</Body>
              </View>
            ))}
          </Accordion>
          <Accordion title="Kumaş & Bakım">
            <Body>{product.composition}</Body>
            <Body style={{ marginTop: 6 }}>{product.care}</Body>
          </Accordion>
          <Accordion title="Kargo & İade">
            <Body>
              1–3 iş günü içinde kargoya verilir. 2.000 ₺ üzeri siparişlerde kargo
              ücretsizdir. Teslimattan itibaren 30 gün içinde iade edebilirsiniz.
            </Body>
          </Accordion>
        </View>

        {/* Related */}
        <View style={{ paddingTop: 38 }}>
          <View style={{ paddingHorizontal: Layout.gutter }}>
            <SectionHeading kicker="Tamamlayın" title="Benzer Parçalar" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Layout.gutter,
              paddingTop: 18,
              gap: Spacing.sm,
            }}>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} width={164} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky add-to-cart */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: Layout.gutter,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: Colors.paper,
          borderTopWidth: 1,
          borderTopColor: Colors.line,
        }}>
        <PrimaryButton
          label={size ? `Sepete ekle · ${formatPrice(product.price * quantity)}` : 'Beden seçin'}
          onPress={handleAdd}
        />
      </View>

      <SizeGuideSheet
        visible={sizeGuideOpen}
        product={product}
        selectedSize={size}
        onClose={() => setSizeGuideOpen(false)}
        onSelect={(chosen) => {
          Haptics.selectionAsync().catch(() => {});
          setSize(chosen);
          setSizeGuideOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(247,245,241,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
