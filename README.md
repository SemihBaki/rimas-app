# RİMAS

RİMAS, sakin ve editoryal bir dille tasarlanmış mobil giyim mağazası deneyimidir. Az sayıda, uzun ömürlü parça fikri üzerine kurulu; ürün keşfi, koleksiyonlar, favoriler, sepet ve sipariş akışını uçtan uca çalışır halde sunar.

Uygulama React Native + Expo (SDK 58) ile geliştirildi ve iOS, Android ve web üzerinde aynı kod tabanından çalışır.

## Çalıştırma

```bash
npm install
npx expo start
```

- Web: `w` tuşu veya `http://localhost:8081`
- iOS / Android: Expo Go ile QR kodu okutun

Faydalı komutlar:

```bash
npx tsc --noEmit    # tip kontrolü
npx eslint .        # lint
npx expo-doctor     # bağımlılık ve yapılandırma kontrolü
```

## Teknoloji

| Katman | Seçim |
| --- | --- |
| Çatı | Expo SDK 58, React Native, TypeScript |
| Yönlendirme | Expo Router (dosya tabanlı, `src/app`) |
| Durum | Zustand + AsyncStorage (sepet, favoriler, son sipariş) |
| Animasyon | Reanimated (yalnızca basış geri bildirimi ve görsel geçişleri) |
| Görseller | `expo-image` (yerel katalog fotoğrafları) |
| Tipografi | Bodoni Moda (başlık) + Inter (arayüz) |

## Yapı

```
src/
  app/                 # Rotalar (her dosya bir ekran)
    (tabs)/            # Mağaza, Koleksiyon, Favoriler, Sepet, Hesap
    product/[id].tsx   # Ürün detayı
    collection/[slug]  # Kategori listesi
    search.tsx         # Arama (Türkçe karakter normalizasyonu)
    checkout.tsx       # Ödeme formu ve sipariş oluşturma
    order/[id].tsx     # Sipariş onayı
    about.tsx          # Marka hikâyesi
  components/          # Ortak arayüz parçaları (kart, tab bar, başlık, ...)
  constants/theme.ts   # Renk, tipografi, boşluk, gölge token'ları
  data/catalog.ts      # Ürünler, kategoriler, editoryaller
  lib/                 # Fiyat/tarih biçimlendirme, Türkçe metin yardımcıları
  store/shop.ts        # Kalıcı mağaza durumu
assets/
  fonts/               # Bodoni ve Inter (tek ağırlık, 400)
  images/catalog/      # Yerel ürün fotoğrafları (temsili)
```

## Tasarım notları

- Zemin `#F7F5F1`, metin `#111110`; keskin köşeler, ince çizgiler, geniş beyaz alan.
- Tipografi tek ağırlıkla (400) kullanılır; vurgu harf aralığı ve boyutla yapılır. `fontWeight` ayarlanmaz.
- Büyük harf dönüşümü CSS yerine `turkishUpper()` ile yapılır; böylece `i → İ` dönüşümü doğru çalışır.
- Mobil öncelikli; web'de içerik ortalanmış bir çerçeve içinde gösterilir.

## Veri ve demo kapsamı

Katalog `src/data/catalog.ts` içinde yerel olarak tanımlıdır; gerçek bir servise geçmek için yalnızca bu katmanı değiştirmek yeterlidir. Ödeme adımı demodedir: kart bilgisi saklanmaz, sipariş numarası üretilir ve `AsyncStorage` üzerinde tutulur.

Ürün fotoğrafları şimdilik temsilidir; marka çekimleri hazır olduğunda `assets/images/catalog/` altındaki dosyalar aynı adlarla değiştirilebilir.

## Marka

RİMAS — İstanbul. 2026.
