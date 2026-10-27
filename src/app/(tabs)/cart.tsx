import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, TextButton } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { QuantityStepper } from '@/components/quantity';
import { Rule } from '@/components/screen';
import { Body, BodyStrong, Display, Label, Money, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { formatPrice } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import {
  FREE_SHIPPING_THRESHOLD,
  useCartLines,
  useCartSubtotal,
  useShop,
} from '@/store/shop';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Sepet — RİMAS',
    description: 'Sepetinizdeki parçalar ve teslimat özeti.',
    noIndex: true,
  });

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const lines = useCartLines();
  const subtotal = useCartSubtotal();
  const setQty = useShop((state) => state.setQty);
  const removeLine = useShop((state) => state.removeLine);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 49.9;
  const total = subtotal + shipping;
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
  const itemCount = lines.reduce((count, line) => count + line.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: Layout.gutter }}>
          <Label style={{ color: Colors.inkMuted }}>
            {itemCount > 0 ? `${itemCount} ürün` : 'Boş'}
          </Label>
          <Display level="xl" style={{ marginTop: 10 }}>
            Sepet
          </Display>
        </View>

        {lines.length === 0 ? (
          <EmptyState
            icon="bag-outline"
            kicker="Sepetiniz boş"
            title="Henüz bir seçim yok"
            copy="Sezonun parçalarına göz atın; beğendiklerinizi sepete ekleyin."
            actionLabel="Alışverişe başla"
            onAction={() => router.push('/collections')}
          />
        ) : (
          <>
            {/* Free shipping progress */}
            <View
              style={{
                marginTop: 22,
                marginHorizontal: Layout.gutter,
                padding: 16,
                backgroundColor: Colors.paperDeep,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <Label style={{ letterSpacing: 1.3 }}>
                  {remaining > 0 ? 'Ücretsiz kargoya az kaldı' : 'Kargo bizden'}
                </Label>
                <Ionicons
                  name={remaining > 0 ? 'cube-outline' : 'checkmark-circle-outline'}
                  size={17}
                  color={Colors.ink}
                />
              </View>
              <Small style={{ marginTop: 6, fontSize: 11 }}>
                {remaining > 0
                  ? `${formatPrice(remaining)} daha ekleyin, kargo ücretsiz olsun.`
                  : 'Siparişiniz ücretsiz kargo ile gönderilecek.'}
              </Small>
              <View
                style={{
                  height: 2,
                  backgroundColor: Colors.lineStrong,
                  marginTop: 12,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    height: 2,
                    width: `${progress * 100}%`,
                    backgroundColor: Colors.ink,
                  }}
                />
              </View>
            </View>

            {/* Lines */}
            <View style={{ paddingTop: 8, paddingHorizontal: Layout.gutter }}>
              {lines.map((line, index) => (
                <View key={line.id}>
                  {index > 0 ? <Rule /> : null}
                  <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 18 }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={line.product.name}
                      onPress={() => router.push(`/product/${line.product.id}`)}
                      style={{ backgroundColor: Colors.paperDeep }}>
                      <Image
                        source={line.product.images[0]}
                        style={{ width: 92, height: 120 }}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </Pressable>

                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}>
                          <View style={{ flex: 1 }}>
                            <BodyStrong numberOfLines={2} style={{ lineHeight: 19 }}>
                              {line.product.name}
                            </BodyStrong>
                            <Small style={{ marginTop: 5, fontSize: 11 }}>
                              {line.color} · {line.size}
                            </Small>
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Ürünü kaldır"
                            hitSlop={10}
                            onPress={() => {
                              Haptics.selectionAsync().catch(() => {});
                              removeLine(line.id);
                            }}
                            style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}>
                            <Ionicons name="close" size={16} color={Colors.inkMuted} />
                          </Pressable>
                        </View>

                        <Money
                          value={formatPrice(line.product.price)}
                          size={12.5}
                          style={{ marginTop: 8 }}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 12,
                        }}>
                        <QuantityStepper
                          value={line.qty}
                          onChange={(qty) => setQty(line.id, qty)}
                        />
                        <Money value={formatPrice(line.lineTotal)} size={13} />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              <Rule />
            </View>

            {/* Summary */}
            <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 22 }}>
              <Label style={{ color: Colors.inkMuted }}>Sipariş özeti</Label>

              <View style={{ gap: 10, marginTop: 16 }}>
                <SummaryRow label="Ara toplam" value={formatPrice(subtotal)} />
                <SummaryRow
                  label="Kargo"
                  value={shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: Colors.lineStrong,
                }}>
                <Label style={{ color: Colors.ink, letterSpacing: 1.6 }}>Toplam</Label>
                <Money value={formatPrice(total)} size={18} />
              </View>

              <PrimaryButton
                label="Ödemeye geç"
                onPress={() => router.push('/checkout')}
                style={{ marginTop: 20 }}
              />
              <TextButton
                label="Alışverişe devam et"
                onPress={() => router.push('/collections')}
                style={{ alignSelf: 'center', marginTop: 18 }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  marginTop: 22,
                }}>
                <Ionicons name="lock-closed-outline" size={12} color={Colors.inkMuted} />
                <Small style={{ fontSize: 10.5 }}>
                  Güvenli ödeme · 30 gün içinde iade
                </Small>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Body style={{ fontSize: 13 }}>{label}</Body>
      <BodyStrong style={{ fontSize: 13 }}>{value}</BodyStrong>
    </View>
  );
}
