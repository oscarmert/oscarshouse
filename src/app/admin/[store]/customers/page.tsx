import Link from "next/link";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";

// This project has no separate storefront customer signup/login flow yet —
// every order is a guest checkout. "Customers" here are therefore derived
// straight from the orders table, grouped by email, which is the only real
// customer identity data the app actually captures today.
export default async function CustomersPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const allOrders = await db.select().from(orders).where(eq(orders.storeId, storeRecord.id));

  const byEmail = new Map<
    string,
    { name: string; email: string; orderCount: number; totalSpent: number; lastOrderAt: string }
  >();
  for (const o of allOrders) {
    const existing = byEmail.get(o.customerEmail);
    const spent = o.status === "CANCELLED" ? 0 : o.total;
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += spent;
      if (o.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = o.createdAt;
        existing.name = o.customerName;
      }
    } else {
      byEmail.set(o.customerEmail, {
        name: o.customerName,
        email: o.customerEmail,
        orderCount: 1,
        totalSpent: spent,
        lastOrderAt: o.createdAt,
      });
    }
  }

  const customers = Array.from(byEmail.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <main className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-1">Müşteriler</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Siparişlerden türetilir — {customers.length} farklı müşteri sipariş verdi.
      </p>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {customers.length === 0 ? (
          <p className="text-neutral-500 text-sm p-6">Henüz müşteri yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Sipariş sayısı</th>
                <th className="px-5 py-3">Toplam harcama</th>
                <th className="px-5 py-3">Son sipariş</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-t border-neutral-100">
                  <td className="px-5 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-neutral-500 text-xs">{c.email}</p>
                  </td>
                  <td className="px-5 py-3">{c.orderCount}</td>
                  <td className="px-5 py-3 font-medium">{formatMoney(c.totalSpent, storeRecord.currency)}</td>
                  <td className="px-5 py-3">{new Date(c.lastOrderAt).toLocaleDateString("tr-TR")}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/${store}/customers/${encodeURIComponent(c.email)}`}
                      className="text-neutral-600 hover:underline"
                    >
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
