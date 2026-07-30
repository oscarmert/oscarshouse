import { notFound } from "next/navigation";
import { getStoreBySubdomain, formatMoney } from "@/lib/store";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { addToCartAction } from "@/actions/cart";
import { getTheme } from "@/lib/themes";

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid sm:grid-cols-2 gap-10">
      <div className="aspect-square bg-neutral-100 rounded-xl flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-400">Görsel yok</span>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className={`text-xl font-semibold ${theme.accentText}`}>
            {formatMoney(product.price, storeRecord.currency)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-neutral-400 line-through">
              {formatMoney(product.compareAtPrice, storeRecord.currency)}
            </span>
          )}
        </div>
        <p className="mt-5 text-neutral-600 whitespace-pre-line">{product.description}</p>

        <p className="mt-4 text-sm text-neutral-500">
          {outOfStock ? "Stokta yok" : `Stokta ${product.inventory} adet var`}
        </p>

        <form action={action} className="mt-6 flex items-center gap-3">
          <input
            type="number"
            name="quantity"
            defaultValue={1}
            min={1}
            max={Math.max(1, product.inventory)}
            className="w-20 rounded-lg border border-neutral-300 px-3 py-2"
            disabled={outOfStock}
          />
          <button
            type="submit"
            disabled={outOfStock}
            className={`${theme.buttonBg} ${theme.buttonText} px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {outOfStock ? "Stokta yok" : "Sepete ekle"}
          </button>
        </form>
      </div>
    </div>
  );
}
