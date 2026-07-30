# ShopKurucu — Çok Kiracılı E-Ticaret Platformu (v1)

Shopify / Ticimax mantığında, kullanıcıların kayıt olup kendi online mağazalarını
açabildiği çok kiracılı (multi-tenant) bir e-ticaret SaaS platformunun **v1
temeli**. Bu proje, üzerine katman katman özellik ekleyebileceğiniz sağlam bir
mimari + çalışan bir uçtan uca akış sunar.

> Not: Shopify/Ticimax seviyesinde tam kapsamlı bir platform yıllar süren bir
> mühendislik çalışmasıdır. Bu depo; mimari, veri modeli ve temel akışların
> (mağaza oluşturma, ürün yönetimi, storefront, sepet/checkout, tema, çoklu
> dil/para birimi altyapısı) sağlam bir v1'ini içerir. Aşağıdaki "Yol Haritası"
> bölümünde neyin henüz eksik olduğu ve nasıl ekleneceği anlatılıyor.

## Teknoloji yığını

- **Next.js 16** (App Router, Server Actions, Turbopack) + TypeScript
- **Drizzle ORM** + **SQLite** (better-sqlite3) — tek dosyalık, kuruluma
  gerektirmeyen bir veritabanı. Prod'da Postgres'e geçmek birkaç satır
  (bkz. Yol Haritası).
- **Tailwind CSS v4**
- Kendi yazdığımız hafif **JWT tabanlı oturum** sistemi (`jose` + `bcryptjs`) —
  mağaza sahipleri için `platform_session`, müşteriler için mağaza bazlı
  `customer_session_<storeId>` cookie'leri.
- `zod` ile form doğrulama, `zustand` bağımlılığı ileride client-side state
  ihtiyacı için hazır (şu an server actions + React state yeterli).

## Mimari özet

- **Çok kiracılılık (multi-tenancy):** Paylaşımlı şema + `storeId` foreign key
  yaklaşımı (`stores` tablosu = tenant). Her tablo (`products`, `orders`,
  `categories`, ...) bir `storeId` taşır ve tüm sorgular bu id ile filtrelenir.
- **Routing:**
  - `/` `/login` `/signup` `/dashboard` → platform seviyesi sayfalar (hesap,
    mağaza yönetimi listesi)
  - `/admin/[store]/...` → mağaza sahibinin yönetim paneli (ürünler,
    kategoriler, siparişler, ayarlar) — oturum + sahiplik kontrolü
    `src/lib/guards.ts` içinde.
  - `/store/[store]/...` → herkese açık storefront (ana sayfa, ürünler, sepet,
    checkout).
  - `src/proxy.ts` (Next.js 16'da `middleware.ts`'in yeni adı) alt alan adı
    (`magaza.sizinplatformunuz.com`) tabanlı isteği otomatik olarak
    `/store/magaza/...` yoluna çeviriyor. Yerel geliştirmede path tabanlı
    (`/store/demo`) kullanmak yeterli; gerçek alan adınızı `src/proxy.ts`
    içindeki `ROOT_DOMAINS` listesine eklediğinizde alt alan adları da
    otomatik çalışır.
- **Tema sistemi:** `src/lib/themes.ts` içinde tanımlı, genişletilebilir bir
  tema kaydı (`classic`, `vivid`). Yeni tema eklemek için bu dosyaya bir kayıt
  eklemeniz yeterli.
- **Sepet:** Cookie tabanlı misafir sepeti (`cart_<storeId>`), mağaza bazlı.
  Server Actions içinde oluşturulur/güncellenir (`src/actions/cart.ts`,
  `src/lib/cart.ts`).
- **Ödeme:** Şu an **simüle edilmiş** bir ödeme akışı var — sipariş anında
  `PAID` olarak işaretleniyor. Gerçek bir ödeme sağlayıcısı entegrasyonu
  gerekiyor (bkz. Yol Haritası).

## Kurulum

```bash
npm install
npm run db:push    # SQLite şemasını oluşturur (data/app.db)
npm run db:seed    # demo mağaza + ürünler ekler
npm run dev
```

Tarayıcıda:
- `http://localhost:3000` — platform ana sayfası
- `http://localhost:3000/store/demo` — demo mağaza (storefront)
- `http://localhost:3000/login` — demo giriş: **demo@shopkurucu.com / demo1234**
- `http://localhost:3000/admin/demo` — demo mağaza yönetim paneli

## Uçtan uca test

`scripts/e2e-check.mjs`, Playwright ile tüm ana akışı (ürün gezme → sepete
ekleme → checkout → admin girişi → ürün oluşturma → sipariş görüntüleme)
otomatik olarak test eder:

```bash
node scripts/e2e-check.mjs
```

(Dev server'ın `localhost:3000`'de çalışıyor olması gerekir.)

## Yol haritası (v1'den sonrası)

Aşağıdakiler bilinçli olarak v1 kapsamı dışında bırakıldı; gerçek bir üretim
platformu için önerilen sıralama:

1. **Gerçek ödeme entegrasyonu** — Stripe, iyzico veya PayTR. `src/actions/checkout.ts`
   içindeki "simulated payment" bloğunu gerçek bir gateway çağrısıyla
   değiştirin (webhook ile sipariş durumunu güncelleyin).
2. **Müşteri hesapları** — şema zaten hazır (`customers` tablosu), ancak
   giriş/kayıt sayfaları henüz yok. Şu an checkout misafir (guest) olarak
   çalışıyor. Müşteri girişini eklemek, sipariş geçmişi sayfası gibi
   özellikleri mümkün kılar.
3. **Ürün varyantları** (beden/renk gibi) ve gerçek stok/SKU yönetimi.
4. **Postgres'e geçiş** — prod ölçek için SQLite yerine Postgres + Drizzle
   (`drizzle-orm/node-postgres` sürücüsüne geçmek birkaç satırlık değişiklik).
5. **Gerçek alt alan adı / özel domain yönlendirmesi** — `src/proxy.ts` içinde
   altyapı hazır; DNS + SSL (ör. Vercel'in wildcard domain desteği veya
   Cloudflare) ile bağlanması gerekiyor.
6. **Kargo entegrasyonları, indirim kuponu uygulama akışı, çoklu para birimi
   çevirisi (şu an sadece görüntüleme formatı var, gerçek kur çevirimi yok),
   ürün görselleri için dosya yükleme (şu an sadece URL alanı var — S3/
   Cloudflare R2 entegrasyonu eklenebilir), e-posta bildirimleri (sipariş
   onayı vb.), arama/filtreleme, SEO meta etiketleri, app/plugin marketplace.**
7. **Test kapsamının genişletilmesi** — `scripts/e2e-check.mjs` iyi bir
   başlangıç noktası; CI'a bağlamak ve daha fazla senaryo eklemek faydalı olur.

## Klasör yapısı

```
src/
  db/            Drizzle şeması, client, seed script
  lib/           auth (JWT session), cart, store/tenant resolve, themes, guards
  actions/       Server Actions (platform, catalog, cart, checkout, orders)
  components/    Paylaşılan UI + formlar
  app/
    (root)/      Platform sayfaları: /, /login, /signup, /dashboard
    admin/[store]/   Mağaza yönetim paneli
    store/[store]/   Storefront (herkese açık mağaza sayfaları)
  proxy.ts       Alt alan adı → /store/[slug] yönlendirmesi (Next 16 "proxy")
```
