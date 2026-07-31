import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopProductsChart } from "@/components/admin/TopProductsChart";
import { StatusChips, StatusBadge } from "@/components/admin/StatusChips";
import Link from "next/link";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_WINDOW = 14;

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const [allProducts, allOrders, allOrderItems] = await Promise.all([
    db.select().from(products).where(eq(products.storeId, storeRecord.id)),
    db.select().from(orders).where(eq(orders.storeId, storeRecord.id)),
    db
      .select({
        title: orderItems.title,
        quantity: orderItems.quantity,
        price: orderItems.price,
        orderId: orderItems.orderId,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.storeId, storeRecord.id))),
  ]);

  const nonCancelled = allOrders.filter((o) => o.status !== "CANCELLED");
  const revenue = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = nonCancelled.length > 0 ? revenue / nonCancelled.length : 0;

  const stats = [
    { label: "Ürün sayısı", value: String(allProducts.length) },
    { label: "Sipariş sayısı", value: String(allOrders.length) },
    { label: "Toplam ciro", value: formatMoney(revenue, storeRecord.currency) },
    { label: "Ortalama sepet tutarı", value: formatMoney(avgOrderValue, storeRecord.currency) },
  ];

  // Revenue per day for the last DAYS_WINDOW days, including zero-days.
  const cancelledIds = new Set(allOrders.filter((o) => o.status === "CANCELLED").map((o) => o.id));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayBuckets: { key: string; label: string; value: number }[] = [];
  for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    dayBuckets.push({
      key,
      label: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
      value: 0,
    });
  }
  const bucketByKey = new Map(dayBuckets.map((b) => [b.key, b]));
  for (const o of allOrders) {
    if (cancelledIds.has(o.id)) continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const bucket = bucketByKey.get(key);
    if (bucket) bucket.value += o.total;
  }

  // Top products by revenue (excluding items from cancelled orders).
  const revenueByTitle = new Map<string, number>();
  for (const item of allOrderItems) {
    if (cancelledIds.has(item.orderId)) continue;
    revenueByTitle.set(item.title, (revenueByTitle.get(item.title) ?? 0) + item.price * item.quantity);
  }
  const topProducts = Array.from(revenueByTitle.entries())
    .map(([title, revenue]) => ({ title, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Order status breakdown.
  const statusCounts: Record<string, number> = {};
  for (const o of allOrders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

  // Low stock: active products running low, most urgent first.
  const lowStock = allProducts
    .filter((p) => p.status === "ACTIVE" && p.inventory <= 5)
    .sort((a, b) => a.inventory - b.inventory)
    .slice(0, 6);

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Genel Bakış</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold mb-1">Son 14 gün ciro</h2>
          <p className="text-xs text-neutral-400 mb-4">İptal edilen siparişler hariç</p>
          <RevenueChart data={dayBuckets} currency={storeRecord.currency} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">En çok satan ürünler</h2>
          <TopProductsChart data={topProducts} currency={storeRecord.currency} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Sipariş durumu dağılımı</h2>
          <StatusChips counts={statusCounts} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Stokta azalan ürünler</h2>
            {lowStock.length > 0 && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {lowStock.length} ürün
              </span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <p className="text-neutral-500 text-sm">Stokta azalan ürün yok.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/${store}/products/${p.id}/edit`}
                    className="text-neutral-700 hover:underline truncate pr-2"
                  >
                    {p.title}
                  </Link>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.inventory === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.inventory === 0 ? "Tükendi" : `${p.inventory} adet kaldı`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
                  <td className="py-2">
                    <StatusBadge status={o.status} />
                  </td>
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
