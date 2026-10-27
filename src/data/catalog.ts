import type { ImageSource } from 'expo-image';

export type ColorOption = {
  name: string;
  hex: string;
};

export type CategoryId =
  | 'dis-giyim'
  | 'elbise'
  | 'gomlek'
  | 'triko'
  | 'denim'
  | 'aksesuar';

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  compareAt?: number;
  badge?: string;
  colors: ColorOption[];
  sizes: string[];
  soldOutSizes?: string[];
  images: ImageSource[];
  summary: string;
  details: string[];
  composition: string;
  care: string;
  fit: string;
};

export type Category = {
  id: CategoryId | 'tumu';
  name: string;
  caption: string;
  image: ImageSource;
};

export const CATEGORIES: Category[] = [
  {
    id: 'dis-giyim',
    name: 'Dış Giyim',
    caption: 'Trençkot, blazer, palto',
    image: require('../../assets/images/catalog/cat-outer.jpg'),
  },
  {
    id: 'elbise',
    name: 'Elbise',
    caption: 'Saten, triko, günlük',
    image: require('../../assets/images/catalog/cat-dress.jpg'),
  },
  {
    id: 'gomlek',
    name: 'Gömlek',
    caption: 'Poplin, ipek, oversize',
    image: require('../../assets/images/catalog/shirt-1.jpg'),
  },
  {
    id: 'triko',
    name: 'Triko',
    caption: 'Yün, kaşmir, örgü',
    image: require('../../assets/images/catalog/cat-knit.jpg'),
  },
  {
    id: 'denim',
    name: 'Denim',
    caption: 'Jean, ceket, gömlek',
    image: require('../../assets/images/catalog/cat-denim.jpg'),
  },
  {
    id: 'aksesuar',
    name: 'Aksesuar',
    caption: 'Çanta, takı, kemer',
    image: require('../../assets/images/catalog/cat-accessory.jpg'),
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'trench',
    name: 'Yün Karışımlı Trençkot',
    category: 'dis-giyim',
    price: 4299.9,
    compareAt: 5299.9,
    badge: 'Yeni',
    colors: [
      { name: 'Kum', hex: '#C9B69F' },
      { name: 'Siyah', hex: '#171717' },
      { name: 'Zeytin', hex: '#5C5B4A' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    soldOutSizes: ['XS'],
    images: [
      require('../../assets/images/catalog/trench-1.jpg'),
      require('../../assets/images/catalog/trench-2.jpg'),
      require('../../assets/images/catalog/trench-3.jpg'),
    ],
    summary:
      'Omuzdan oturan, diz altı kesim trençkot. Çift sıra düğmeli gövdesi ve yumuşak yün karışımı kumaşıyla sezonun katmanlı siluetini tamamlıyor.',
    details: [
      'Çift sıra düğme kapama',
      'Kemer ve kemer köprüleri',
      'Tam astarlı gövde',
      'Diz altı boy',
    ],
    composition: '%68 yün, %32 polyester',
    care: 'Kuru temizleme önerilir. Ütüyü kumaş üzerine bez koyarak uygulayın.',
    fit: 'Normal kalıp. Model 1,78 m ve S beden giyiyor.',
  },
  {
    id: 'shirt',
    name: 'Oversize Poplin Gömlek',
    category: 'gomlek',
    price: 1299.9,
    badge: 'Yeni',
    colors: [
      { name: 'Beyaz', hex: '#F7F6F3' },
      { name: 'Ekru', hex: '#E8E1D5' },
      { name: 'Gök Mavisi', hex: '#AFC4D6' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      require('../../assets/images/catalog/shirt-1.jpg'),
      require('../../assets/images/catalog/shirt-2.jpg'),
      require('../../assets/images/catalog/shirt-3.jpg'),
    ],
    summary:
      'Düşük omuz çizgisi ve geniş gövdesiyle rahat bir siluet sunan poplin gömlek. Günlük kullanımdan akşam katmanlarına uyum sağlar.',
    details: [
      'Düşük omuz, oversize kalıp',
      'Gizli patlet düğme kapama',
      'Tek göğüs cepli',
      'Yuvarlak etek ucu',
    ],
    composition: '%100 pamuk poplin',
    care: '30°C’de hassas yıkama. Ağartıcı kullanmayın. Düşük ısıda ütüleyin.',
    fit: 'Oversize kalıp. Daha dar bir görünüm için bir beden küçük alın.',
  },
  {
    id: 'dress',
    name: 'Saten Askılı Elbise',
    category: 'elbise',
    price: 2499.9,
    badge: 'Çok Satan',
    colors: [
      { name: 'Siyah', hex: '#141414' },
      { name: 'Gümüş', hex: '#B9B7B2' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    soldOutSizes: ['L'],
    images: [
      require('../../assets/images/catalog/dress-1.jpg'),
      require('../../assets/images/catalog/dress-2.jpg'),
      require('../../assets/images/catalog/dress-3.jpg'),
    ],
    summary:
      'İnce askıları ve akışkan saten dokusuyla minimal bir akşam silueti. Vücudu saran kesimi, sade takılarla dengelenmek üzere tasarlandı.',
    details: [
      'İnce ayarlanabilir askı',
      'Bias kesim gövde',
      'Gizli yan fermuar',
      'Astarlı',
    ],
    composition: '%100 viskon saten',
    care: 'Kuru temizleme önerilir. Buharlı ütü kullanın.',
    fit: 'Vücuda oturan kalıp. Model 1,75 m ve S beden giyiyor.',
  },
  {
    id: 'knit',
    name: 'Örgü Triko Kazak',
    category: 'triko',
    price: 1899.9,
    colors: [
      { name: 'Kum', hex: '#CDBBA6' },
      { name: 'Krem', hex: '#EFE7DA' },
      { name: 'Antrasit', hex: '#3A3A3C' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      require('../../assets/images/catalog/knit-1.jpg'),
      require('../../assets/images/catalog/knit-2.jpg'),
      require('../../assets/images/catalog/knit-3.jpg'),
    ],
    summary:
      'Yumuşak yün karışımı iplikten örülmüş, hafif düşük omuzlu kazak. Sade dokusu ve nötr tonlarıyla gardırobun sessiz temeli.',
    details: [
      'İnce örgü dokusu',
      'Düşük omuz çizgisi',
      'Yuvarlak yaka',
      'Ribana yaka, kol ve etek ucu',
    ],
    composition: '%70 yün, %30 kaşmir',
    care: 'El yıkama. Düz zeminde kurutun. Sıkılmayın.',
    fit: 'Rahat kalıp. Model 1,80 m ve M beden giyiyor.',
  },
  {
    id: 'denim',
    name: 'Yüksek Bel Geniş Paça Jean',
    category: 'denim',
    price: 1699.9,
    compareAt: 2099.9,
    colors: [
      { name: 'Açık Mavi', hex: '#A9BDD1' },
      { name: 'Indigo', hex: '#3D4E68' },
    ],
    sizes: ['24', '26', '28', '30', '32'],
    soldOutSizes: ['24'],
    images: [
      require('../../assets/images/catalog/denim-1.jpg'),
      require('../../assets/images/catalog/denim-2.jpg'),
      require('../../assets/images/catalog/denim-3.jpg'),
    ],
    summary:
      'Yüksek bel ve düz geniş paça kesimiyle klasik bir siluet. Sert dokulu denim kumaşı kullanıldıkça size özel bir forma kavuşur.',
    details: [
      'Yüksek bel',
      'Geniş paça',
      'Beş cepli klasik detay',
      'Metal fermuar ve düğme',
    ],
    composition: '%100 pamuk denim',
    care: 'Ters çevirerek soğuk suda yıkayın. Doğal kurumaya bırakın.',
    fit: 'Yüksek bel, geniş paça. Model 1,76 m ve 26 beden giyiyor.',
  },
  {
    id: 'tote',
    name: 'Yumuşak Deri Çanta',
    category: 'aksesuar',
    price: 3499.9,
    badge: 'Yeni',
    colors: [
      { name: 'Tabac', hex: '#8B5E3C' },
      { name: 'Siyah', hex: '#141414' },
    ],
    sizes: ['Tek Beden'],
    images: [
      require('../../assets/images/catalog/bag-1.jpg'),
      require('../../assets/images/catalog/bag-2.jpg'),
      require('../../assets/images/catalog/bag-3.jpg'),
    ],
    summary:
      'Günlük kullanım için tasarlanmış, yumuşak dana derisi çanta. Geniş iç hacmi ve manyetik kapamasıyla sade bir taşıma deneyimi sunar.',
    details: [
      'Manyetik kapama',
      'İç astar ve fermuarlı cep',
      'Ayarlanabilir omuz askısı',
      'El yapımı dikiş detayı',
    ],
    composition: '%100 dana derisi',
    care: 'Kuru bir bezle silin. Doğrudan güneş ışığından uzak tutun.',
    fit: 'Ölçüler: 32 × 26 × 12 cm. Askı yüksekliği 24 cm.',
  },
  {
    id: 'necklace',
    name: 'Altın Kaplama Zincir Kolye',
    category: 'aksesuar',
    price: 899.9,
    colors: [{ name: 'Altın', hex: '#C8A25C' }],
    sizes: ['Tek Beden'],
    images: [
      require('../../assets/images/catalog/jewel-1.jpg'),
      require('../../assets/images/catalog/jewel-2.jpg'),
      require('../../assets/images/catalog/jewel-3.jpg'),
    ],
    summary:
      'İnce halkalardan oluşan zincir kolye. Tek başına ya da katmanlı kullanım için sade bir tamamlayıcı.',
    details: ['18 ayar altın kaplama', '42 cm uzunluk', 'Ayarlanabilir kilit', 'Nikelsiz'],
    composition: '%925 gümüş üzerine 18 ayar altın kaplama',
    care: 'Parfüm ve sudan uzak tutun. Yumuşak bir bezle silin.',
    fit: 'Uzunluk: 42 cm + 3 cm uzatma.',
  },
  {
    id: 'blazer',
    name: 'Kruvaze Yün Blazer',
    category: 'dis-giyim',
    price: 3799.9,
    colors: [
      { name: 'Antrasit', hex: '#3A3A3C' },
      { name: 'Kum', hex: '#C9B69F' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      require('../../assets/images/catalog/blazer-1.jpg'),
      require('../../assets/images/catalog/blazer-2.jpg'),
      require('../../assets/images/catalog/blazer-3.jpg'),
    ],
    summary:
      'Kruvaze kapama ve keskin omuz çizgisiyle yapılandırılmış bir blazer. Akşam davetlerinden iş günlerine uzanan net bir siluet.',
    details: [
      'Kruvaze tek düğme kapama',
      'Yapılandırılmış omuz',
      'Astarlı iç gövde',
      'Kalça hizasında boy',
    ],
    composition: '%96 yün, %4 elastan',
    care: 'Kuru temizleme önerilir. Askıda saklayın.',
    fit: 'Slim kalıp. Model 1,78 m ve S beden giyiyor.',
  },
];

export type Editorial = {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  image: ImageSource;
};

export const EDITORIALS: Editorial[] = [
  {
    id: 'katmanlar',
    kicker: 'Lookbook 01',
    title: 'Katmanlar',
    copy: 'Yün, saten ve derinin aynı hikâyede buluştuğu sonbahar seçkisi.',
    image: require('../../assets/images/catalog/editorial-1.jpg'),
  },
  {
    id: 'rimas',
    kicker: 'RİMAS Notları',
    title: 'Kumaşın\nHikâyesi',
    copy: 'Bir trençkotun arkasında 14 saatlik terzilik, üç prova ve tek bir ölçü var.',
    image: require('../../assets/images/catalog/editorial-2.jpg'),
  },
];

export const HERO_IMAGE = require('../../assets/images/catalog/hero.jpg');

export function getProduct(id?: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function productsByCategory(category: CategoryId | 'tumu'): Product[] {
  if (category === 'tumu') return PRODUCTS;
  return PRODUCTS.filter((product) => product.category === category);
}

export function categoryName(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.name ?? '';
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = PRODUCTS.filter(
    (item) => item.id !== product.id && item.category === product.category
  );
  const others = PRODUCTS.filter(
    (item) => item.id !== product.id && item.category !== product.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}
