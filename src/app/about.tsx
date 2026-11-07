import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ScreenHeader } from '@/components/header';
import { Rule } from '@/components/screen';
import { useToast } from '@/components/toast';
import { Body, BodyStrong, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { EDITORIALS } from '@/data/catalog';
import { buildMetadata } from '@/lib/seo';

export const generateMetadata: GenerateMetadataFunction = (request) =>
  buildMetadata(
    {
      title: 'RİMAS Hakkında — Kumaşın Hikâyesi',
      description:
        'RİMAS, hızlı tüketimin karşısında duran küçük bir terzilik girişimi. İstanbul’da, sınırlı sayıda ve uzun ömürlü parçalar.',
      path: '/about',
    },
    request
  );

const VALUES = [
  {
    number: '01',
    title: 'Az üretim',
    copy: 'Her parça sınırlı sayıda üretilir. Böylece kumaşın hakkını veren bir terzilik mümkün olur; kimse aynı sokakta aynı ceketle yürümez.',
  },
  {
    number: '02',
    title: 'Uzun ömür',
    copy: 'Kalıp, dikiş ve kumaş seçimi yıllarca kullanılacak şekilde yapılır. Sezonluk trendler yerine sessiz ve kalıcı bir gardırop.',
  },
  {
    number: '03',
    title: 'Şeffaflık',
    copy: 'Kumaşın nereden geldiğini, hangi atölyede dikildiğini ve ne kadar sürede üretildiğini biliriz. Aynı bilgiyi sizinle paylaşırız.',
  },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const story = EDITORIALS[1];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader title="RİMAS" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Hero */}
        <View style={{ height: 380, backgroundColor: Colors.ink }}>
          <Image
            source={story.image}
            accessibilityLabel={story.title}
            style={{ flex: 1 }}
            contentFit="cover"
            transition={350}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['rgba(17,17,16,0.1)', 'rgba(17,17,16,0.66)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View
            style={{
              position: 'absolute',
              left: Layout.gutter,
              right: Layout.gutter,
              bottom: 26,
            }}>
            <Label tone="paper" style={{ letterSpacing: 2.6 }}>
              İstanbul · 2019
            </Label>
            <Display
              level="xl"
              tone="paper"
              style={{ marginTop: 10, fontSize: 42, lineHeight: 44 }}>
              Kumaşın{'\n'}Hikâyesi
            </Display>
          </View>
        </View>

        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 34 }}>
          <Body style={{ fontSize: 13.5, lineHeight: 24 }}>
            RİMAS, hızlı tüketimin karşısında duran küçük bir terzilik girişimidir.
            Koleksiyonlar mevsimlerden çok, kumaşların karakterinden doğar. Bir trençkotun
            arkasında 14 saatlik terzilik, üç prova ve tek bir ölçü vardır.
          </Body>
          <Body style={{ fontSize: 13.5, lineHeight: 24, marginTop: 14 }}>
            Parçalarımızı İstanbul’daki atölyemizde, uzun yıllar birlikte çalıştığımız
            ustalarla üretiyoruz. Amacımız çok satmak değil; doğru parçayı, doğru kumaşla,
            doğru zamanda üretmek.
          </Body>

          <View
            style={{
              marginTop: 26,
              paddingVertical: 22,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: Colors.lineStrong,
            }}>
            <Display level="m" style={{ lineHeight: 32 }}>
              “İyi bir ceket, sahibinin hayatını değil; hayatının bir bölümünü taşır.”
            </Display>
            <Label style={{ marginTop: 14, color: Colors.inkMuted, letterSpacing: 1.6 }}>
              RİMAS notları — 04
            </Label>
          </View>
        </View>

        {/* Image */}
        <Image
          source={EDITORIALS[0].image}
          accessibilityLabel={EDITORIALS[0].title}
          style={{
            width: '100%',
            height: 320,
            marginTop: 32,
            backgroundColor: Colors.paperDeep,
          }}
          contentFit="cover"
          transition={350}
          cachePolicy="memory-disk"
        />

        {/* Values */}
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 36 }}>
          <Label style={{ color: Colors.inkMuted }}>Değerlerimiz</Label>
          <Display level="m" style={{ marginTop: 8, marginBottom: 6 }}>
            Üç kural
          </Display>

          {VALUES.map((value) => (
            <View key={value.number} style={{ paddingTop: 18 }}>
              <Rule />
              <View style={{ flexDirection: 'row', gap: 16, paddingTop: 16 }}>
                <Label style={{ color: Colors.inkMuted, letterSpacing: 1 }}>{value.number}</Label>
                <View style={{ flex: 1 }}>
                  <BodyStrong style={{ fontSize: 14 }}>{value.title}</BodyStrong>
                  <Body style={{ marginTop: 6, fontSize: 12.5 }}>{value.copy}</Body>
                </View>
              </View>
            </View>
          ))}
          <Rule style={{ marginTop: 18 }} />
        </View>

        {/* Materials */}
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 34 }}>
          <Label style={{ color: Colors.inkMuted }}>Malzeme</Label>
          <Display level="m" style={{ marginTop: 8 }}>
            Seçtiğimiz kumaşlar
          </Display>
          <Body style={{ marginTop: 10 }}>
            Yün, pamuk, ipek ve deri. Hepsi izlenebilir tedarik zincirlerinden; çoğu
            Türkiye’de dokunuyor. Sentetik oranını mümkün olduğunca düşük tutuyoruz.
          </Body>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            {['Yün', 'Pamuk', 'İpek', 'Keten', 'Deri', 'Kaşmir'].map((material) => (
              <View
                key={material}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.lineStrong,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}>
                <Small style={{ fontSize: 10.5, color: Colors.ink }}>{material}</Small>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View
          style={{
            marginTop: 34,
            marginHorizontal: Layout.gutter,
            backgroundColor: Colors.paperDeep,
            padding: 20,
          }}>
          <Label style={{ color: Colors.inkMuted, letterSpacing: 2 }}>İletişim</Label>
          <Body style={{ marginTop: 10, fontSize: 12.5 }}>
            Sorularınız için bize yazın. Her mesaja atölyeden biri dönüyor.
          </Body>

          <Pressable
            accessibilityRole="button"
            onPress={() => toast.show('merhaba@rimas.com')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              marginTop: 8,
              borderBottomWidth: 1,
              borderBottomColor: Colors.lineStrong,
              opacity: pressed ? 0.6 : 1,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="mail-outline" size={16} color={Colors.ink} />
              <Small style={{ fontSize: 11.5, color: Colors.ink }}>merhaba@rimas.com</Small>
            </View>
            <Ionicons name="arrow-forward" size={14} color={Colors.inkMuted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => toast.show('@rimas')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              opacity: pressed ? 0.6 : 1,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="camera-outline" size={16} color={Colors.ink} />
              <Small style={{ fontSize: 11.5, color: Colors.ink }}>@rimas</Small>
            </View>
            <Ionicons name="arrow-forward" size={14} color={Colors.inkMuted} />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginTop: 38 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/collection/tumu')}
            style={({ pressed }) => ({
              borderBottomWidth: 1,
              borderBottomColor: Colors.ink,
              paddingBottom: 4,
              opacity: pressed ? 0.6 : 1,
            })}>
            <Label style={{ letterSpacing: 1.8 }}>Koleksiyonu keşfet</Label>
          </Pressable>
          <BrandMark height={40} style={{ marginTop: 30 }} />
          <Small style={{ marginTop: 16, fontSize: 10 }}>© 2026 RİMAS</Small>
        </View>
      </ScrollView>
    </View>
  );
}
