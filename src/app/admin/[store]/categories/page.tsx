import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCategoryAction, deleteCategoryAction, updateCategoryImageAction } from "@/actions/catalog";
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
    <main className="px-8 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Kategoriler</h1>
      <p className="text-sm text-neutral-500 mb-6 -mt-4">
        Görsel eklediğin kategoriler ana sayfada büyük vitrin kutucukları olarak gösterilir.
      </p>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
        <CategoryForm action={createAction} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
        {cats.length === 0 && <p className="text-neutral-500 text-sm p-5">Henüz kategori yok.</p>}
        {cats.map((c) => {
          const updateImage = updateCategoryImageAction.bind(null, store, c.id);
          return (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-neutral-400">Görsel yok</span>
                )}
              </div>
              <span className="w-32 shrink-0 font-medium">{c.name}</span>
              <form action={updateImage} className="flex-1 flex gap-2">
                <input
                  name="imageUrl"
                  defaultValue={c.imageUrl ?? ""}
                  placeholder="Görsel URL"
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 whitespace-nowrap"
                >
                  Kaydet
                </button>
              </form>
              <DeleteButton
                action={deleteCategoryAction.bind(null, store, c.id)}
                confirmText={`"${c.name}" kategorisini silmek istediğinize emin misiniz?`}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
