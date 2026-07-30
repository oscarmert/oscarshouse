import Link from "next/link";
import { formatMoney } from "@/lib/store";
import { getTheme } from "@/lib/themes";
import { addToCartAction } from "@/actions/cart";

export function ProductCard({
  storeSlug,
  theme,
  product,
  currency,
}: {
  storeSlug: string;
  theme: string;
  currency: string;
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    inventory: number;
  };
}) {
  const t = getTheme(theme);
  const outOfStock = product.inventory <= 0;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;
  const quickAdd = addToCartAction.bind(null, storeSlug, product.id);

  return (
    <div className="group relative bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-neutral-300">
      <Link href={`/store/${storeSlug}/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-neutral-100 overflow-hidden">
          {hasDiscount && !outOfStock && (
            <span
              className={`absolute top-2 left-2 z-10 ${t.buttonBg} ${t.buttonText} text-xs font-semibold px-2 py-1 rounded-full animate-[popIn_0.4s_ease-out_both]`}
            >
              %{discountPct} indirim
            </span>
          )}
          {outOfStock && (
            <span className="absolute top-2 left-2 z-10 bg-neutral-900/85 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Tükendi
            </span>
          )}
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${
                outOfStock ? "grayscale opacity-70" : ""
              }`}
            />
          ) : (
            <span className="text-neutral-400 text-sm flex items-center justify-center w-full h-full">
              Görsel yok
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-neutral-900 line-clamp-1">{product.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={`font-semibold ${t.accentText}`}>{formatMoney(product.price, currency)}</span>
            {hasDiscount && (
              <span className="text-neutral-400 text-sm line-through">
                {formatMoney(product.compareAtPrice!, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Hover reveal: smooth height/opacity transition via CSS grid-rows,
          no JS needed. Sits as a sibling of the Link (not nested inside
          it) so the button stays a valid, independently-clickable
          interactive element instead of an <a> containing a <form>. */}
      {!outOfStock && (
        <form
          action={quickAdd}
          className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-0 group-hover:opacity-100 transition-all duration-300 px-4"
        >
          <input type="hidden" name="quantity" value={1} />
          <div className="overflow-hidden">
            <button
              type="submit"
              className={`w-full mb-4 ${t.buttonBg} ${t.buttonText} text-sm font-medium py-2 rounded-lg transition-transform active:scale-95`}
            >
              Hızlı sepete ekle
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
