import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { getTheme } from "@/lib/themes";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

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

  return (
    <div>
      <section className={`${theme.headerBg} ${theme.buttonText} py-16 px-6 text-center overflow-hidden`}>
        <h1 className="text-3xl sm:text-5xl font-bold animate-[fadeInUp_0.6s_ease-out_both]">
          {storeRecord.name}
        </h1>
        <p className="mt-4 opacity-90 max-w-xl mx-auto animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
          Yeni sezon ürünlerimizi keşfedin.
        </p>
        <Link
          href={`/store/${store}/products`}
          className="inline-block mt-6 bg-white text-neutral-900 px-6 py-2.5 rounded-full font-medium transition-all duration-200 hover:bg-neutral-100 hover:scale-105 active:scale-95 animate-[fadeInUp_0.6s_ease-out_0.2s_both]"
        >
          Ürünleri incele
        </Link>
      </section>

      {cats.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pt-12">
          <div className="flex flex-wrap justify-center gap-4">
            {cats.map((c, i) => (
              <Reveal key={c.id} delayMs={i * 60}>
                <Link
                  href={`/store/${store}/products?category=${c.slug}`}
                  className="group flex items-center gap-2 border border-neutral-200 rounded-full px-5 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${theme.swatchClass} transition-transform duration-200 group-hover:scale-125`}
                  />
                  {c.name}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-12">
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
