import Link from "next/link";

// Persistent floating cart shortcut, bottom-right of the viewport, shown only
// once the cart has at least one item in it. Rendered from the storefront
// layout so it follows the customer across every page of the store.
export function FloatingCartButton({
  storeSlug,
  itemCount,
  buttonBg,
  buttonText,
}: {
  storeSlug: string;
  itemCount: number;
  buttonBg: string;
  buttonText: string;
}) {
  if (itemCount <= 0) return null;

  return (
    <Link
      href={`/store/${storeSlug}/cart`}
      aria-label={`Sepete git — ${itemCount} ürün`}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 animate-[popIn_0.35s_ease-out_both] ${buttonBg} ${buttonText}`}
    >
      <span className="relative flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-neutral-900 text-[10px] font-semibold">
          {itemCount}
        </span>
      </span>
      <span className="text-sm font-medium">Sepetim</span>
    </Link>
  );
}
