import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { getTheme } from "@/lib/themes";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { HeroCarousel, type CarouselSlide } from "@/components/HeroCarousel";

// Generic, brand-agnostic campaign photography (free Unsplash stock, already
// verified reachable elsewhere in this project) — stands in for the kind of
// full-bleed lifestyle imagery big fashion/sportswear sites lead with. Swap
// per-tenant later if stores get their own campaign asset uploads.
const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1600&h=900&fit=crop&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1600&h=900&fit=crop&q=80",
];

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const theme = getTheme(storeRecord.theme);
  const [featured, cats] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeRecord.id), eq(products.status, "ACTIVE")))
      .orderBy(desc(products.createdAt))
      .limit(8),
    db.select().from(categories).where(eq(categories.storeId, storeRecord.id)),
  ]);

  const slides: CarouselSlide[] = [
    {
      imageUrl: BANNER_IMAGES[0],
      eyebrow: "Yeni Sezon",
      title: `${storeRecord.name}'da yeni sezon başladı`,
      subtitle: "Günlük giyimden aksesuara, seçilmiş yeni ürünleri keşfet.",
      ctaLabel: "Koleksiyonu incele",
      ctaHref: `/store/${store}/products`,
    },
    {
      imageUrl: BANNER_IMAGES[1],
      eyebrow: "Sınırlı Süre",
      title: "Seçili ürünlerde %20'ye varan indirim",
      subtitle: "Fırsatlar stoklarla sınırlı — favorilerini şimdi sepetine ekle.",
      ctaLabel: "Fırsatları gör",
      ctaHref: `/store/${store}/products`,
    },
    {
      imageUrl: BANNER_IMAGES[2],
      eyebrow: "Detaylarda Fark",
      title: "Zamansız parçalar, kaliteli malzeme",
      subtitle: "Uzun ömürlü ve şık — gardırobunun yeni favorileri burada.",
      ctaLabel: "Şimdi keşfet",
      ctaHref: `/store/${store}/products`,
    },
  ];

  return (
    <div>
      <HeroCarousel slides={slides} />

      {cats.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pt-14">
          <h2 className="text-xl font-bold mb-6">Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {cats.map((c, i) => (
              <Reveal key={c.id} delayMs={i * 70}>
                <Link
                  href={`/store/${store}/products?category=${c.slug}`}
                  className="group relative block aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100"
                >
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className={`absolute inset-0 ${theme.headerBg}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="text-white font-semibold text-lg drop-shadow-sm">{c.name}</span>
                    <span className="block text-white/80 text-xs mt-0.5 transition-transform duration-300 group-hover:translate-x-1">
                      Ürünleri gör →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Reveal className="max-w-6xl mx-auto px-6 pt-14">
        <section
          className={`relative rounded-2xl overflow-hidden ${theme.headerBg} ${theme.buttonText} px-8 py-14 sm:px-14 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8`}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-75 mb-2">
              Üyelere özel
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold max-w-md">
              İlk siparişinde %10 indirim seni bekliyor
            </h2>
            <p className="mt-3 opacity-85 max-w-md text-sm">
              Ödeme adımında geçerli bir indirim kodu varsa uygulayabilirsin.
            </p>
          </div>
          <Link
            href={`/store/${store}/products`}
            className="shrink-0 bg-white text-neutral-900 px-7 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:bg-neutral-200 hover:scale-105 active:scale-95"
          >
            Alışverişe başla
          </Link>
        </section>
      </Reveal>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-xl font-bold mb-6">Öne çıkanlar</h2>
        {featured.length === 0 ? (
          <p className="text-neutral-500">Henüz ürün eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p, i) => (
              <Reveal key={p.id} delayMs={(i % 4) * 80}>
                <ProductCard
                  storeSlug={store}
                  theme={storeRecord.theme}
                  currency={storeRecord.currency}
                  product={p}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
