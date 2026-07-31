import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnedStore } from "@/lib/guards";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatMoney } from "@/lib/store";
import { updateOrderStatusAction } from "@/actions/orders";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { StatusBadge } from "@/components/admin/StatusChips";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ store: string; id: string }>;
}) {
  const { store, id } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.storeId, storeRecord.id)))
    .limit(1);
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const address = JSON.parse(order.shippingAddress) as {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };

  const updateStatus = updateOrderStatusAction.bind(null, store, order.id);

  return (
    <main className="px-8 py-8 max-w-2xl">
      <Link href={`/admin/${store}/orders`} className="text-sm text-neutral-500 hover:underline">
        ← Siparişler
      </Link>
      <div className="flex items-center justify-between mt-2 mb-1">
        <h1 className="text-2xl font-bold">Sipariş #{order.id.slice(-8)}</h1>
        <OrderStatusSelect currentStatus={order.status} onChange={updateStatus} />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <StatusBadge status={order.status} />
        <span className="text-sm text-neutral-500">
          {new Date(order.createdAt).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-2">Müşteri</h2>
        <p>{order.customerName}</p>
        <p className="text-neutral-500 text-sm">{order.customerEmail}</p>
        <h2 className="font-semibold mt-4 mb-2">Teslimat adresi</h2>
        <p className="text-sm text-neutral-700">
          {address.line1}, {address.city} {address.postalCode}, {address.country}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-5 py-3">Ürün</th>
              <th className="px-5 py-3">Adet</th>
              <th className="px-5 py-3">Fiyat</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="px-5 py-3">{item.title}</td>
                <td className="px-5 py-3">{item.quantity}</td>
                <td className="px-5 py-3">{formatMoney(item.price * item.quantity, order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-neutral-100 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Ara toplam</span>
            <span>{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-500">İndirim</span>
              <span>-{formatMoney(order.discountTotal, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-1">
            <span>Toplam</span>
            <span>{formatMoney(order.total, order.currency)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
