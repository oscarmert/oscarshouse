import Link from "next/link";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";
import { deleteProductAction } from "@/actions/catalog";
import { DeleteButton } from "@/components/DeleteButton";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeRecord.id))
    .orderBy(products.createdAt);

  return (
    <main className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Link
          href={`/admin/${store}/products/new`}
          className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800"
        >
          + Yeni ürün
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {allProducts.length === 0 ? (
          <p className="text-neutral-500 text-sm p-6">Henüz ürün eklenmedi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-5 py-3">Ürün</th>
                <th className="px-5 py-3">Fiyat</th>
                <th className="px-5 py-3">Stok</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="px-5 py-3 font-medium">{p.title}</td>
                  <td className="px-5 py-3">{formatMoney(p.price, storeRecord.currency)}</td>
                  <td className="px-5 py-3">{p.inventory}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        p.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.status === "ACTIVE" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <Link
                      href={`/admin/${store}/products/${p.id}/edit`}
                      className="text-neutral-600 hover:underline"
                    >
                      Düzenle
                    </Link>
                    <DeleteButton
                      action={deleteProductAction.bind(null, store, p.id)}
                      confirmText={`"${p.title}" ürününü silmek istediğinize emin misiniz?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
