import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { updateProductAction } from "@/actions/catalog";
import { ProductForm } from "@/components/forms/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ store: string; id: string }>;
}) {
  const { store, id } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.storeId, storeRecord.id)))
    .limit(1);

  if (!product) notFound();

  const cats = await db.select().from(categories).where(eq(categories.storeId, storeRecord.id));
  const action = updateProductAction.bind(null, store, id);

  return (
    <main className="px-8 py-8">
      <Link href={`/admin/${store}/products`} className="text-sm text-neutral-500 hover:underline">
        ← Ürünler
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Ürünü düzenle</h1>
      <ProductForm action={action} categories={cats} product={product} />
    </main>
  );
}
