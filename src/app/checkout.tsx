import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/header';
import { Rule } from '@/components/screen';
import { useToast } from '@/components/toast';
import { Body, BodyStrong, Display, Label, Money, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { estimatedDelivery, formatPrice, orderNumber } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import {
  FREE_SHIPPING_THRESHOLD,
  useCartLines,
  useCartSubtotal,
  useShop,
} from '@/store/shop';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Ödeme — RİMAS',
    description: 'Teslimat bilgileriniz ve güvenli ödeme adımı.',
    noIndex: true,
  });

type ShippingMethod = 'standart' | 'express';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const lines = useCartLines();
  const subtotal = useCartSubtotal();
  const completeOrder = useShop((state) => state.completeOrder);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [shipment, setShipment] = useState<ShippingMethod>('standart');
  const [submitting, setSubmitting] = useState(false);

  const standardShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49.9;
  const shippingCost = shipment === 'express' ? 89.9 : standardShipping;
  const total = Math.round((subtotal + shippingCost) * 100) / 100;
  const itemCount = lines.reduce((count, line) => count + line.qty, 0);

  if (lines.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.paper }}>
        <ScreenHeader title="Ödeme" />
        <EmptyState
          icon="bag-outline"
          kicker="Sepet boş"
          title="Ödeme için ürün gerekli"
          copy="Sepetinize bir parça ekleyin, ardından ödemeye geçin."
          actionLabel="Alışverişe dön"
          onAction={() => router.replace('/collections')}
        />
      </View>
    );
  }

  const validate = (): string | null => {
    if (!email.includes('@') || !email.includes('.')) return 'Geçerli bir e-posta adresi girin.';
    if (fullName.trim().length < 3) return 'Ad ve soyadınızı girin.';
    if (phone.replace(/\D/g, '').length < 10) return 'Geçerli bir telefon numarası girin.';
    if (address.trim().length < 8) return 'Teslimat adresinizi girin.';
    if (!city.trim()) return 'İl bilgisini girin.';
    if (!district.trim()) return 'İlçe bilgisini girin.';
    if (cardName.trim().length < 3) return 'Kart üzerindeki ismi girin.';
    if (cardNumber.replace(/\D/g, '').length !== 16) return 'Kart numarası 16 haneli olmalı.';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Son kullanma tarihini AA/YY olarak girin.';
    if (cvv.length < 3) return 'Güvenlik kodunu girin.';
    return null;
  };

  const placeOrder = () => {
    const error = validate();
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      toast.show(error);
      return;
    }

    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const number = orderNumber();
    setTimeout(() => {
      completeOrder({
        number,
        total,
        itemCount,
        email,
        delivery: estimatedDelivery(),
      });
      setSubmitting(false);
      router.replace(`/order/${number}`);
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader title="Ödeme" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 140,
            paddingHorizontal: Layout.gutter,
            paddingTop: 24,
          }}>
          <Display level="l">Son adım</Display>
          <Body style={{ marginTop: 8 }}>
            Teslimat ve ödeme bilgilerinizi tamamlayın. Bu bir demo mağazadır; kart
            bilgileri saklanmaz.
          </Body>

          {/* Contact */}
          <Section title="01 — İletişim" style={{ marginTop: 30 }}>
            <Field
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@eposta.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Telefon"
              value={phone}
              onChangeText={setPhone}
              placeholder="05XX XXX XX XX"
              keyboardType="phone-pad"
            />
          </Section>

          {/* Delivery */}
          <Section title="02 — Teslimat" style={{ marginTop: 28 }}>
            <Field
              label="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Adınız ve soyadınız"
              autoCapitalize="words"
            />
            <Field
              label="Adres"
              value={address}
              onChangeText={setAddress}
              placeholder="Mahalle, sokak, bina, daire"
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="İl"
                  value={city}
                  onChangeText={setCity}
                  placeholder="İstanbul"
                  autoCapitalize="words"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="İlçe"
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Kadıköy"
                  autoCapitalize="words"
                />
              </View>
            </View>
            <Field
              label="Posta kodu"
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="34000"
              keyboardType="number-pad"
            />
          </Section>

          {/* Shipping */}
          <Section title="03 — Kargo" style={{ marginTop: 28 }}>
            <ShippingOption
              title="Standart"
              hint="2–4 iş günü"
              price={standardShipping === 0 ? 'Ücretsiz' : formatPrice(standardShipping)}
              selected={shipment === 'standart'}
              onPress={() => setShipment('standart')}
            />
            <ShippingOption
              title="Express"
              hint="1–2 iş günü"
              price={formatPrice(89.9)}
              selected={shipment === 'express'}
              onPress={() => setShipment('express')}
            />
          </Section>

          {/* Payment */}
          <Section title="04 — Ödeme" style={{ marginTop: 28 }}>
            <Field
              label="Kart üzerindeki isim"
              value={cardName}
              onChangeText={setCardName}
              placeholder="Ad Soyad"
              autoCapitalize="words"
            />
            <Field
              label="Kart numarası"
              value={cardNumber}
              onChangeText={(value) => setCardNumber(formatCard(value))}
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              maxLength={19}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Son kullanma"
                  value={expiry}
                  onChangeText={(value) => setExpiry(formatExpiry(value))}
                  placeholder="AA/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="CVV"
                  value={cvv}
                  onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
              }}>
              <Ionicons name="lock-closed-outline" size={12} color={Colors.inkMuted} />
              <Small style={{ fontSize: 10.5, flex: 1 }}>
                Bilgileriniz şifreli olarak iletilir. Demo ödemede kartınızdan tutar
                çekilmez.
              </Small>
            </View>
          </Section>

          {/* Summary */}
          <Section title="Sipariş özeti" style={{ marginTop: 32 }}>
            <View style={{ gap: 10, marginTop: 4 }}>
              {lines.map((line) => (
                <View
                  key={line.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image
                    source={line.product.images[0]}
                    style={{ width: 44, height: 56, backgroundColor: Colors.paperDeep }}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                  <View style={{ flex: 1 }}>
                    <BodyStrong numberOfLines={1} style={{ fontSize: 12 }}>
                      {line.product.name}
                    </BodyStrong>
                    <Small style={{ fontSize: 10, marginTop: 2 }}>
                      {line.color} · {line.size} · {line.qty} adet
                    </Small>
                  </View>
                  <Money value={formatPrice(line.lineTotal)} size={11.5} />
                </View>
              ))}
            </View>

            <Rule style={{ marginTop: 16, marginBottom: 14 }} />
            <SummaryRow label="Ara toplam" value={formatPrice(subtotal)} />
            <SummaryRow
              label={shipment === 'express' ? 'Express kargo' : 'Standart kargo'}
              value={shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)}
              style={{ marginTop: 8 }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginTop: 14,
              }}>
              <Label style={{ color: Colors.ink, letterSpacing: 1.4 }}>Toplam</Label>
              <Money value={formatPrice(total)} size={17} />
            </View>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky pay bar */}
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
            marginBottom: 10,
          }}>
          <Label>Toplam</Label>
          <Money value={formatPrice(total)} size={15} />
        </View>
        <PrimaryButton
          label={submitting ? 'İşleniyor…' : 'Siparişi tamamla'}
          loading={submitting}
          onPress={placeOrder}
        />
      </View>
    </View>
  );
}

