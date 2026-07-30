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
- **Drizzle ORM** + **SQLite** — iki sürücü destekleniyor: yerelde
  `better-sqlite3` (kuruluma gerek yok, `data/app.db` dosyası) veya gerçek/
  kalıcı bir veritabanı için **Turso** (libSQL, `@libsql/client`). Hangisinin
  kullanılacağı `TURSO_DATABASE_URL` ortam değişkeninin varlığına göre otomatik
  seçilir (bkz. "Turso ile gerçek veritabanı" bölümü).
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
npm run db:push    # şemayı oluşturur (yerel SQLite veya Turso, aşağıya bakın)
npm run db:seed    # demo mağaza + ürünler ekler
npm run dev
```

Tarayıcıda:
- `http://localhost:3000` — platform ana sayfası
- `http://localhost:3000/store/demo` — demo mağaza (storefront)
- `http://localhost:3000/login` — demo giriş: **demo@shopkurucu.com / demo1234**
- `http://localhost:3000/admin/demo` — demo mağaza yönetim paneli

## Turso ile gerçek (kalıcı) veritabanı

Varsayılan olarak proje, `.env.local` içinde `TURSO_DATABASE_URL` yoksa
otomatik olarak yerel `data/app.db` dosyasını kullanır — hızlı denemeler için
idealdir ama kalıcı değildir (özellikle geçici/serverless ortamlarda). Gerçek,
kalıcı bir veritabanı için [Turso](https://turso.tech) kullanabilirsiniz
(ücretsiz katmanı bu proje için fazlasıyla yeterli):

1. [app.turso.tech](https://app.turso.tech) üzerinden ücretsiz hesap açın, yeni
   bir veritabanı oluşturun.
2. Veritabanının **Database URL**'ini (`libsql://...`) ve bir **Auth Token**
   oluşturup projenin kök dizininde `.env.local` dosyasına ekleyin:

   ```bash
   TURSO_DATABASE_URL=libsql://<veritabani-adiniz>.turso.io
   TURSO_AUTH_TOKEN=<token>
   ```

3. Şemayı ve demo verisini oluşturun:

   ```bash
   npm run db:push
   npm run db:seed
   ```

   `db:push` ve `db:seed`, `TURSO_DATABASE_URL` tanımlıysa otomatik olarak
   Turso'ya bağlanır — kod tarafında başka hiçbir değişiklik gerekmez.
4. `npm run dev` (veya prod'a deploy ederken hosting platformunuzda aynı iki
   ortam değişkenini tanımlayın) — uygulama artık kalıcı, bulut tabanlı bir
   veritabanı kullanıyor.

> Not: `.env.local` `.gitignore` içinde olduğu için asla GitHub'a gönderilmez —
> her ortamda (yerel makine, prod hosting) bu değişkenleri ayrı ayrı
> tanımlamanız gerekir.

## Canlıya alma (Vercel)

1. [vercel.com](https://vercel.com) üzerinde GitHub hesabınızla giriş yapın.
2. **Add New → Project**, `oscarmert/oscarshouse` reposunu seçip **Import**.
3. Deploy etmeden önce **Environment Variables** kısmına şunları ekleyin:
   - `TURSO_DATABASE_URL` — Turso panelinizden aldığınız URL
   - `TURSO_AUTH_TOKEN` — Turso panelinizden aldığınız token
   - `SESSION_SECRET` — rastgele, uzun bir metin (`openssl rand -hex 32` ile
     üretebilirsiniz). **Bu olmadan** oturum imzalama herkese açık, sabit bir
     anahtarla yapılır — canlıda mutlaka tanımlayın.
4. **Deploy**'a basın. Birkaç dakika içinde `https://<proje-adiniz>.vercel.app`
   adresinde yayında olacak.
5. Her `git push` sonrası Vercel otomatik olarak yeniden deploy eder.

> Not: Şu an mağazalara `alanadi.com/store/<magaza>` gibi path üzerinden
> erişiliyor (`demo.alanadi.com` gibi gerçek alt alan adı yönlendirmesi,
> özel domain bağladığınızda `src/proxy.ts` içindeki `ROOT_DOMAINS`'e
> ekleyerek aktif olur — bu adım şimdilik v1 kapsamı dışında).

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
4. **Postgres'e geçiş** — Turso/SQLite bu proje için yeterli olsa da, çok daha
   büyük ölçekte Postgres + Drizzle'a geçiş de mümkündür
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
