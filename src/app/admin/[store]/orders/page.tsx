import Link from "next/link";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  FULFILLED: "Kargolandı",
  CANCELLED: "İptal",
};

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const allOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.storeId, storeRecord.id))
    .orderBy(desc(orders.createdAt));

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Siparişler</h1>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {allOrders.length === 0 ? (
          <p className="text-neutral-500 text-sm p-6">Henüz sipariş yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Tutar</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr key={o.id} className="border-t border-neutral-100">
                  <td className="px-5 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-neutral-500 text-xs">{o.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td className="px-5 py-3">{STATUS_LABEL[o.status]}</td>
                  <td className="px-5 py-3">{formatMoney(o.total, o.currency)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/${store}/orders/${o.id}`} className="text-neutral-600 hover:underline">
                      Detay
                    </Link>
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
