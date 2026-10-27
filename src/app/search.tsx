import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { Body, Display, Label, Small } from '@/components/typography';
import { Colors, Layout } from '@/constants/theme';
import { CATEGORIES, PRODUCTS, categoryName } from '@/data/catalog';
import { buildMetadata } from '@/lib/seo';
import { useShop } from '@/store/shop';

export const generateMetadata = () =>
  buildMetadata({
    title: 'Ara — RİMAS',
    description: 'RİMAS koleksiyonunda parça, kategori ve kumaş arayın.',
    noIndex: true,
  });

const TRENDING = ['Trençkot', 'Saten', 'Triko', 'Denim', 'Deri', 'Gömlek'];

function normalize(value: string) {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const recent = useShop((state) => state.recent);
  const addRecent = useShop((state) => state.addRecent);
  const clearRecent = useShop((state) => state.clearRecent);

  const contentWidth = Math.min(width, Layout.maxWidth);
  const cardWidth = (contentWidth - Layout.gutter * 2 - 12) / 2;

  const term = normalize(query.trim());
  const results = term
    ? PRODUCTS.filter((product) => {
        const haystack = normalize(
          [
            product.name,
            categoryName(product.category),
            product.summary,
            product.composition,
            product.colors.map((color) => color.name).join(' '),
          ].join(' ')
        );
        return haystack.includes(term);
      })
    : [];

  const apply = (value: string) => {
    setQuery(value);
    addRecent(value);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.paper }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Search bar */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: Layout.gutter,
            borderBottomWidth: 1,
            borderBottomColor: Colors.line,
            paddingBottom: 12,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              hitSlop={12}
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
              <Ionicons name="arrow-back" size={20} color={Colors.ink} />
            </Pressable>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                borderBottomWidth: 1,
                borderBottomColor: Colors.ink,
                paddingBottom: 6,
              }}>
              <Ionicons name="search-outline" size={16} color={Colors.inkMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => query.trim() && addRecent(query)}
                placeholder="Ürün, kategori veya kumaş ara"
                placeholderTextColor={Colors.inkMuted}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                style={{
                  flex: 1,
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: Colors.ink,
                  paddingVertical: 3,
                }}
              />
              {query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Temizle"
                  hitSlop={10}
                  onPress={() => setQuery('')}>
                  <Ionicons name="close" size={15} color={Colors.inkMuted} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
          {query.trim().length === 0 ? (
            <View style={{ paddingTop: 28, paddingHorizontal: Layout.gutter }}>
              {recent.length > 0 ? (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Label style={{ color: Colors.inkMuted }}>Son aramalar</Label>
                    <Pressable
                      accessibilityRole="button"
                      onPress={clearRecent}
                      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                      <Small style={{ fontSize: 10 }}>Temizle</Small>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                    {recent.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => apply(item)}
                        style={({ pressed }) => ({
                          borderWidth: 1,
                          borderColor: Colors.lineStrong,
                          height: 32,
                          paddingHorizontal: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: pressed ? 0.6 : 1,
                        })}>
                        <Small style={{ fontSize: 11 }}>{item}</Small>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={{ marginTop: recent.length > 0 ? 34 : 0 }}>
                <Label style={{ color: Colors.inkMuted }}>İlgi çekenler</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {TRENDING.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => apply(item)}
                      style={({ pressed }) => ({
                        borderWidth: 1,
                        borderColor: Colors.lineStrong,
                        height: 32,
                        paddingHorizontal: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.6 : 1,
                      })}>
                      <Small style={{ fontSize: 11 }}>{item}</Small>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: 38 }}>
                <Label style={{ color: Colors.inkMuted }}>Kategoriler</Label>
                <View style={{ marginTop: 6 }}>
                  {CATEGORIES.map((category, index) => (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      onPress={() => router.push(`/collection/${category.id}`)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 15,
                        borderTopWidth: index === 0 ? 1 : 0,
                        borderBottomWidth: 1,
                        borderColor: Colors.line,
                        opacity: pressed ? 0.55 : 1,
                      })}>
                      <View>
                        <Body style={{ color: Colors.ink, fontSize: 13 }}>{category.name}</Body>
                        <Small style={{ marginTop: 3, fontSize: 10 }}>{category.caption}</Small>
                      </View>
                      <Ionicons name="arrow-forward" size={15} color={Colors.inkMuted} />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={{ paddingTop: 26, paddingHorizontal: Layout.gutter }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}>
                <Display level="m">Sonuçlar</Display>
                <Small style={{ fontSize: 10.5 }}>{results.length} parça</Small>
              </View>

              {results.length === 0 ? (
                <View style={{ paddingTop: 54, alignItems: 'center' }}>
                  <Ionicons name="search-outline" size={26} color={Colors.inkMuted} />
                  <Body align="center" style={{ marginTop: 16, maxWidth: 300 }}>
                    “{query.trim()}” için sonuç bulunamadı. Farklı bir kelime deneyin ya da
                    kategorilerden ilerleyin.
                  </Body>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingTop: 20,
                  }}>
                  {results.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      width={cardWidth}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
