import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain, formatMoney } from "@/lib/store";
import { getCartWithItems } from "@/lib/cart";
import { getTheme } from "@/lib/themes";
import { updateCartItemAction } from "@/actions/cart";
import { CartItemRow } from "@/components/CartItemRow";

export default async function CartPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const { items, subtotal } = await getCartWithItems(storeRecord.id);
  const theme = getTheme(storeRecord.theme);
  const updateQuantity = updateCartItemAction.bind(null, store);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Sepetiniz</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 mb-4">Sepetiniz boş.</p>
          <Link href={`/store/${store}/products`} className="text-neutral-900 font-medium hover:underline">
            Ürünlere göz atın →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-neutral-200 rounded-xl px-5">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                currency={storeRecord.currency}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-lg font-semibold">
            <span>Ara toplam</span>
            <span>{formatMoney(subtotal, storeRecord.currency)}</span>
          </div>

          <Link
            href={`/store/${store}/checkout`}
            className={`mt-6 block text-center ${theme.buttonBg} ${theme.buttonText} py-3 rounded-lg font-medium`}
          >
            Ödemeye geç
          </Link>
        </>
      )}
    </div>
  );
}
