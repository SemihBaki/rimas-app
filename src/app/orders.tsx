import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineButton } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/header';
import { Body, BodyStrong, Label, Money, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { ApiError, api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { useAuth } from '@/store/auth';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Siparişlerim — RİMAS',
    description: 'Geçmiş siparişlerinizi ve teslimat durumlarını görüntüleyin.',
    noIndex: true,
  });

type ServerOrder = {
  number: string;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  delivery: string;
  shipping: 'standart' | 'express';
  status: 'hazirlaniyor' | 'kargoda' | 'teslim';
  createdAt: string;
};

const STATUS_LABELS: Record<ServerOrder['status'], string> = {
  hazirlaniyor: 'Hazırlanıyor',
  kargoda: 'Kargoda',
  teslim: 'Teslim edildi',
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const status = useAuth((state) => state.status);
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await api<{ orders: ServerOrder[] }>('/api/orders');
      setOrders(data.orders ?? []);
      setLoaded(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        useAuth.getState().clearSession();
      } else {
        setError(caught instanceof ApiError ? caught.message : 'Siparişler yüklenemedi.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (status !== 'signedIn') {
        setOrders([]);
        setLoaded(false);
        return;
      }
      void load();
    }, [status, load])
  );

  const body = (() => {
    if (status === 'loading') {
      return <Loading label="Oturum kontrol ediliyor…" />;
    }

    if (status !== 'signedIn') {
      return (
        <EmptyState
          icon="person-outline"
          kicker="Hesap"
          title="Siparişlerinizi görmek için giriş yapın"
          copy="Giriş yaptığınızda sipariş geçmişiniz ve teslimat durumları burada listelenir."
          actionLabel="Giriş yap"
          onAction={() => router.push('/sign-in')}
        />
      );
    }

    if (loading && !loaded) {
      return <Loading label="Siparişler yükleniyor…" />;
    }

    if (error) {
      return (
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 32, alignItems: 'center' }}>
          <Body align="center" style={{ maxWidth: 280 }}>
            {error}
          </Body>
          <OutlineButton
            label="Tekrar dene"
            onPress={() => void load()}
            style={{ marginTop: 20, alignSelf: 'stretch' }}
          />
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <EmptyState
          icon="receipt-outline"
          kicker="Sipariş yok"
          title="Henüz sipariş vermediniz"
          copy="İlk siparişiniz yola çıktığında durumunu buradan takip edebileceksiniz."
          actionLabel="Alışverişe başla"
          onAction={() => router.replace('/')}
        />
      );
    }

    return (
      <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 18 }}>
        <Label style={{ color: Colors.inkMuted }}>
          {orders.length} sipariş
        </Label>
        <View style={{ marginTop: 8 }}>
          {orders.map((order) => (
            <Pressable
              key={order.number}
              accessibilityRole="button"
              accessibilityLabel={`Sipariş ${order.number}`}
              onPress={() =>
                router.push({ pathname: '/order/[id]', params: { id: order.number } })
              }
              style={({ pressed }) => ({
                borderTopWidth: 1,
                borderTopColor: Colors.line,
                paddingVertical: 18,
                gap: 6,
                opacity: pressed ? 0.55 : 1,
              })}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <BodyStrong style={{ fontSize: 13 }}>{order.number}</BodyStrong>
                <Money value={formatPrice(order.total)} size={13} />
              </View>

              <Small style={{ fontSize: 10.5 }}>
                {formatDate(order.createdAt)} · {order.itemCount} parça ·{' '}
                {order.shipping === 'express' ? 'Express kargo' : 'Standart kargo'}
              </Small>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 4,
                }}>
                <Label style={{ color: Colors.ink, letterSpacing: 1.4, fontSize: 9.5 }}>
                  {STATUS_LABELS[order.status]}
                </Label>
                <View style={{ flex: 1, height: 1, backgroundColor: Colors.line }} />
                <Small style={{ fontSize: 10 }}>{order.delivery} teslim</Small>
                <Ionicons name="chevron-forward" size={13} color={Colors.inkMuted} />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  })();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader title="Siparişlerim" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          status === 'signedIn' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={Colors.inkMuted}
            />
          ) : undefined
        }>
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 28 }}>
          <Label style={{ color: Colors.inkMuted }}>Sipariş geçmişi</Label>
        </View>
        {body}
      </ScrollView>
    </View>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <View style={{ paddingVertical: 64, alignItems: 'center', gap: 14 }}>
      <ActivityIndicator color={Colors.ink} />
      <Small style={{ fontSize: 10.5 }}>{label}</Small>
    </View>
  );
}
