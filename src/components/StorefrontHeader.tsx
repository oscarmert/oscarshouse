import Link from "next/link";
import type { HeaderStyleId } from "@/lib/themes";

type Theme = {
  headerBg: string;
  buttonText: string;
  accentText: string;
};

function Logo({
  storeSlug,
  storeName,
  logoUrl,
  className,
}: {
  storeSlug: string;
  storeName: string;
  logoUrl?: string | null;
  className?: string;
}) {
  return (
    <Link
      href={`/store/${storeSlug}`}
      className={`font-bold transition-opacity hover:opacity-80 ${className ?? "text-lg"}`}
    >
      {logoUrl ? (
        // Store owner-uploaded logo (stored as a data URL — no object storage
        // configured for this project, so base64 is embedded directly).
        // Fixed-size box regardless of the uploaded image's own dimensions —
        // object-contain keeps the aspect ratio without stretching, so every
        // logo (square, wide, tall, tiny, huge) renders at the same standard
        // size. Responsive: scales up on larger viewports (e.g. a big 27"
        // monitor) instead of staying pinned to a small mobile-sized box.
        <span className="inline-flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 overflow-hidden align-middle shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={storeName} className="max-h-full max-w-full object-contain" />
        </span>
      ) : (
        storeName
      )}
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative py-1 group">
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function CartLink({ storeSlug, itemCount }: { storeSlug: string; itemCount: number }) {
  return (
    <Link
      href={`/store/${storeSlug}/cart`}
      className="relative flex items-center gap-1.5 py-1 hover:opacity-90 transition-opacity"
    >
      Sepet
      {itemCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white text-neutral-900 text-xs font-semibold animate-[popIn_0.3s_ease-out_both]">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

function CartIcon({ storeSlug, itemCount }: { storeSlug: string; itemCount: number }) {
  return (
    <Link
      href={`/store/${storeSlug}/cart`}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10"
      aria-label="Sepet"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-white text-neutral-900 text-[10px] font-semibold animate-[popIn_0.3s_ease-out_both]">
          {itemCount}
        </span>
      )}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchForm({ storeSlug, compact }: { storeSlug: string; compact?: boolean }) {
  return (
    <form
      action={`/store/${storeSlug}/products`}
      method="get"
      className={`flex items-center bg-white/95 text-neutral-900 rounded-full overflow-hidden ${
        compact ? "w-full max-w-xs" : "w-full max-w-md"
      }`}
    >
      <span className="pl-3 text-neutral-400">
        <SearchIcon />
      </span>
      <input
        type="text"
        name="q"
        placeholder="Ürün ara..."
        className="w-full px-2.5 py-2 text-sm bg-transparent focus:outline-none"
      />
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
      >
        Ara
      </button>
    </form>
  );
}

export function StorefrontHeader({
  storeSlug,
  storeName,
  logoUrl,
  headerStyle,
  theme,
  itemCount,
}: {
  storeSlug: string;
  storeName: string;
  logoUrl?: string | null;
  headerStyle: HeaderStyleId | string;
  theme: Theme;
  itemCount: number;
}) {
  const wrapperClass = `${theme.headerBg} ${theme.buttonText} sticky top-0 z-40 shadow-sm`;

  if (headerStyle === "centered") {
    return (
      <header className={wrapperClass}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 px-6 py-4">
          <Logo storeSlug={storeSlug} storeName={storeName} logoUrl={logoUrl} className="text-xl" />
          <nav className="flex items-center gap-6 text-sm">
            <NavLink href={`/store/${storeSlug}`}>Ana Sayfa</NavLink>
            <NavLink href={`/store/${storeSlug}/products`}>Ürünler</NavLink>
            <CartLink storeSlug={storeSlug} itemCount={itemCount} />
          </nav>
        </div>
      </header>
    );
  }

  if (headerStyle === "announcement") {
    return (
      <header className={wrapperClass}>
        <div className="bg-black/15 text-center text-xs py-1.5 px-4 tracking-wide">
          🚚 500 TL üzeri siparişlerde kargo ücretsiz — bugün sipariş ver, hemen kargolansın!
        </div>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo storeSlug={storeSlug} storeName={storeName} logoUrl={logoUrl} />
          <nav className="flex items-center gap-6 text-sm">
            <NavLink href={`/store/${storeSlug}`}>Ana Sayfa</NavLink>
            <NavLink href={`/store/${storeSlug}/products`}>Ürünler</NavLink>
            <CartLink storeSlug={storeSlug} itemCount={itemCount} />
          </nav>
        </div>
      </header>
    );
  }

  if (headerStyle === "minimal") {
    return (
      <header className={wrapperClass}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo storeSlug={storeSlug} storeName={storeName} logoUrl={logoUrl} />
          <div className="flex items-center gap-1">
            <Link
              href={`/store/${storeSlug}/products`}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/10"
              aria-label="Ürünler"
            >
              <SearchIcon />
            </Link>
            <CartIcon storeSlug={storeSlug} itemCount={itemCount} />
          </div>
        </div>
      </header>
    );
  }

  if (headerStyle === "search") {
    return (
      <header className={wrapperClass}>
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-6 py-4">
          <Logo storeSlug={storeSlug} storeName={storeName} logoUrl={logoUrl} className="text-lg shrink-0" />
          <div className="flex-1 flex justify-center">
            <SearchForm storeSlug={storeSlug} />
          </div>
          <nav className="flex items-center gap-4 text-sm shrink-0">
            <NavLink href={`/store/${storeSlug}/products`}>Ürünler</NavLink>
            <CartIcon storeSlug={storeSlug} itemCount={itemCount} />
          </nav>
        </div>
      </header>
    );
  }

  // classic (default / fallback for unknown ids)
  return (
    <header className={wrapperClass}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Logo storeSlug={storeSlug} storeName={storeName} logoUrl={logoUrl} />
        <nav className="flex items-center gap-6 text-sm">
          <NavLink href={`/store/${storeSlug}`}>Ana Sayfa</NavLink>
          <NavLink href={`/store/${storeSlug}/products`}>Ürünler</NavLink>
          <CartLink storeSlug={storeSlug} itemCount={itemCount} />
        </nav>
      </div>
    </header>
  );
}
