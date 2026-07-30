# GitHub'a yükleme ve tanıtım sayfasını yayınlama

Bu depo push edilmeye hazır (`git log` ile mevcut commit'leri görebilirsin).
Aşağıdaki adımları izleyerek hem kodu GitHub'a yükleyebilir hem de
`docs/index.html` içindeki tanıtım sayfasını GitHub Pages ile
yayınlayabilirsin.

## 1) GitHub'da boş bir repo oluştur

https://github.com/new adresine git, bir isim ver (ör. `ecom-platform`),
**README, .gitignore veya lisans ekleme** (bu depoda zaten var, eklersen
push sırasında çakışma yaşarsın). "Create repository" de tıkla.

## 2) Kodu push'la

Repo oluşturunca GitHub sana bir URL verecek (ör.
`https://github.com/KULLANICI_ADI/ecom-platform.git`). Proje klasöründe
şunu çalıştır:

```bash
git remote add origin https://github.com/KULLANICI_ADI/ecom-platform.git
git branch -M main
git push -u origin main
```

(SSH kullanıyorsan `git@github.com:KULLANICI_ADI/ecom-platform.git` şeklinde
de ekleyebilirsin.)

## 3) Tanıtım sayfasını (`docs/index.html`) GitHub Pages ile yayınla

1. Repo sayfasında **Settings → Pages**'e git.
2. "Build and deployment" altında **Source: Deploy from a branch** seç.
3. Branch olarak **main**, klasör olarak **/docs** seç, **Save**'e bas.
4. Birkaç dakika içinde sayfan şu adreste yayında olacak:
   `https://KULLANICI_ADI.github.io/ecom-platform/`

## 4) Tanıtım sayfasındaki linkleri güncelle

`docs/index.html` içinde iki yerde `https://github.com/` placeholder'ı var
("GitHub ↗" ve "Kaynak koda git ↗" butonları). Bunları kendi repo
adresinle (`https://github.com/KULLANICI_ADI/ecom-platform`) değiştir,
sonra:

```bash
git add docs/index.html
git commit -m "Update showcase page links"
git push
```

Not: Tanıtım sayfası statik bir HTML dosyasıdır — gerçek uygulamayı (Next.js
sunucusu + veritabanı) çalıştırmaz, sadece projeyi tanıtır. Uygulamanın
kendisini canlıya almak istersen (Vercel, Railway, Fly.io gibi bir platform
üzerinden) ayrı bir konu — istersen bir sonraki adımda onu da birlikte
kurabiliriz.
