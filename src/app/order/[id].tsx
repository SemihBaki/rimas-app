import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton, PrimaryButton, TextButton } from '@/components/button';
import { BrandMark } from '@/components/brand-mark';
import { Body, BodyStrong, Display, Label, Money, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { PRODUCTS } from '@/data/catalog';
import { ApiError, api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { buildMetadata, firstParam } from '@/lib/seo';
import { useAuth } from '@/store/auth';
import { useShop } from '@/store/shop';

export const generateMetadata: GenerateMetadataFunction = (_request, params) => {
  const number = firstParam(params.id);
  return buildMetadata({
    title: number ? `Sipariş ${number} — RİMAS` : 'Sipariş Onayı — RİMAS',
    description:
      'Siparişiniz alındı. Hazırlık, kargo ve teslim adımlarını buradan takip edebilirsiniz.',
    noIndex: true,
  });
};

type RemoteOrderItem = {
  productId: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
};

type RemoteOrder = {
  number: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  shipping: 'standart' | 'express';
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  delivery: string;
  status: 'hazirlaniyor' | 'kargoda' | 'teslim';
  createdAt: string;
  items: RemoteOrderItem[];
};

const STEPS = ['Sipariş onaylandı', 'Hazırlanıyor', 'Kargoda', 'Teslim edildi'] as const;

const STATUS_STEP: Record<RemoteOrder['status'], number> = {
  hazirlaniyor: 2,
  kargoda: 3,
  teslim: 4,
};

export default function OrderScreen() {
  const { id, fresh: freshParam } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const number = firstParam(id);
  const insets = useSafeAreaInsets();
  const authStatus = useAuth((state) => state.status);
  const lastOrder = useShop((state) =>
    state.lastOrder && state.lastOrder.number === number ? state.lastOrder : null
  );

  const [loaded, setLoaded] = useState<{
    number: string;
    order: RemoteOrder | null;
    notFound: boolean;
    failed: boolean;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!number || authStatus !== 'signedIn') return;

    let active = true;
    api<{ order: RemoteOrder }>(`/api/orders/${encodeURIComponent(number)}`)
      .then((data) => {
        if (!active) return;
        setLoaded({ number, order: data.order, notFound: false, failed: false });
      })
      .catch((caught) => {
        if (!active) return;
        if (caught instanceof ApiError && caught.status === 401) {
          useAuth.getState().clearSession();
          return;
        }
        const missing = caught instanceof ApiError && caught.status === 404;
        setLoaded({ number, order: null, notFound: missing, failed: !missing });
      });

    return () => {
      active = false;
    };
  }, [number, authStatus, reloadKey]);

  const current = loaded && loaded.number === number ? loaded : null;
  const remote = authStatus === 'signedIn' ? (current?.order ?? null) : null;
  const notFound = current?.notFound ?? false;
  const failed = current?.failed ?? false;
  const pending = authStatus === 'signedIn' && Boolean(number) && !current;

  const order = remote ?? lastOrder;
  const items = remote?.items ?? [];
  // Only the checkout hand-off shows the celebratory confirmation; opening an
  // order from history gets the neutral detail header.
  const fresh = firstParam(freshParam) === '1';
  const stage = remote ? STATUS_STEP[remote.status] : 1;
  const loading = authStatus === 'loading' || (pending && !order);

  const retry = () => {
    setLoaded(null);
    setReloadKey((key) => key + 1);
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

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
            onPress={close}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
            <Ionicons name="close" size={20} color={Colors.ink} />
          </Pressable>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 90, alignItems: 'center', gap: 14 }}>
            <ActivityIndicator color={Colors.ink} />
            <Small style={{ fontSize: 10.5 }}>Sipariş yükleniyor…</Small>
          </View>
        ) : !order ? (
          <View style={{ alignItems: 'center', paddingTop: 70 }}>
            <Ionicons name="receipt-outline" size={26} color={Colors.inkMuted} />
            <Display level="m" align="center" style={{ marginTop: 18 }}>
              {failed ? 'Sipariş yüklenemedi' : 'Sipariş bulunamadı'}
            </Display>
            <Body align="center" style={{ marginTop: 10, maxWidth: 300 }}>
              {failed
                ? 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'
                : notFound
                  ? 'Bu sipariş numarasına ait bir kayıt bulunmuyor. Numarayı kontrol edin.'
                  : 'Siparişe erişmek için giriş yapın.'}
            </Body>
            {failed ? (
              <OutlineButton
                label="Tekrar dene"
                onPress={retry}
                style={{ marginTop: 24, alignSelf: 'stretch' }}
              />
            ) : authStatus === 'signedIn' ? (
              <OutlineButton
                label="Siparişlerim"
                onPress={() => router.replace('/orders')}
                style={{ marginTop: 24, alignSelf: 'stretch' }}
              />
            ) : (
              <OutlineButton
                label="Giriş yap"
                onPress={() => router.replace('/sign-in')}
                style={{ marginTop: 24, alignSelf: 'stretch' }}
              />
            )}
            <TextButton
              label="Alışverişe devam et"
              onPress={() => router.replace('/')}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <>
            <View style={{ alignItems: 'center', marginTop: 40 }}>
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
                <Ionicons
                  name={fresh ? 'checkmark' : 'receipt-outline'}
                  size={fresh ? 26 : 24}
                  color={Colors.ink}
                />
              </View>
              <Label style={{ marginTop: 22, color: Colors.inkMuted, letterSpacing: 2.4 }}>
                {fresh ? 'Sipariş alındı' : 'Sipariş detayı'}
              </Label>
              <Display level="xl" align="center" style={{ marginTop: 10 }}>
                {fresh ? 'Teşekkürler' : order.number}
              </Display>
              <Body align="center" style={{ marginTop: 12, maxWidth: 330 }}>
                {fresh
                  ? 'Siparişiniz hazırlanmaya başladı. Hazır olduğunda kargo bilgilerini paylaşacağız.'
                  : 'Siparişinizin ayrıntıları ve teslimat durumu aşağıda.'}
              </Body>
            </View>

            {/* Order summary */}
            <View
              style={{
                marginTop: 32,
                borderWidth: 1,
                borderColor: Colors.line,
                backgroundColor: Colors.surface,
                padding: 18,
              }}>
              <DetailRow label="Sipariş no" value={order.number} first />
              {remote ? (
                <DetailRow label="Sipariş tarihi" value={formatDate(remote.createdAt)} />
              ) : null}
              <DetailRow label="Tahmini teslim" value={order.delivery} />
              <DetailRow label="Ürün" value={`${order.itemCount} parça`} />
              <DetailRow label="Toplam" value={formatPrice(order.total)} money />

              {order.email ? (
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

            {/* Items */}
            {remote && items.length > 0 ? (
              <View style={{ marginTop: 30 }}>
                <Label style={{ color: Colors.inkMuted }}>Sipariş içeriği</Label>
                <View style={{ marginTop: 12, gap: 14 }}>
                  {items.map((item) => {
                    const product = PRODUCTS.find((entry) => entry.id === item.productId);
                    return (
                      <View
                        key={`${item.productId}-${item.size}-${item.color}`}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {product ? (
                          <Image
                            source={product.images[0]}
                            style={{ width: 46, height: 58, backgroundColor: Colors.paperDeep }}
                            contentFit="cover"
                            transition={150}
                            cachePolicy="memory-disk"
                          />
                        ) : (
                          <View
                            style={{
                              width: 46,
                              height: 58,
                              backgroundColor: Colors.paperDeep,
                            }}
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <BodyStrong numberOfLines={1} style={{ fontSize: 12.5 }}>
                            {item.name}
                          </BodyStrong>
                          <Small style={{ fontSize: 10, marginTop: 3 }}>
                            {item.color} · {item.size} · {item.qty} adet
                          </Small>
                        </View>
                        <Money value={formatPrice(item.price * item.qty)} size={12} />
                      </View>
                    );
                  })}
                </View>

                <View
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: Colors.line,
                    gap: 8,
                  }}>
                  <TotalRow label="Ara toplam" value={formatPrice(remote.subtotal)} />
                  <TotalRow
                    label={remote.shipping === 'express' ? 'Express kargo' : 'Standart kargo'}
                    value={
                      remote.shippingCost === 0 ? 'Ücretsiz' : formatPrice(remote.shippingCost)
                    }
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      marginTop: 6,
                    }}>
                    <Label style={{ color: Colors.ink, letterSpacing: 1.4 }}>Toplam</Label>
                    <Money value={formatPrice(remote.total)} size={16} />
                  </View>
                </View>
              </View>
            ) : null}

            {/* Delivery address */}
            {remote?.address ? (
              <View style={{ marginTop: 30 }}>
                <Label style={{ color: Colors.inkMuted }}>Teslimat</Label>
                <View style={{ marginTop: 10, gap: 3 }}>
                  <BodyStrong style={{ fontSize: 12.5 }}>{remote.name}</BodyStrong>
                  <Body style={{ fontSize: 12 }}>{remote.address}</Body>
                  <Body style={{ fontSize: 12 }}>
                    {[remote.district, remote.city, remote.postalCode].filter(Boolean).join(', ')}
                  </Body>
                  {remote.phone ? (
                    <Small style={{ fontSize: 10.5, marginTop: 4 }}>{remote.phone}</Small>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Timeline */}
            <View style={{ marginTop: 30 }}>
              <Label style={{ color: Colors.inkMuted }}>Süreç</Label>
              <View style={{ marginTop: 14 }}>
                {STEPS.map((label, index) => {
                  const done = index < stage;
                  return (
                    <View
                      key={label}
                      style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                      <View style={{ alignItems: 'center', width: 14 }}>
                        <View
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 5,
                            backgroundColor: done ? Colors.ink : Colors.lineStrong,
                            marginTop: 4,
                          }}
                        />
                        {index < STEPS.length - 1 ? (
                          <View
                            style={{
                              width: 1,
                              height: 28,
                              backgroundColor: done ? Colors.inkSoft : Colors.lineStrong,
                              marginTop: 4,
                            }}
                          />
                        ) : null}
                      </View>
                      <Body
                        style={{
                          fontSize: 12.5,
                          color: done ? Colors.ink : Colors.inkMuted,
                          paddingBottom: 16,
                        }}>
                        {label}
                      </Body>
                    </View>
                  );
                })}
              </View>
            </View>

            <PrimaryButton
              label="Alışverişe devam et"
              onPress={() => router.replace('/')}
              style={{ marginTop: 18 }}
            />
            {authStatus === 'signedIn' ? (
              <TextButton
                label="Siparişlerim"
                onPress={() => router.replace('/orders')}
                style={{ alignSelf: 'center', marginTop: 18 }}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  money,
  first,
}: {
  label: string;
  value: string;
  money?: boolean;
  first?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: first ? 0 : 12,
      }}>
      <Label style={{ color: Colors.inkMuted }}>{label}</Label>
      {money ? (
        <Money value={value} size={14} />
      ) : (
        <BodyStrong style={{ fontSize: 13 }}>{value}</BodyStrong>
      )}
    </View>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Body style={{ fontSize: 12.5 }}>{label}</Body>
      <BodyStrong style={{ fontSize: 12.5 }}>{value}</BodyStrong>
    </View>
  );
}
