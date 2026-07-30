import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { getTheme } from "@/lib/themes";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const theme = getTheme(storeRecord.theme);
  const featured = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, storeRecord.id), eq(products.status, "ACTIVE")))
    .orderBy(desc(products.createdAt))
    .limit(8);

  return (
    <div>
      <section className={`${theme.headerBg} ${theme.buttonText} py-16 px-6 text-center`}>
        <h1 className="text-3xl sm:text-5xl font-bold">{storeRecord.name}</h1>
        <p className="mt-4 opacity-90 max-w-xl mx-auto">
          Yeni sezon ürünlerimizi keşfedin.
        </p>
        <Link
          href={`/store/${store}/products`}
          className="inline-block mt-6 bg-white text-neutral-900 px-6 py-2.5 rounded-full font-medium hover:bg-neutral-100"
        >
          Ürünleri incele
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-6">Öne çıkanlar</h2>
        {featured.length === 0 ? (
          <p className="text-neutral-500">Henüz ürün eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                storeSlug={store}
                theme={storeRecord.theme}
                currency={storeRecord.currency}
                product={p}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
