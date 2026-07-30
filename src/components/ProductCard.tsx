import Link from "next/link";
import { formatMoney } from "@/lib/store";
import { getTheme } from "@/lib/themes";

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
    slug: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
  };
}) {
  const t = getTheme(theme);
  return (
    <Link
      href={`/store/${storeSlug}/products/${product.slug}`}
      className="group block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-neutral-400 text-sm">Görsel yok</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-neutral-900 line-clamp-1">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className={`font-semibold ${t.accentText}`}>{formatMoney(product.price, currency)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-neutral-400 text-sm line-through">
              {formatMoney(product.compareAtPrice, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
