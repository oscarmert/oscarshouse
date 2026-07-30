import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCategoryAction, deleteCategoryAction } from "@/actions/catalog";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { DeleteButton } from "@/components/DeleteButton";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const cats = await db.select().from(categories).where(eq(categories.storeId, storeRecord.id));
  const createAction = createCategoryAction.bind(null, store);

  return (
    <main className="px-8 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Kategoriler</h1>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
        <CategoryForm action={createAction} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
        {cats.length === 0 && <p className="text-neutral-500 text-sm p-5">Henüz kategori yok.</p>}
        {cats.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3">
            <span>{c.name}</span>
            <DeleteButton
              action={deleteCategoryAction.bind(null, store, c.id)}
              confirmText={`"${c.name}" kategorisini silmek istediğinize emin misiniz?`}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
