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

/** One size inside a pack: how many pieces of that size the pack contains. */
export type PackUnit = {
  size: string;
  qty: number;
};

/**
 * A pack ("seri") is the unit the company actually sells: a fixed size
 * distribution such as 2×S, 2×M, 1×L. The shopper cannot rearrange it — they
 * only choose how many packs they want.
 */
export type ProductPack = {
  id: string;
  /** Optional company-facing name, e.g. "Standart seri". */
  label?: string;
  units: PackUnit[];
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  /** Net price of a single piece, VAT excluded. Pack prices derive from it. */
  unitPrice: number;
  /** Former / list price per piece, used for the strikethrough. */
  listUnitPrice?: number;
  /** Overrides the catalogue default (0.10) when a product ever needs it. */
  vatRate?: number;
  badge?: string;
  colors: ColorOption[];
  /** Size pool: used by the size guide and by single-piece sales. */
  sizes: string[];
  soldOutSizes?: string[];
  /** Empty when the product is only sold per piece. */
  packs: ProductPack[];
  /** Exception flag: lets this product be bought one piece at a time. */
  allowSinglePiece: boolean;
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

/**
 * Demo catalogue. Unit prices are placeholder wholesale numbers (VAT
 * excluded); the real price list from the company replaces them here, and
 * pack prices are derived automatically.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'trench',
    name: 'Yün Karışımlı Trençkot',
    category: 'dis-giyim',
    unitPrice: 1450,
    listUnitPrice: 1890,
    badge: 'Yeni',
    colors: [
      { name: 'Kum', hex: '#C9B69F' },
      { name: 'Siyah', hex: '#171717' },
      { name: 'Zeytin', hex: '#5C5B4A' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    soldOutSizes: ['XS'],
    packs: [
      {
        id: 'trench-5',
        label: 'Standart seri',
        units: [
          { size: 'S', qty: 2 },
          { size: 'M', qty: 2 },
          { size: 'L', qty: 1 },
        ],
      },
    ],
    allowSinglePiece: false,
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
    unitPrice: 450,
    listUnitPrice: 590,
    badge: 'Yeni',
    colors: [
      { name: 'Beyaz', hex: '#F7F6F3' },
      { name: 'Ekru', hex: '#E8E1D5' },
      { name: 'Gök Mavisi', hex: '#AFC4D6' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    packs: [
      {
        id: 'shirt-6',
        label: 'Standart seri',
        units: [
          { size: 'S', qty: 2 },
          { size: 'M', qty: 2 },
          { size: 'L', qty: 2 },
        ],
      },
      {
        id: 'shirt-3',
        label: 'Kısa seri',
        units: [
          { size: 'S', qty: 1 },
          { size: 'M', qty: 1 },
          { size: 'L', qty: 1 },
        ],
      },
    ],
    allowSinglePiece: true,
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
    unitPrice: 800,
    listUnitPrice: 1050,
    badge: 'Çok Satan',
    colors: [
      { name: 'Siyah', hex: '#141414' },
      { name: 'Gümüş', hex: '#B9B7B2' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    soldOutSizes: ['L'],
    packs: [
      {
        id: 'dress-4',
        label: 'Standart seri',
        units: [
          { size: 'S', qty: 1 },
          { size: 'M', qty: 2 },
          { size: 'L', qty: 1 },
        ],
      },
    ],
    allowSinglePiece: false,
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
    unitPrice: 550,
    listUnitPrice: 720,
    colors: [
      { name: 'Kum', hex: '#CDBBA6' },
      { name: 'Krem', hex: '#EFE7DA' },
      { name: 'Antrasit', hex: '#3A3A3C' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    packs: [
      {
        id: 'knit-5',
        label: 'Standart seri',
        units: [
          { size: 'S', qty: 1 },
          { size: 'M', qty: 2 },
          { size: 'L', qty: 2 },
        ],
      },
    ],
    allowSinglePiece: false,
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
    unitPrice: 500,
    listUnitPrice: 680,
    colors: [
      { name: 'Açık Mavi', hex: '#A9BDD1' },
      { name: 'Indigo', hex: '#3D4E68' },
    ],
    sizes: ['24', '26', '28', '30', '32'],
    soldOutSizes: ['24'],
    packs: [
      {
        id: 'denim-6',
        label: 'Numara serisi',
        units: [
          { size: '26', qty: 1 },
          { size: '28', qty: 2 },
          { size: '30', qty: 2 },
          { size: '32', qty: 1 },
        ],
      },
    ],
    allowSinglePiece: false,
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
    unitPrice: 1250,
    listUnitPrice: 1650,
    badge: 'Yeni',
    colors: [
      { name: 'Tabac', hex: '#8B5E3C' },
      { name: 'Siyah', hex: '#141414' },
    ],
    sizes: ['Tek Beden'],
    packs: [],
    allowSinglePiece: true,
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
    unitPrice: 300,
    listUnitPrice: 420,
    colors: [{ name: 'Altın', hex: '#C8A25C' }],
    sizes: ['Tek Beden'],
    packs: [],
    allowSinglePiece: true,
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
    unitPrice: 1400,
    listUnitPrice: 1850,
    colors: [
      { name: 'Antrasit', hex: '#3A3A3C' },
      { name: 'Kum', hex: '#C9B69F' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    packs: [
      {
        id: 'blazer-5',
        label: 'Standart seri',
        units: [
          { size: 'S', qty: 2 },
          { size: 'M', qty: 2 },
          { size: 'L', qty: 1 },
        ],
      },
    ],
    allowSinglePiece: false,
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

export type SizeGuide = {
  title: string;
  /** Column labels; the first column is always the size itself. */
  columns: string[];
  rows: { size: string; values: number[] }[];
  note: string;
  tips: { title: string; copy: string }[];
};

