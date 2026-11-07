import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { GenerateMetadataFunction } from 'expo-router/server';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeader } from '@/components/header';
import { Rule } from '@/components/screen';
import { Body, BodyStrong, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import {
  LEGAL_DOCUMENTS,
  LEGAL_UPDATED,
  companyPending,
  getLegalDocument,
} from '@/data/legal';
import { buildMetadata, firstParam } from '@/lib/seo';

export const generateMetadata: GenerateMetadataFunction = (request, params) => {
  const document = getLegalDocument(firstParam(params.slug));

  if (!document) {
    return buildMetadata(
      {
        title: 'Metin bulunamadı — RİMAS',
        description: 'Aradığınız yasal metin kaldırılmış olabilir.',
        noIndex: true,
      },
      request
    );
  }

  return buildMetadata(
    {
      title: `${document.title} — RİMAS`,
      description: document.summary,
      path: `/legal/${document.slug}`,
    },
    request
  );
};

export default function LegalDocumentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const document = getLegalDocument(firstParam(slug));

  if (!document) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.paper }}>
        <ScreenHeader title="Yasal" />
        <EmptyState
          icon="document-text-outline"
          kicker="Yasal"
          title="Metin bulunamadı"
          copy="Aradığınız yasal metin kaldırılmış olabilir."
          actionLabel="Tüm metinler"
          onAction={() => router.replace('/legal')}
        />
      </View>
    );
  }

  const others = LEGAL_DOCUMENTS.filter((entry) => entry.slug !== document.slug);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <ScreenHeader title="Yasal" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={{ paddingHorizontal: Layout.gutter, paddingTop: 28 }}>
          <Label style={{ color: Colors.inkMuted, letterSpacing: 2 }}>RİMAS</Label>
          <Display level="m" style={{ marginTop: 8 }}>
            {document.title}
          </Display>
          <Small style={{ marginTop: 8, fontSize: 10.5 }}>
            Son güncelleme: {LEGAL_UPDATED}
          </Small>
          <Body style={{ marginTop: 14 }}>{document.summary}</Body>

          {companyPending ? (
            <View
              style={{
                marginTop: 18,
                padding: 14,
                backgroundColor: Colors.paperDeep,
                borderLeftWidth: 2,
                borderLeftColor: Colors.sand,
              }}>
              <Small style={{ fontSize: 10.5, lineHeight: 16 }}>
                Şirket unvanı, adres ve vergi bilgileri kesinleştiğinde bu metin güncellenecektir.
              </Small>
            </View>
          ) : null}
        </View>

        <Rule style={{ marginTop: 24 }} />

        <View style={{ paddingHorizontal: Layout.gutter }}>
          {document.sections.map((section) => (
            <View key={section.heading} style={{ marginTop: 22 }}>
              <BodyStrong accessibilityRole="header" style={{ fontSize: 13 }}>
                {section.heading}
              </BodyStrong>
              {section.paragraphs?.map((paragraph) => (
                <Body key={paragraph} style={{ marginTop: 8, fontSize: 12.5, lineHeight: 19 }}>
                  {paragraph}
                </Body>
              ))}
              {section.bullets?.length ? (
                <View style={{ marginTop: 8, gap: 6 }}>
                  {section.bullets.map((bullet) => (
                    <View key={bullet} style={{ flexDirection: 'row', gap: 8 }}>
                      <Body tone="muted" style={{ fontSize: 12.5, lineHeight: 19 }}>
                        —
                      </Body>
                      <Body style={{ flex: 1, fontSize: 12.5, lineHeight: 19 }}>{bullet}</Body>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: Layout.gutter, marginTop: 34 }}>
          <Label style={{ color: Colors.inkMuted, letterSpacing: 2 }}>Diğer metinler</Label>
          <View style={{ marginTop: 10 }}>
            {others.map((entry) => (
              <Pressable
                key={entry.slug}
                accessibilityRole="button"
                accessibilityLabel={entry.title}
                onPress={() => router.replace(`/legal/${entry.slug}`)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 13,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.line,
                  opacity: pressed ? 0.6 : 1,
                })}>
                <Small style={{ fontSize: 11 }}>{entry.title}</Small>
                <Ionicons name="arrow-forward" size={13} color={Colors.inkMuted} />
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tüm yasal metinler"
            onPress={() => router.replace('/legal')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 22,
              opacity: pressed ? 0.6 : 1,
            })}>
            <Ionicons name="arrow-back" size={13} color={Colors.ink} />
            <Small tone="ink" style={{ fontSize: 10.5 }}>
              Tüm yasal metinler
            </Small>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
