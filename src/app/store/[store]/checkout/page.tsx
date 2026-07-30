import { notFound, redirect } from "next/navigation";
import { getStoreBySubdomain, formatMoney } from "@/lib/store";
import { getCartWithItems } from "@/lib/cart";
import { getTheme } from "@/lib/themes";
import { checkoutAction } from "@/actions/checkout";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const { items, subtotal } = await getCartWithItems(storeRecord.id);
  if (items.length === 0) redirect(`/store/${store}/cart`);

  const theme = getTheme(storeRecord.theme);
  const action = checkoutAction.bind(null, store);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 grid sm:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">Teslimat & Ödeme</h1>
        <CheckoutForm action={action} buttonClass={`${theme.buttonBg} ${theme.buttonText}`} />
      </div>

      <div>
        <h2 className="font-semibold mb-4">Sipariş özeti</h2>
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>{formatMoney(item.priceAtAdd * item.quantity, storeRecord.currency)}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 font-semibold">
            <span>Toplam</span>
            <span>{formatMoney(subtotal, storeRecord.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