function Section({
  title,
  children,
  style,
}: {
  title: string;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={style}>
      <Label style={{ color: Colors.inkMuted, letterSpacing: 1.8 }}>{title}</Label>
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Small style={{ fontSize: 10.5, marginBottom: 5 }}>{label}</Small>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.inkMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        maxLength={maxLength}
        style={{
          minHeight: multiline ? 66 : 44,
          borderWidth: 1,
          borderColor: Colors.lineStrong,
          backgroundColor: Colors.surface,
          paddingHorizontal: 12,
          paddingTop: multiline ? 11 : 0,
          paddingBottom: multiline ? 11 : 0,
          fontFamily: 'Inter',
          fontSize: 13,
          color: Colors.ink,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}

function ShippingOption({
  title,
  hint,
  price,
  selected,
  onPress,
}: {
  title: string;
  hint: string;
  price: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: selected ? Colors.ink : Colors.lineStrong,
        backgroundColor: selected ? Colors.surface : 'transparent',
        padding: 14,
        marginBottom: 8,
        opacity: pressed ? 0.7 : 1,
      })}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: selected ? Colors.ink : Colors.lineStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {selected ? (
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.ink }} />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <BodyStrong style={{ fontSize: 12.5 }}>{title}</BodyStrong>
        <Small style={{ fontSize: 10, marginTop: 2 }}>{hint}</Small>
      </View>
      <Small style={{ fontSize: 11, color: Colors.ink }}>{price}</Small>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style?: object;
}) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        style,
      ]}>
      <Body style={{ fontSize: 12.5 }}>{label}</Body>
      <BodyStrong style={{ fontSize: 12.5 }}>{value}</BodyStrong>
    </View>
  );
}

function formatCard(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
