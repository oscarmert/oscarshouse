import Link from "next/link";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createProductAction } from "@/actions/catalog";
import { ProductForm } from "@/components/forms/ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);
  const cats = await db.select().from(categories).where(eq(categories.storeId, storeRecord.id));

  const action = createProductAction.bind(null, store);

  return (
    <main className="px-8 py-8">
      <Link href={`/admin/${store}/products`} className="text-sm text-neutral-500 hover:underline">
        ← Ürünler
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Yeni ürün</h1>
      <ProductForm action={action} categories={cats} />
    </main>
  );
}
