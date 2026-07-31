import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  FULFILLED: "Kargolandı",
  CANCELLED: "İptal",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ store: string; email: string }>;
}) {
  const { store, email: emailParam } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);
  const email = decodeURIComponent(emailParam);

  const customerOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.storeId, storeRecord.id), eq(orders.customerEmail, email)))
    .orderBy(desc(orders.createdAt));

  if (customerOrders.length === 0) notFound();

  const name = customerOrders[0].customerName;
  const totalSpent = customerOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);
  const firstOrderAt = customerOrders[customerOrders.length - 1].createdAt;

  return (
    <main className="px-8 py-8 max-w-3xl">
      <Link href={`/admin/${store}/customers`} className="text-sm text-neutral-500 hover:underline">
        ← Müşteriler
      </Link>

      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-neutral-500 text-sm">{email}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-500">Sipariş sayısı</p>
          <p className="text-2xl font-bold mt-1">{customerOrders.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-500">Toplam harcama</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(totalSpent, storeRecord.currency)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-500">İlk sipariş</p>
          <p className="text-2xl font-bold mt-1">{new Date(firstOrderAt).toLocaleDateString("tr-TR")}</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-5 py-3">Tarih</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3">Tutar</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customerOrders.map((o) => (
              <tr key={o.id} className="border-t border-neutral-100">
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
      </div>
    </main>
  );
}
