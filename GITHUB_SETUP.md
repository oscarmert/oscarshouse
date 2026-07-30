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
npm run db:push    # SQLite şemasını oluşturur
npm run db:seed    # demo mağaza + ürünler ekler
npm run dev         # http://localhost:3000
```

Not: Tanıtım sayfası statik bir HTML dosyasıdır — gerçek uygulamayı (Next.js
sunucusu + veritabanı) çalıştırmaz, sadece projeyi tanıtır. Uygulamanın
kendisini canlıya almak istersen (Vercel, Railway, Fly.io gibi bir platform
üzerinden) ayrı bir konu — istersen bir sonraki adımda onu da birlikte
kurabiliriz.
