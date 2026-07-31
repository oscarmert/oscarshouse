import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { discounts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  createDiscountAction,
  deleteDiscountAction,
  toggleDiscountActiveAction,
} from "@/actions/discounts";
import { DiscountForm } from "@/components/forms/DiscountForm";
import { DiscountToggle } from "@/components/DiscountToggle";
import { DeleteButton } from "@/components/DeleteButton";

export default async function DiscountsPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const list = await db
    .select()
    .from(discounts)
    .where(eq(discounts.storeId, storeRecord.id))
    .orderBy(desc(discounts.createdAt));

  const createAction = createDiscountAction.bind(null, store);

  return (
    <main className="px-8 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">İndirim Kodları</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Aktif kodlar ödeme adımında müşteriler tarafından kullanılabilir.
      </p>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
        <DiscountForm action={createAction} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {list.length === 0 ? (
          <p className="text-neutral-500 text-sm p-6">Henüz indirim kodu yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-5 py-3">Kod</th>
                <th className="px-5 py-3">Tür</th>
                <th className="px-5 py-3">Değer</th>
                <th className="px-5 py-3">Aktif</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-t border-neutral-100">
                  <td className="px-5 py-3 font-mono font-medium">{d.code}</td>
                  <td className="px-5 py-3">{d.type === "PERCENTAGE" ? "Yüzde" : "Sabit tutar"}</td>
                  <td className="px-5 py-3">
                    {d.type === "PERCENTAGE" ? `%${d.value}` : d.value.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <DiscountToggle
                      active={d.active}
                      onChange={toggleDiscountActiveAction.bind(null, store, d.id)}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton
                      action={deleteDiscountAction.bind(null, store, d.id)}
                      confirmText={`"${d.code}" kodunu silmek istediğinize emin misiniz?`}
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
