import Link from "next/link";
import { requireOwnedStore } from "@/lib/guards";
import { logoutAction } from "@/actions/platform";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  const { store: storeRecord } = await requireOwnedStore(store);

  const navItems = [
    { href: `/admin/${store}`, label: "Genel Bakış" },
    { href: `/admin/${store}/products`, label: "Ürünler" },
    { href: `/admin/${store}/categories`, label: "Kategoriler" },
    { href: `/admin/${store}/orders`, label: "Siparişler" },
    { href: `/admin/${store}/customers`, label: "Müşteriler" },
    { href: `/admin/${store}/discounts`, label: "İndirim Kodları" },
    { href: `/admin/${store}/settings`, label: "Ayarlar" },
  ];

  return (
    <div className="flex-1 flex bg-neutral-50">
      <aside className="w-60 shrink-0 bg-neutral-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-neutral-800">
          <p className="font-bold truncate">{storeRecord.name}</p>
          <p className="text-xs text-neutral-400 truncate">{storeRecord.subdomain}.oscarshouse.com</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm hover:bg-neutral-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-800 space-y-1">
          <Link
            href={`/store/${store}`}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-neutral-800"
          >
            Mağazayı görüntüle ↗
          </Link>
          <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm hover:bg-neutral-800">
            ← Tüm mağazalar
          </Link>
          <form action={logoutAction}>
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-800 text-neutral-400">
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
