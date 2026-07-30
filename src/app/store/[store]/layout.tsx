import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { getCartWithItems } from "@/lib/cart";
import { getTheme } from "@/lib/themes";

// Underlined nav link with a hover underline that grows in from the left
// (a common "gelişmiş hover" pattern) — pure CSS, no JS needed.
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative py-1 group">
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const storeRecord = await getStoreBySubdomain(store);
  if (!storeRecord) notFound();

  const theme = getTheme(storeRecord.theme);
  const { items } = await getCartWithItems(storeRecord.id);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className={`flex-1 flex flex-col ${theme.bg}`}>
      <header className={`${theme.headerBg} ${theme.buttonText} sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href={`/store/${store}`}
            className="text-lg font-bold transition-opacity hover:opacity-80"
          >
            {storeRecord.name}
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink href={`/store/${store}`}>Ana Sayfa</NavLink>
            <NavLink href={`/store/${store}/products`}>Ürünler</NavLink>
            <Link
              href={`/store/${store}/cart`}
              className="relative flex items-center gap-1.5 py-1 hover:opacity-90 transition-opacity"
            >
              Sepet
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white text-neutral-900 text-xs font-semibold animate-[popIn_0.3s_ease-out_both]">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} {storeRecord.name} — oscarshouse ile oluşturuldu
      </footer>
    </div>
  );
}
