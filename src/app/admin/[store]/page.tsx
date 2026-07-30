import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { products, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const allProducts = await db.select().from(products).where(eq(products.storeId, storeRecord.id));
  const allOrders = await db.select().from(orders).where(eq(orders.storeId, storeRecord.id));
  const revenue = allOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Ürün sayısı", value: allProducts.length },
    { label: "Sipariş sayısı", value: allOrders.length },
    { label: "Toplam ciro", value: formatMoney(revenue, storeRecord.currency) },
    { label: "Plan", value: storeRecord.plan },
  ];

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Genel Bakış</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="font-semibold mb-3">Son siparişler</h2>
        {allOrders.length === 0 ? (
          <p className="text-neutral-500 text-sm">Henüz sipariş yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-100">
                <th className="py-2">Müşteri</th>
                <th className="py-2">Durum</th>
                <th className="py-2">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-neutral-50">
                  <td className="py-2">{o.customerName}</td>
                  <td className="py-2">{o.status}</td>
                  <td className="py-2">{formatMoney(o.total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
