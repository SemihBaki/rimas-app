/**
 * Legal documents for the storefront.
 *
 * The texts describe the wholesale model (series/lots, VAT-exclusive prices) and
 * match the rules implemented in `src/lib/pricing.ts`. Company-identifying fields
 * are placeholders until the company supplies them; replace them here and every
 * page, metadata tag and structured-data block updates at once.
 */

export const COMPANY = {
  legalName: '[ŞİRKET UNVANI]',
  brand: 'RİMAS',
  address: '[AÇIK ADRES]',
  taxOffice: '[VERGİ DAİRESİ]',
  taxNumber: '[VERGİ NUMARASI]',
  mersis: '[MERSİS NUMARASI]',
  phone: '[TELEFON]',
  email: 'merhaba@rimas.com',
  kep: '[KEP ADRESİ]',
} as const;

/** True while any identifying field still holds a placeholder. */
export const companyPending = Object.values(COMPANY).some((value) =>
  value.startsWith('[')
);

export const LEGAL_UPDATED = '7 Kasım 2026';
export const LEGAL_UPDATED_ISO = '2026-11-07';

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  slug: string;
  /** Short label used on the legal index. */
  title: string;
  /** SEO title; `title` plus the brand. */
  summary: string;
  sections: LegalSection[];
};

const CONTACT = `Sorularınız için ${COMPANY.email} adresine yazabilir veya ${COMPANY.phone} numarasını arayabilirsiniz.`;

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    slug: 'kvkk',
    title: 'KVKK Aydınlatma Metni',
    summary:
      'Kişisel verilerin hangi amaçla işlendiği, kimlere aktarıldığı ve KVKK kapsamındaki haklarınız.',
    sections: [
      {
        heading: 'Veri sorumlusu',
        paragraphs: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla ${COMPANY.legalName} tarafından aşağıda açıklanan kapsamda işlenir.`,
          `Merkez adresi: ${COMPANY.address}. Vergi dairesi: ${COMPANY.taxOffice}. Vergi numarası: ${COMPANY.taxNumber}.`,
        ],
      },
      {
        heading: 'İşlenen kişisel veriler',
        bullets: [
          'Kimlik ve iletişim: ad, soyad, e-posta adresi, telefon numarası.',
          'Müşteri işlem: sipariş numarası, sipariş içeriği, teslimat ve fatura adresi, iade talepleri.',
          'İşlem güvenliği: oturum bilgisi, IP adresi, cihaz ve tarayıcı bilgisi, hata kayıtları.',
          'Finans: ödeme yöntemi ve işlem sonucu. Kart numarası ve CVV kodu tarafımızca saklanmaz; ödeme, yetkili ödeme kuruluşu üzerinden alınır.',
        ],
      },
      {
        heading: 'İşleme amaçları',
        bullets: [
          'Siparişin alınması, hazırlanması, kargolanması ve teslim edilmesi.',
          'Ödeme ve faturalandırma süreçlerinin yürütülmesi, muhasebe kayıtlarının tutulması.',
          'İade, değişim ve müşteri destek taleplerinin sonuçlandırılması.',
          'Hukuki yükümlülüklerin yerine getirilmesi ve yetkili kurumlara bilgi verilmesi.',
          'Açık rızanız varsa kampanya ve yeni koleksiyon duyurularının gönderilmesi.',
        ],
      },
      {
        heading: 'Hukuki sebepler',
        paragraphs: [
          'Verileriniz; sözleşmenin kurulması veya ifası, hukuki yükümlülüğün yerine getirilmesi, bir hakkın tesisi veya korunması ve meşru menfaat sebeplerine dayanılarak işlenir. Pazarlama iletileri yalnızca açık rızanıza dayanır; rızanızı dilediğiniz zaman geri çekebilirsiniz.',
        ],
      },
      {
        heading: 'Aktarım',
        paragraphs: [
          'Kişisel verileriniz; teslimat için anlaşmalı kargo şirketlerine, ödeme için yetkili ödeme kuruluşlarına, faturalandırma ve muhasebe hizmeti aldığımız firmalara ve barındırma hizmeti sağlayıcılarına, yalnızca hizmetin gerektirdiği ölçüde aktarılır.',
          'Yurt dışına aktarım yapılmamaktadır. İleride zorunlu hâle gelirse KVKK’nın ilgili hükümlerine uygun hareket edilir ve bu metin güncellenir.',
        ],
      },
      {
        heading: 'Toplama yöntemi ve saklama süresi',
        paragraphs: [
          'Veriler, uygulama ve web sitesindeki formlar, çerezler ve yerel depolama aracılığıyla elektronik ortamda toplanır. Sipariş ve fatura kayıtları, vergi mevzuatının öngördüğü süre boyunca; diğer veriler işleme amacının gerektirdiği süre ve zamanaşımı süreleri boyunca saklanır.',
        ],
      },
      {
        heading: 'KVKK kapsamındaki haklarınız',
        bullets: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme.',
          'İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.',
          'Eksik veya yanlış işlenen verilerin düzeltilmesini isteme.',
          'KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme.',
          'Aktarıldığı üçüncü kişileri öğrenme ve bunların bilgilendirilmesini isteme.',
          'Otomatik sistemlerle yapılan analiz sonucu aleyhinize çıkan sonuca itiraz etme.',
          'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde giderilmesini talep etme.',
        ],
      },
      {
        heading: 'Başvuru',
        paragraphs: [
          `Başvurularınızı ${COMPANY.email} adresine veya ${COMPANY.address} adresine yazılı olarak iletebilirsiniz. Talepler, niteliğine göre en kısa sürede ve en geç 30 gün içinde yanıtlanır.`,
          CONTACT,
        ],
      },
    ],
  },
  {
    slug: 'gizlilik',
    title: 'Gizlilik ve Çerez Politikası',
    summary:
      'Hangi verileri topladığımız, çerezleri ve yerel depolamayı nasıl kullandığımız ve verilerinizi nasıl koruduğumuz.',
    sections: [
      {
        heading: 'Topladığımız bilgiler',
        paragraphs: [
          'Sipariş verebilmeniz ve hesabınızı yönetebilmeniz için ad, e-posta, telefon, teslimat ve fatura adresi bilgilerinizi işleriz. Şifreler geri döndürülemez biçimde (scrypt) saklanır; düz metin şifre tutulmaz.',
        ],
      },
      {
        heading: 'Çerezler ve yerel depolama',
        bullets: [
          'Oturum çerezi: giriş yaptığınızda kimliğinizi doğrulamak için kullanılan, HttpOnly ve SameSite korumalı çerez.',
          'Sepet ve favoriler: seçimlerinizi cihazınızda korumak için tarayıcının yerel depolamasında saklanır.',
          'Zorunlu olmayan analitik veya reklam çerezi kullanılmamaktadır. İleride kullanılması hâlinde bu politika güncellenir ve gerekli rıza alınır.',
        ],
      },
      {
        heading: 'Paylaşım',
        paragraphs: [
          'Bilgileriniz; teslimat için kargo şirketiyle, ödeme için ödeme kuruluşuyla ve yasal olarak yetkili kurumlarla, talep edilen kapsamda paylaşılır. Verileriniz reklam amacıyla üçüncü kişilere satılmaz.',
        ],
      },
      {
        heading: 'Güvenlik',
        paragraphs: [
          'Veriler şifreli bağlantı (HTTPS) üzerinden taşınır. Erişim yetkileri görev gereğiyle sınırlandırılır ve oturum bilgileri tarayıcıda erişilemez biçimde tutulur. Bir güvenlik olayı yaşanması hâlinde ilgili kişiler ve kurumlar mevzuatın öngördüğü sürede bilgilendirilir.',
        ],
      },
      {
        heading: 'Saklama ve silme',
        paragraphs: [
          'Hesabınızı silmek istediğinizde kimlik ve iletişim verileriniz silinir; yasal olarak saklanması zorunlu sipariş ve fatura kayıtları ise ilgili süre boyunca yalnızca bu amaçla tutulur.',
        ],
      },
      {
        heading: 'Çocuklar',
        paragraphs: [
          'Hizmetlerimiz 18 yaşın altındaki kişilere yönelik değildir. 18 yaşın altındaki bir kullanıcıya ait veri işlendiğini fark edersek kaydı sileriz.',
        ],
      },
      {
        heading: 'İletişim',
        paragraphs: [CONTACT],
      },
    ],
  },
  {
    slug: 'mesafeli-satis',
    title: 'Mesafeli Satış Sözleşmesi',
    summary:
      'Satıcı ve alıcı bilgileri, siparişin konusu, fiyat, ödeme, teslimat ve cayma hakkına ilişkin esaslar.',
    sections: [
      {
        heading: 'Taraflar',
        paragraphs: [
          `Satıcı: ${COMPANY.legalName}, ${COMPANY.address}. Vergi dairesi: ${COMPANY.taxOffice}, vergi numarası: ${COMPANY.taxNumber}. E-posta: ${COMPANY.email}.`,
          'Alıcı: Sipariş formunda ad, adres ve iletişim bilgileri belirtilen kişi veya kuruluştur.',
        ],
      },
      {
        heading: 'Konu',
        paragraphs: [
          'Bu sözleşme, alıcının satıcıya ait uygulama veya web sitesi üzerinden elektronik ortamda verdiği siparişin satışı ve teslimine ilişkin tarafların hak ve yükümlülüklerini düzenler. Sipariş onayı verildiğinde alıcı bu sözleşmenin hükümlerini kabul etmiş sayılır.',
        ],
      },
      {
        heading: 'Ürün ve satış biçimi',
        bullets: [
          'Ürünler toptan satışa uygun biçimde, şirket tarafından belirlenen seri (lot) paketleri hâlinde satılır.',
          'Seri içeriği ve beden dağılımı ürün sayfasında gösterilir; alıcı dağılımı değiştiremez.',
          'Sipariş adedi, seri adedi olarak seçilir. Her seri, ürün sayfasında belirtilen sayıda parça içerir.',
          'Tek parça satışı yalnızca ürün sayfasında açıkça belirtildiği ürünlerde mümkündür.',
        ],
      },
      {
        heading: 'Fiyat ve ödeme',
        bullets: [
          'Ürün fiyatları KDV hariçtir; sipariş özetinde KDV ayrıca hesaplanır. Uygulanan KDV oranı %10’dur.',
          'Seri bedeli, birim fiyatın serideki parça sayısıyla çarpımıdır. Gösterilen toplam, siparişin kesin bedelidir.',
          'Kargo bedeli, KDV hariç ara toplam 5.000 ₺ ve üzerinde ise alıcıdan alınmaz. Bu tutarın altındaki siparişlerde standart kargo 49,90 ₺, express kargo 89,90 ₺’dir.',
          'Ödeme, anlaşmalı ödeme kuruluşu üzerinden alınır. Kart bilgileri satıcı tarafından saklanmaz.',
        ],
      },
      {
        heading: 'Teslimat',
        paragraphs: [
          'Siparişler stok durumuna göre 1–3 iş günü içinde kargoya verilir; express seçilen siparişlerde bu süre 1 iş günüdür. Teslimat süresi kargo şirketinin bölgesine göre değişebilir.',
          'Stokta bulunmayan bir seri siparişe dönüşemez; tükenen beden içeren seriler satışa kapatılır.',
        ],
      },
      {
        heading: 'Cayma hakkı',
        paragraphs: [
          'Alıcı, teslimden itibaren 14 gün içinde gerekçe göstermeden cayma hakkına sahiptir. Cayma hakkının kullanımı, istisnaları ve iade süreci “Cayma Hakkı ve İade” metninde ayrıntılı olarak düzenlenmiştir.',
        ],
      },
      {
        heading: 'Uyuşmazlıklar',
        paragraphs: [
          'Tüketici işlemlerinde, Ticaret Bakanlığı’nca ilan edilen parasal sınırlar dâhilinde alıcının yerleşim yerindeki Tüketici Hakem Heyetleri, bu sınırı aşan uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir. Tacir veya ticari işletme sıfatıyla yapılan alımlarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.',
        ],
      },
      {
        heading: 'Yürürlük',
        paragraphs: [
          'Alıcı, siparişi onaylamadan önce bu sözleşmeyi okuduğunu ve kabul ettiğini beyan eder. Sözleşme, siparişin verildiği anda yürürlüğe girer.',
        ],
      },
    ],
  },
  {
    slug: 'cayma',
    title: 'Cayma Hakkı ve İade',
    summary:
      '14 günlük cayma hakkının kullanımı, iade koşulları, kargo süreci ve ücret iadesi.',
    sections: [
      {
        heading: 'Cayma süresi',
        paragraphs: [
          'Teslim aldığınız ürünü, teslim tarihinden itibaren 14 gün içinde gerekçe göstermeden iade edebilirsiniz. Süre, ürünün size veya gösterdiğiniz adrese teslim edildiği gün başlar.',
        ],
      },
      {
        heading: 'Nasıl kullanılır',
        bullets: [
          `Talebinizi ${COMPANY.email} adresine sipariş numaranızla birlikte iletin.`,
          'Tarafımızdan iletilen iade kargo koduyla ürünü anlaşmalı kargo şirketine teslim edin.',
          'Ürünü orijinal ambalajı, etiketi ve varsa aksesuarlarıyla birlikte gönderin.',
        ],
      },
      {
        heading: 'İade koşulları',
        paragraphs: [
          'Ürünün kullanılmamış, yıkanmamış ve tekrar satılabilir durumda olması gerekir. Beden veya renk nedeniyle yapılan iadelerde ürünün hasar görmediğinden emin olun.',
          'Seri hâlinde satılan ürünlerde cayma hakkı serinin tamamı için kullanılır; seriden tek parça iadesi kabul edilmez. Tek parça satışa açık ürünlerde ilgili parça iade edilebilir.',
        ],
      },
      {
        heading: 'Cayma hakkının istisnaları',
        bullets: [
          'Alıcının isteğiyle kişiselleştirilen veya kişiye özel üretilen ürünler.',
          'Hijyen açısından iadesi uygun olmayan, ambalajı açılmış aksesuar ve iç giyim ürünleri.',
          'Teslimden sonra hasar gören, kullanılan veya orijinal ambalajı kaybolan ürünler.',
        ],
      },
      {
        heading: 'Ücret iadesi',
        paragraphs: [
          'İade edilen ürün tarafımıza ulaşıp kontrol edildikten sonra, ödeme yaptığınız yönteme en geç 14 gün içinde iade edilir. Kargo bedeli, cayma hakkının kullanıldığı siparişlerde mevzuata uygun biçimde değerlendirilir.',
          'İade sürecinde kargo şirketinden alınan takip numarasını saklamanız, olası gecikmelerde süreci hızlandırır.',
        ],
      },
      {
        heading: 'Hasarlı veya yanlış ürün',
        paragraphs: [
          'Teslimatta hasar görmüş veya siparişinizden farklı bir ürün geldiyse, teslim tarihinden itibaren 48 saat içinde fotoğraflarla birlikte bize ulaşın. Bu durumlarda kargo bedeli tarafımızca karşılanır ve ürün yenisiyle değiştirilir veya bedeli iade edilir.',
        ],
      },
      {
        heading: 'İletişim',
        paragraphs: [CONTACT],
      },
    ],
  },
  {
    slug: 'teslimat',
    title: 'Teslimat ve Kargo',
    summary:
      'Hazırlık süresi, kargo seçenekleri, ücretsiz kargo eşiği ve teslimatla ilgili sık sorulanlar.',
    sections: [
      {
        heading: 'Hazırlık süresi',
        paragraphs: [
          'Stokta bulunan siparişler 1–3 iş günü içinde hazırlanıp kargoya verilir. Express seçilen siparişlerde hazırlık süresi 1 iş günüdür. Hafta sonu ve resmî tatillerde verilen siparişlerin hazırlığı bir sonraki iş günü başlar.',
        ],
      },
      {
        heading: 'Kargo seçenekleri',
        bullets: [
          'Standart kargo: 49,90 ₺, tahmini teslimat 2–4 iş günü.',
          'Express kargo: 89,90 ₺, tahmini teslimat 1–2 iş günü.',
          'KDV hariç ara toplam 5.000 ₺ ve üzerinde kargo ücretsizdir.',
        ],
      },
      {
        heading: 'Teslimat adresi',
        paragraphs: [
          'Sipariş, ödeme adımında girdiğiniz adrese teslim edilir. Adres değişikliği için sipariş kargoya verilmeden önce bize ulaşmanız gerekir. Kargo şirketinin teslim edemediği paketler, şubede belirtilen süre boyunca bekletilir; bu süre sonunda paket tarafımıza geri döner.',
        ],
      },
      {
        heading: 'Teslimat kontrolü',
        paragraphs: [
          'Paketi teslim alırken dış ambalajında hasar olup olmadığını kontrol edin. Hasar varsa kargo görevlisine tutanak tutturun ve durumu bize bildirin. Ürünün farklı veya eksik olması hâlinde 48 saat içinde iletişime geçin.',
        ],
      },
      {
        heading: 'Takip',
        paragraphs: [
          'Siparişiniz kargoya verildiğinde takip bilgisi e-posta ile paylaşılır. Hesabınızdaki “Siparişler” ekranından sipariş durumunu ve teslimat tarihini görebilirsiniz.',
        ],
      },
      {
        heading: 'İletişim',
        paragraphs: [CONTACT],
      },
    ],
  },
];

export function getLegalDocument(slug: string | undefined): LegalDocument | null {
  if (!slug) return null;
  return LEGAL_DOCUMENTS.find((document) => document.slug === slug) ?? null;
}
