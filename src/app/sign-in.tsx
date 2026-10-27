import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/button';
import { TextField } from '@/components/field';
import { ScreenHeader } from '@/components/header';
import { useToast } from '@/components/toast';
import { Body, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { ApiError } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { useAuth } from '@/store/auth';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Giriş — RİMAS',
    description: 'RİMAS hesabınıza giriş yapın veya yeni bir hesap oluşturun.',
    noIndex: true,
  });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MODES = [
  { id: 'signin', label: 'Giriş yap' },
  { id: 'signup', label: 'Üye ol' },
] as const;

type Mode = (typeof MODES)[number]['id'];

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const signIn = useAuth((state) => state.signIn);
  const signUp = useAuth((state) => state.signUp);

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'signup' && name.trim().length < 2) {
      setError('Adınızı ve soyadınızı girin.');
      return;
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }

    setError(null);
    setPending(true);

    try {
      const user =
        mode === 'signup'
          ? await signUp(name, cleanEmail, password)
          : await signIn(cleanEmail, password);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show(`Hoş geldiniz, ${user.name.split(' ')[0]}`);

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/account');
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : 'Bağlantı kurulamadı. Tekrar deneyin.'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader title="Hesap" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Layout.gutter,
            paddingTop: 34,
            paddingBottom: insets.bottom + 48,
          }}>
          <Display level="xl">Hesabınız</Display>
          <Body style={{ marginTop: 10, maxWidth: 330 }}>
            Siparişleriniz, favorileriniz ve teslimat bilgileriniz tek yerde.
          </Body>

          <View
            style={{
              flexDirection: 'row',
              gap: 26,
              marginTop: 30,
              borderBottomWidth: 1,
              borderBottomColor: Colors.line,
            }}>
            {MODES.map((item) => {
              const active = item.id === mode;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  onPress={() => switchMode(item.id)}
                  style={{
                    paddingBottom: 11,
                    marginBottom: -1,
                    borderBottomWidth: 2,
                    borderBottomColor: active ? Colors.ink : 'transparent',
                  }}>
                  <Label
                    style={{
                      color: active ? Colors.ink : Colors.inkMuted,
                      letterSpacing: 2,
                    }}>
                    {item.label}
                  </Label>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 26 }}>
            {mode === 'signup' ? (
              <TextField
                label="Ad soyad"
                value={name}
                onChangeText={setName}
                placeholder="Adınız ve soyadınız"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
            ) : null}
            <TextField
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@eposta.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoCorrect={false}
            />
            <TextField
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'signup' ? 'En az 8 karakter' : 'Şifreniz'}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              helper={
                mode === 'signup'
                  ? 'Şifreniz en az 8 karakter olmalı; yalnızca siz bileceksiniz.'
                  : undefined
              }
            />
          </View>

          {error ? (
            <View
              style={{
                marginTop: 2,
                marginBottom: 14,
                borderLeftWidth: 2,
                borderLeftColor: Colors.danger,
                paddingLeft: 10,
              }}>
              <Small tone="danger" style={{ fontSize: 11 }}>
                {error}
              </Small>
            </View>
          ) : null}

          <PrimaryButton
            label={mode === 'signup' ? 'Hesap oluştur' : 'Giriş yap'}
            onPress={submit}
            loading={pending}
            style={{ marginTop: error ? 0 : 6 }}
          />

          <Small style={{ marginTop: 16, fontSize: 10.5, lineHeight: 16 }}>
            {mode === 'signup'
              ? 'Hesabınız açıldığında favorileriniz cihazlar arasında eşitlenir.'
              : 'Hesabınız yoksa “Üye ol” sekmesinden saniyeler içinde oluşturabilirsiniz.'}
          </Small>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