/** Body measurements in centimetres, not garment measurements. */
const TOP_GUIDE: SizeGuide = {
  title: 'Üst Giyim',
  columns: ['Göğüs', 'Bel', 'Kalça'],
  rows: [
    { size: 'XS', values: [80, 62, 88] },
    { size: 'S', values: [84, 66, 92] },
    { size: 'M', values: [88, 70, 96] },
    { size: 'L', values: [94, 76, 102] },
    { size: 'XL', values: [100, 82, 108] },
  ],
  note: 'Ölçüler vücut ölçüsüdür, ürün ölçüsü değildir. İki beden arasında kaldıysanız büyük olanı seçin.',
  tips: [
    { title: 'Göğüs', copy: 'Mezurayı koltuk altından geçirip sırtın en geniş noktasından ölçün.' },
    { title: 'Bel', copy: 'Gövdenin en ince yerinde, mezurayı sıkmadan ölçün.' },
    { title: 'Kalça', copy: 'Kalçanın en geniş noktasından, ayaklar birleşikken ölçün.' },
  ],
};

const BOTTOM_GUIDE: SizeGuide = {
  title: 'Alt Giyim',
  columns: ['Bel', 'Kalça', 'İç Bacak'],
  rows: [
    { size: '24', values: [61, 86, 76] },
    { size: '26', values: [66, 91, 76] },
    { size: '28', values: [71, 96, 77] },
    { size: '30', values: [76, 101, 77] },
    { size: '32', values: [81, 106, 78] },
  ],
  note: 'Ölçüler vücut ölçüsüdür, ürün ölçüsü değildir. Denim kullanıldıkça oturur; arada kaldıysanız küçük bedeni seçin.',
  tips: [
    { title: 'Bel', copy: 'Göbeğin hemen üstünde, pantolonun oturmasını istediğiniz hizada ölçün.' },
    { title: 'Kalça', copy: 'Kalçanın en geniş noktasından, ayaklar birleşikken ölçün.' },
    { title: 'İç Bacak', copy: 'Kasıktan topuğa kadar olan mesafeyi ölçün.' },
  ],
};

/** Size tables exist for garments that are chosen by body size. */
export function sizeGuideFor(product: Product): SizeGuide | null {
  if (product.category === 'denim') return BOTTOM_GUIDE;
  if (product.category === 'aksesuar') return null;
  return TOP_GUIDE;
}

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

/* ------------------------------- packs ---------------------------------- */

/** Turkish suffix for "6'lı / 5'li / 3'lü" pack labels. */
const PACK_SUFFIX: Record<number, string> = {
  1: 'li',
  2: 'li',
  3: 'lü',
  4: 'lü',
  5: 'li',
  6: 'lı',
  7: 'li',
  8: 'li',
  9: 'lu',
  10: 'lu',
};

/** Total pieces in one pack. */
export function packPieces(pack: ProductPack): number {
  return pack.units.reduce((total, unit) => total + unit.qty, 0);
}

/** Net price of one pack: unit price × pieces. Never stored, always derived. */
export function packNetPrice(product: Product, pack: ProductPack): number {
  return Math.round(product.unitPrice * packPieces(pack) * 100) / 100;
}

/** Net list price of one pack, when the product has a former price. */
export function packListPrice(product: Product, pack: ProductPack): number | null {
  if (!product.listUnitPrice) return null;
  return Math.round(product.listUnitPrice * packPieces(pack) * 100) / 100;
}

/** "6'lı seri" */
export function packLabel(pack: ProductPack): string {
  const pieces = packPieces(pack);
  return `${pieces}'${PACK_SUFFIX[pieces] ?? 'lı'} seri`;
}

/** "S ×2 · M ×2 · L ×2" */
export function packDistribution(pack: ProductPack): string {
  return pack.units.map((unit) => `${unit.size} ×${unit.qty}`).join(' · ');
}

/** A pack cannot ship when one of its sizes is sold out. */
export function packAvailable(product: Product, pack: ProductPack): boolean {
  if (!product.soldOutSizes?.length) return true;
  return pack.units.every((unit) => !product.soldOutSizes?.includes(unit.size));
}

/** The pack shown on cards and in listings: the first one that can ship. */
export function primaryPack(product: Product): ProductPack | null {
  if (product.packs.length === 0) return null;
  return product.packs.find((pack) => packAvailable(product, pack)) ?? product.packs[0];
}

/** Cheapest way to buy the product, used for "başlangıç fiyatı" displays. */
export function entryPrice(product: Product): number {
  const pack = primaryPack(product);
  if (!pack) return product.unitPrice;
  return packNetPrice(product, pack);
}

