import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { getCartWithItems } from "@/lib/cart";
import { getTheme } from "@/lib/themes";

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
      <header className={`${theme.headerBg} ${theme.buttonText}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href={`/store/${store}`} className="text-lg font-bold">
            {storeRecord.name}
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href={`/store/${store}`} className="hover:underline">
              Ana Sayfa
            </Link>
            <Link href={`/store/${store}/products`} className="hover:underline">
              Ürünler
            </Link>
            <Link href={`/store/${store}/cart`} className="hover:underline">
              Sepet {itemCount > 0 && `(${itemCount})`}
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
