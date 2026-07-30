# GitHub deposu ve tanıtım sayfası

Bu proje şu adreste yayında: **https://github.com/oscarmert/oscarshouse**

## GitHub Pages'i aç (tanıtım sayfası için)

`docs/index.html` dosyası repoda hazır. Sayfayı yayına almak için:

1. https://github.com/oscarmert/oscarshouse/settings/pages adresine git.
2. "Build and deployment" altında **Source: Deploy from a branch** seç.
3. Branch olarak **main**, klasör olarak **/docs** seç, **Save**'e bas.
4. Birkaç dakika içinde sayfa şurada yayında olacak:
   **https://oscarmert.github.io/oscarshouse/**

## Yerelde çalıştırmak için

```bash
git clone https://github.com/oscarmert/oscarshouse.git
cd oscarshouse
npm install
npm run db:push    # şemayı oluşturur (yerel SQLite veya Turso)
npm run db:seed    # demo mağaza + ürünler ekler
npm run dev         # http://localhost:3000
```

Bu, varsayılan olarak yerel bir SQLite dosyası (`data/app.db`) kullanır —
kalıcı değildir. Gerçek/kalıcı bir veritabanı (Turso) kullanmak için, klonun
kök dizinine bir `.env.local` dosyası ekleyin:

```bash
TURSO_DATABASE_URL=libsql://oscarshouse-oscarmert.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=<Turso panelinden aldığınız token>
```

Bu dosya `.gitignore` içinde olduğu için repoya dahil değildir — token'ı
[app.turso.tech](https://app.turso.tech) panelinden kendiniz almanız gerekir.
`.env.local` varken `npm run db:push` ve `npm run db:seed` otomatik olarak
Turso'ya bağlanır (kod hiçbir ek ayar gerektirmez).

Not: Tanıtım sayfası statik bir HTML dosyasıdır — gerçek uygulamayı (Next.js
sunucusu + veritabanı) çalıştırmaz, sadece projeyi tanıtır. Uygulamanın
kendisini canlıya almak istersen (Vercel, Railway, Fly.io gibi bir platform
üzerinden) ayrı bir konu — istersen bir sonraki adımda onu da birlikte
kurabiliriz.
