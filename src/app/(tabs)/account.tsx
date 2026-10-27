import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useToast } from '@/components/toast';
import { Body, BodyStrong, Display, Label, Money, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { formatPrice } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { useFavorites, useShop } from '@/store/shop';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Hesap — RİMAS',
    description: 'Siparişlerinizi takip edin; adreslerinizi ve favorilerinizi yönetin.',
    noIndex: true,
  });

const MENU = [
  { icon: 'receipt-outline', label: 'Siparişlerim', hint: 'Takip ve geçmiş' },
  { icon: 'heart-outline', label: 'Favorilerim', hint: 'Kaydedilen parçalar' },
  { icon: 'location-outline', label: 'Adreslerim', hint: 'Teslimat bilgileri' },
  { icon: 'card-outline', label: 'Ödeme yöntemleri', hint: 'Kayıtlı kartlar' },
  { icon: 'help-circle-outline', label: 'Yardım & destek', hint: 'Sık sorulanlar' },
  { icon: 'leaf-outline', label: 'RİMAS hakkında', hint: 'Marka hikâyesi' },
] as const;

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const favorites = useFavorites();
  const lastOrder = useShop((state) => state.lastOrder);

  const onMenuPress = (label: string) => {
    if (label === 'Favorilerim') {
      router.push('/favorites');
      return;
    }
    if (label === 'RİMAS hakkında') {
      router.push('/about');
      return;
    }
    if (label === 'Siparişlerim' && lastOrder) {
      router.push(`/order/${lastOrder.number}`);
      return;
    }
    toast.show(`${label} yakında hizmetinizde`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: Layout.gutter }}>
          <Label style={{ color: Colors.inkMuted }}>RİMAS</Label>
          <Display level="xl" style={{ marginTop: 10 }}>
            Hesap
          </Display>
        </View>

        {/* Sign-in block */}
        <View
          style={{
            marginTop: 24,
            marginHorizontal: Layout.gutter,
            borderWidth: 1,
            borderColor: Colors.line,
            padding: 20,
            backgroundColor: Colors.surface,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
            <View style={{ flex: 1 }}>
              <BodyStrong style={{ fontSize: 15 }}>Siparişlerinizi takip edin</BodyStrong>
              <Small style={{ marginTop: 5, fontSize: 11.5 }}>
                E-posta ile giriş yapın; adresler ve sipariş geçmişi tek yerde.
              </Small>
            </View>
            <Ionicons name="person-outline" size={22} color={Colors.ink} />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => toast.show('Giriş yakında aktif olacak')}
            style={({ pressed }) => ({
              marginTop: 16,
              height: 46,
              backgroundColor: Colors.ink,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
            })}>
            <Label style={{ color: Colors.paper, letterSpacing: 1.8 }}>Giriş yap / üye ol</Label>
          </Pressable>
        </View>

        {/* Last order */}
        {lastOrder ? (
          <View style={{ marginTop: 26, paddingHorizontal: Layout.gutter }}>
            <Label style={{ color: Colors.inkMuted }}>Son sipariş</Label>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/order/${lastOrder.number}`)}
              style={({ pressed }) => ({
                marginTop: 10,
                borderWidth: 1,
                borderColor: Colors.line,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                opacity: pressed ? 0.7 : 1,
              })}>
              <View style={{ flex: 1 }}>
                <BodyStrong style={{ fontSize: 13 }}>{lastOrder.number}</BodyStrong>
                <Small style={{ marginTop: 4, fontSize: 11 }}>
                  {lastOrder.itemCount} ürün · {lastOrder.delivery} tarihinde teslim
                </Small>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Money value={formatPrice(lastOrder.total)} size={13} />
                <Small style={{ fontSize: 10 }}>Detay →</Small>
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* Menu */}
        <View style={{ marginTop: 30, paddingHorizontal: Layout.gutter }}>
          {MENU.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onMenuPress(item.label)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 16,
                borderTopWidth: index === 0 ? 1 : 0,
                borderBottomWidth: 1,
                borderColor: Colors.line,
                opacity: pressed ? 0.55 : 1,
              })}>
              <Ionicons name={item.icon} size={19} color={Colors.ink} />
              <View style={{ flex: 1 }}>
                <BodyStrong style={{ fontSize: 13.5 }}>{item.label}</BodyStrong>
                <Small style={{ marginTop: 2, fontSize: 10.5 }}>{item.hint}</Small>
              </View>
              {item.label === 'Favorilerim' && favorites.length > 0 ? (
                <Label style={{ color: Colors.inkMuted, letterSpacing: 0.6 }}>
                  {favorites.length}
                </Label>
              ) : null}
              <Ionicons name="chevron-forward" size={15} color={Colors.inkMuted} />
            </Pressable>
          ))}
        </View>

        {/* Preferences */}
        <View
          style={{
            marginTop: 32,
            marginHorizontal: Layout.gutter,
            backgroundColor: Colors.paperDeep,
            padding: 20,
          }}>
          <Label style={{ color: Colors.inkMuted, letterSpacing: 2 }}>Tercihler</Label>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              gap: 16,
            }}>
            <View style={{ flex: 1 }}>
              <BodyStrong style={{ fontSize: 13 }}>Bülten</BodyStrong>
              <Small style={{ marginTop: 3, fontSize: 10.5 }}>
                Yeni koleksiyonlar ve RİMAS notları.
              </Small>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bülten tercihi"
              onPress={() => toast.show('Bülten tercihi kaydedildi')}
              style={({ pressed }) => ({
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: Colors.ink,
                justifyContent: 'center',
                paddingHorizontal: 3,
                alignItems: 'flex-end',
                opacity: pressed ? 0.7 : 1,
              })}>
              <View
                style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.paper }}
              />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: Layout.gutter }}>
          <BrandMark height={46} />
          <Small style={{ marginTop: 8, textAlign: 'center', fontSize: 10.5 }}>
            İstanbul · Türkiye’de üretim
          </Small>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Pressable onPress={() => router.push('/about')}>
              <Small style={{ fontSize: 10 }}>Hakkımızda</Small>
            </Pressable>
            <Pressable onPress={() => toast.show('Kargo bilgisi yakında')}>
              <Small style={{ fontSize: 10 }}>Kargo</Small>
            </Pressable>
            <Pressable onPress={() => toast.show('İade bilgisi yakında')}>
              <Small style={{ fontSize: 10 }}>İade</Small>
            </Pressable>
          </View>
          <Body style={{ marginTop: 16, fontSize: 10.5, color: Colors.inkMuted }}>
            © 2026 RİMAS
          </Body>
        </View>
      </ScrollView>
    </View>
  );
}
