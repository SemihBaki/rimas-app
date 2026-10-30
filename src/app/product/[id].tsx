import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { useEffect, useRef, useState } from 'react';
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
import {
  categoryName,
  getProduct,
  packAvailable,
  packDistribution,
  packLabel,
  packNetPrice,
  packPieces,
  relatedProducts,
  sizeGuideFor,
} from '@/data/catalog';
import { formatPrice, sizeLabel } from '@/lib/format';
import { roundMoney } from '@/lib/pricing';
import { buildMetadata, firstParam } from '@/lib/seo';
import { MAX_LINE_QTY, useShop } from '@/store/shop';

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
  const [mode, setMode] = useState<'pack' | 'piece'>(
    product && product.packs.length > 0 ? 'pack' : 'piece'
  );
  const [packIndex, setPackIndex] = useState(0);
  const [size, setSize] = useState<string | null>(
    product && product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

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

  const packs = product.packs;
  const activePack = packs.length > 0 ? packs[Math.min(packIndex, packs.length - 1)] : null;
  const pack = mode === 'pack' ? activePack : null;
  const piecesPerPack = pack ? packPieces(pack) : 1;
  /** Net price of one cart unit: one pack, or one piece. */
  const unitNet = pack ? packNetPrice(product, pack) : product.unitPrice;
  const lineNet = roundMoney(unitNet * quantity);
  /** Header always advertises the per-piece price, never the pack total. */
  const listPrice = product.listUnitPrice ?? null;
  const canBuy = mode === 'pack' ? Boolean(pack) : Boolean(size);

  const handleAdd = () => {
    if (!canBuy) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      toast.show(mode === 'pack' ? 'Lütfen bir seri seçin' : 'Lütfen bir beden seçin');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addToCart({
      productId: product.id,
      packId: pack ? pack.id : null,
      size: pack ? null : size,
      color: color.name,
      qty: quantity,
    });
    setJustAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 3000);
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
            accessibilityLabel={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            accessibilityState={{ selected: favorite }}
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 9,
              marginTop: 12,
              flexWrap: 'wrap',
            }}>
            <Money value={formatPrice(product.unitPrice)} size={15} />
            <Small style={{ fontSize: 11 }}>/ adet</Small>
            <Label style={{ fontSize: 9, letterSpacing: 1.6 }}>+ KDV</Label>
            {listPrice ? (
              <Small
                style={{
                  textDecorationLine: 'line-through',
                  fontSize: 12.5,
                  color: Colors.inkMuted,
                }}>
                {formatPrice(listPrice)}
              </Small>
            ) : null}
            {listPrice ? (
              <View style={{ backgroundColor: Colors.ink, paddingHorizontal: 6, paddingVertical: 3 }}>
                <Label style={{ color: Colors.paper, fontSize: 8, letterSpacing: 1 }}>
                  İndirim
                </Label>
              </View>
            ) : null}
          </View>

          {activePack ? (
            <Small style={{ marginTop: 8, fontSize: 11 }}>
              Seri fiyatı · {packLabel(activePack)} ·{' '}
              {formatPrice(packNetPrice(product, activePack))} + KDV
            </Small>
          ) : (
            <Small style={{ marginTop: 8, fontSize: 11 }}>
              Tek parça olarak satılır · Fiyatlar KDV hariçtir
            </Small>
          )}

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

        {/* Purchase unit: packs first, single piece only as an exception */}
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 26 }}>
          {packs.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>Seri</Label>
                {guide ? (
                  <TextButton
                    label="Beden tablosu"
                    underline={false}
                    onPress={() => setSizeGuideOpen(true)}
                  />
                ) : null}
              </View>

              <View style={{ marginTop: 12, gap: 8 }}>
                {packs.map((option, index) => {
                  const selected = mode === 'pack' && index === packIndex;
                  const available = packAvailable(product, option);
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected, disabled: !available }}
                      accessibilityLabel={`${packLabel(option)}, ${formatPrice(
                        packNetPrice(product, option)
                      )}`}
                      disabled={!available}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setMode('pack');
                        setPackIndex(index);
                      }}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        borderWidth: 1,
                        borderColor: selected ? Colors.ink : Colors.lineStrong,
                        backgroundColor: selected ? Colors.ink : 'transparent',
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        opacity: !available ? 0.4 : pressed ? 0.7 : 1,
                      })}>
                      <View style={{ flex: 1 }}>
                        <Label
                          style={{
                            color: selected ? Colors.paper : Colors.ink,
                            letterSpacing: 1.2,
                          }}>
                          {packLabel(option)}
                        </Label>
                        <Small
                          style={{
                            marginTop: 5,
                            fontSize: 10.5,
                            color: selected ? 'rgba(247,245,241,0.72)' : Colors.inkMuted,
                          }}>
                          {packDistribution(option)}
                        </Small>
                        {!available ? (
                          <Small style={{ marginTop: 4, fontSize: 10 }}>Beden tükendi</Small>
                        ) : null}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Money
                          value={formatPrice(packNetPrice(product, option))}
                          tone={selected ? 'paper' : 'ink'}
                          size={13}
                        />
                        <Small
                          style={{
                            marginTop: 3,
                            fontSize: 9.5,
                            color: selected ? 'rgba(247,245,241,0.72)' : Colors.inkMuted,
                          }}>
                          {packPieces(option)} parça
                        </Small>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Small style={{ marginTop: 10, fontSize: 10.5 }}>
                Seri içeriği sabittir; adet olarak istediğiniz seri sayısını seçersiniz.
              </Small>
            </>
          ) : null}

          {product.allowSinglePiece ? (
            <View style={{ marginTop: packs.length > 0 ? 22 : 0 }}>
              <Label>Satış biçimi</Label>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                {packs.length > 0 ? (
                  <ModeChip
                    label="Seri"
                    selected={mode === 'pack'}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setMode('pack');
                    }}
                  />
                ) : null}
                <ModeChip
                  label="Tek parça"
                  selected={mode === 'piece'}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setMode('piece');
                  }}
                />
              </View>
            </View>
          ) : null}

          {mode === 'piece' ? (
            <View style={{ marginTop: 18 }}>
              <Label>Beden</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {product.sizes.map((option) => {
                  const soldOut = product.soldOutSizes?.includes(option) ?? false;
                  const selected = size === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityLabel={sizeLabel(option)}
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
            </View>
          ) : null}

          <Small style={{ marginTop: 12, fontSize: 11 }}>
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
          <Label>{mode === 'pack' ? 'Seri adedi' : 'Adet'}</Label>
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
              onPress={() => setQuantity((value) => Math.min(MAX_LINE_QTY, value + 1))}
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
              1–3 iş günü içinde kargoya verilir. 5.000 ₺ (KDV hariç) üzeri
              siparişlerde kargo ücretsizdir. Teslimattan itibaren 30 gün içinde iade
              edebilirsiniz.
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 8,
            paddingHorizontal: 2,
          }}>
          <Small style={{ fontSize: 10.5 }}>
            {pack ? `${packLabel(pack)} × ${quantity} · ${piecesPerPack * quantity} parça` : `${quantity} adet`}
          </Small>
          <Small style={{ fontSize: 10.5 }}>
            {pack ? 'Seri fiyatı' : 'Tekli fiyat'} · {formatPrice(lineNet)} + KDV
          </Small>
        </View>
        <PrimaryButton
          label={
            canBuy
              ? 'Sepete ekle'
              : mode === 'pack'
                ? 'Seri seçin'
                : 'Beden seçin'
          }
          onPress={handleAdd}
        />
      </View>

      {justAdded ? (
        <View
          style={{
            position: 'absolute',
            left: Layout.gutter,
            right: Layout.gutter,
            bottom: insets.bottom + 82,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors.ink,
            paddingHorizontal: 18,
            height: 52,
            gap: 12,
          }}>
          <Body tone='paper' style={{ fontSize: 12.5 }}>
            {pack ? `${packLabel(pack)} sepete eklendi` : 'Ürün sepete eklendi'}
          </Body>
          <Pressable
            accessibilityRole='button'
            onPress={() => {
              setJustAdded(false);
              if (addedTimer.current) clearTimeout(addedTimer.current);
              router.push('/cart');
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Label style={{ color: Colors.paper, letterSpacing: 2 }}>SEPETE GİT</Label>
          </Pressable>
        </View>
      ) : null}

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

function ModeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        height: 38,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: selected ? Colors.ink : Colors.lineStrong,
        backgroundColor: selected ? Colors.ink : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}>
      <Label style={{ color: selected ? Colors.paper : Colors.ink, letterSpacing: 1.2 }}>
        {label}
      </Label>
    </Pressable>
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
