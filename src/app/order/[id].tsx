import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, TextButton } from '@/components/button';
import { BrandMark } from '@/components/brand-mark';
import { useToast } from '@/components/toast';
import { Body, BodyStrong, Display, Label, Money, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { formatPrice } from '@/lib/format';
import { buildMetadata, firstParam } from '@/lib/seo';
import { useShop } from '@/store/shop';

export const generateMetadata: GenerateMetadataFunction = (_request, params) => {
  const number = firstParam(params.id);
  return buildMetadata({
    title: number ? `Sipariş ${number} — RİMAS` : 'Sipariş Onayı — RİMAS',
    description: 'Siparişiniz alındı. Hazırlık, kargo ve teslim adımlarını buradan takip edebilirsiniz.',
    noIndex: true,
  });
};

const STEPS = [
  { label: 'Sipariş onaylandı', done: true },
  { label: 'Hazırlanıyor', done: false },
  { label: 'Kargoda', done: false },
  { label: 'Teslim edildi', done: false },
];

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const lastOrder = useShop((state) => state.lastOrder);

  const order = lastOrder && lastOrder.number === id ? lastOrder : null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: Layout.gutter,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <BrandMark height={30} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            hitSlop={12}
            onPress={() => router.replace('/')}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
            <Ionicons name="close" size={20} color={Colors.ink} />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginTop: 44 }}>
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 31,
              borderWidth: 1,
              borderColor: Colors.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="checkmark" size={26} color={Colors.ink} />
          </View>
          <Label style={{ marginTop: 22, color: Colors.inkMuted, letterSpacing: 2.4 }}>
            Sipariş alındı
          </Label>
          <Display level="xl" align="center" style={{ marginTop: 10 }}>
            Teşekkürler
          </Display>
          <Body align="center" style={{ marginTop: 12, maxWidth: 330 }}>
            Siparişiniz hazırlanmaya başladı. Hazır olduğunda kargo bilgilerini
            paylaşacağız.
          </Body>
        </View>

        {/* Order card */}
        <View
          style={{
            marginTop: 32,
            borderWidth: 1,
            borderColor: Colors.line,
            backgroundColor: Colors.surface,
            padding: 18,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
            }}>
            <Label style={{ color: Colors.inkMuted }}>Sipariş no</Label>
            <BodyStrong style={{ fontSize: 13 }}>{order?.number ?? id ?? '—'}</BodyStrong>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 12,
            }}>
            <Label style={{ color: Colors.inkMuted }}>Tahmini teslim</Label>
            <BodyStrong style={{ fontSize: 13 }}>{order?.delivery ?? '3 iş günü'}</BodyStrong>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 12,
            }}>
            <Label style={{ color: Colors.inkMuted }}>Ürün</Label>
            <BodyStrong style={{ fontSize: 13 }}>
              {order ? `${order.itemCount} parça` : '—'}
            </BodyStrong>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 12,
            }}>
            <Label style={{ color: Colors.inkMuted }}>Toplam</Label>
            <Money value={order ? formatPrice(order.total) : '—'} size={14} />
          </View>

          {order?.email ? (
            <View
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: Colors.line,
              }}>
              <Small style={{ fontSize: 10.5, lineHeight: 16 }}>
                Onay e-postası {order.email} adresine gönderildi.
              </Small>
            </View>
          ) : null}
        </View>

        {/* Timeline */}
        <View style={{ marginTop: 30 }}>
          <Label style={{ color: Colors.inkMuted }}>Süreç</Label>
          <View style={{ marginTop: 14 }}>
            {STEPS.map((step, index) => (
              <View
                key={step.label}
                style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                <View style={{ alignItems: 'center', width: 14 }}>
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: step.done ? Colors.ink : Colors.lineStrong,
                      marginTop: 4,
                    }}
                  />
                  {index < STEPS.length - 1 ? (
                    <View
                      style={{
                        width: 1,
                        height: 28,
                        backgroundColor: step.done ? Colors.inkSoft : Colors.lineStrong,
                        marginTop: 4,
                      }}
                    />
                  ) : null}
                </View>
                <Body
                  style={{
                    fontSize: 12.5,
                    color: step.done ? Colors.ink : Colors.inkMuted,
                    paddingBottom: 16,
                  }}>
                  {step.label}
                </Body>
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton
          label="Alışverişe devam et"
          onPress={() => router.replace('/')}
          style={{ marginTop: 18 }}
        />
        <TextButton
          label="Siparişi takip et"
          onPress={() => toast.show('Kargo takibi yakında')}
          style={{ alignSelf: 'center', marginTop: 18 }}
        />
      </ScrollView>
    </View>
  );
}
