import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/header';
import { Rule } from '@/components/screen';
import { Body, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { LEGAL_DOCUMENTS, LEGAL_UPDATED } from '@/data/legal';
import { buildMetadata } from '@/lib/seo';

export const generateMetadata: GenerateMetadataFunction = (request) =>
  buildMetadata(
    {
      title: 'Yasal Metinler — RİMAS',
      description:
        'KVKK aydınlatma metni, gizlilik ve çerez politikası, mesafeli satış sözleşmesi, cayma hakkı ve teslimat koşulları.',
      path: '/legal',
    },
    request
  );

export default function LegalIndexScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader title="Yasal" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 28 }}>
          <Label style={{ color: Colors.inkMuted, letterSpacing: 2 }}>Bilgilendirme</Label>
          <Display level="l" style={{ marginTop: 10 }}>
            Yasal metinler
          </Display>
          <Body style={{ marginTop: 12 }}>
            Sipariş, teslimat ve kişisel verilerinizle ilgili koşullar aşağıda yer alır. Metinler
            toptan satış modelimize göre hazırlanmıştır.
          </Body>
          <Small style={{ marginTop: 10, fontSize: 10.5 }}>
            Son güncelleme: {LEGAL_UPDATED}
          </Small>
        </View>

        <Rule style={{ marginTop: 24 }} />

        <View style={{ paddingHorizontal: Layout.gutter }}>
          {LEGAL_DOCUMENTS.map((document) => (
            <Pressable
              key={document.slug}
              accessibilityRole="button"
              accessibilityLabel={document.title}
              onPress={() => router.push(`/legal/${document.slug}`)}
              style={({ pressed }) => ({
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: Colors.line,
                opacity: pressed ? 0.6 : 1,
              })}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}>
                <View style={{ flex: 1 }}>
                  <Body tone="ink" style={{ fontSize: 13.5 }}>
                    {document.title}
                  </Body>
                  <Small style={{ marginTop: 5, fontSize: 10.5, lineHeight: 15 }}>
                    {document.summary}
                  </Small>
                </View>
                <Ionicons name="arrow-forward" size={15} color={Colors.inkMuted} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: Layout.gutter, marginTop: 24 }}>
          <Small style={{ fontSize: 10.5, lineHeight: 16 }}>
            Metinlerde yer alan şirket bilgileri kesinleştiğinde bu sayfa güncellenecektir.
          </Small>
        </View>
      </ScrollView>
    </View>
  );
}
