import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain, formatMoney } from "@/lib/store";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { store } = await params;
  const { order: orderId } = await searchParams;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const order = orderId
    ? (
        await db
          .select()
          .from(orders)
          .where(and(eq(orders.id, orderId), eq(orders.storeId, storeRecord.id)))
          .limit(1)
      )[0]
    : null;

  if (!order) notFound();

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mx-auto mb-6 animate-[popIn_0.5s_ease-out_both]">
        ✓
      </div>
      <h1 className="text-2xl font-bold animate-[fadeInUp_0.4s_ease-out_0.15s_both]">Siparişiniz alındı!</h1>
      <p className="mt-2 text-neutral-500 animate-[fadeInUp_0.4s_ease-out_0.25s_both]">
        Sipariş #{order.id.slice(-8)} — {formatMoney(order.total, order.currency)}
      </p>
      <p className="mt-1 text-neutral-500 text-sm animate-[fadeInUp_0.4s_ease-out_0.3s_both]">
        Sipariş onayı {order.customerEmail} adresine gönderilecek.
      </p>
      <Link
        href={`/store/${store}/products`}
        className="inline-block mt-8 bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-95 animate-[fadeInUp_0.4s_ease-out_0.4s_both]"
      >
        Alışverişe devam et
      </Link>
    </div>
  );
}
