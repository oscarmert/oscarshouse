import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain, formatMoney } from "@/lib/store";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { addToCartAction } from "@/actions/cart";
import { getTheme } from "@/lib/themes";
import { QuantityStepper } from "@/components/QuantityStepper";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ store: string; slug: string }>;
}) {
  const { store, slug } = await params;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, storeRecord.id), eq(products.slug, slug)))
    .limit(1);
  if (!product || product.status !== "ACTIVE") notFound();

  const theme = getTheme(storeRecord.theme);
  const action = addToCartAction.bind(null, store, product.id);
  const outOfStock = product.inventory <= 0;
  const lowStock = !outOfStock && product.inventory <= 5;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href={`/store/${store}/products`}
        className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
        Ürünlere dön
      </Link>

      <div className="grid sm:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden animate-[fadeInUp_0.5s_ease-out_both]">
          {hasDiscount && !outOfStock && (
            <span
              className={`absolute top-3 left-3 z-10 ${theme.buttonBg} ${theme.buttonText} text-xs font-semibold px-2.5 py-1 rounded-full`}
            >
              %{discountPct} indirim
            </span>
          )}
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110 ${
                outOfStock ? "grayscale opacity-70" : ""
              }`}
            />
          ) : (
            <span className="text-neutral-400 flex items-center justify-center w-full h-full">Görsel yok</span>
          )}
        </div>

        <div className="animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={`text-xl font-semibold ${theme.accentText}`}>
              {formatMoney(product.price, storeRecord.currency)}
            </span>
            {hasDiscount && (
              <span className="text-neutral-400 line-through">
                {formatMoney(product.compareAtPrice!, storeRecord.currency)}
              </span>
            )}
          </div>
          <p className="mt-5 text-neutral-600 whitespace-pre-line">{product.description}</p>

          <p
            className={`mt-4 text-sm font-medium ${
              outOfStock ? "text-neutral-400" : lowStock ? "text-amber-600" : "text-neutral-500"
            }`}
          >
            {outOfStock
              ? "Stokta yok"
              : lowStock
                ? `Son ${product.inventory} adet kaldı!`
                : `Stokta ${product.inventory} adet var`}
          </p>

          <form action={action} className="mt-6 flex items-center gap-3">
            <QuantityStepper max={product.inventory} disabled={outOfStock} />
            <button
              type="submit"
              disabled={outOfStock}
              className={`${theme.buttonBg} ${theme.buttonText} px-6 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none`}
            >
              {outOfStock ? "Stokta yok" : "Sepete ekle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
