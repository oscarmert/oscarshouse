import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";

export default async function StoreProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { store } = await params;
  const { category } = await searchParams;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const cats = await db.select().from(categories).where(eq(categories.storeId, storeRecord.id));

  const conditions = [eq(products.storeId, storeRecord.id), eq(products.status, "ACTIVE")];
  if (category) {
    const cat = cats.find((c) => c.slug === category);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  const list = await db
    .select()
    .from(products)
    .where(and(...conditions));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Ürünler</h1>

      {cats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/store/${store}/products`}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              !category ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300"
            }`}
          >
            Tümü
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/store/${store}/products?category=${c.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                category === c.slug
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-300"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-neutral-500">Bu kategoride ürün bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {list.map((p) => (
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
    </div>
  );
}
