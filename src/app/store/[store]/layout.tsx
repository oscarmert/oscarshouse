import { notFound } from "next/navigation";
import { getStoreBySubdomain } from "@/lib/store";
import { getCartWithItems } from "@/lib/cart";
import { getTheme } from "@/lib/themes";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { FloatingCartButton } from "@/components/FloatingCartButton";

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
      <StorefrontHeader
        storeSlug={store}
        storeName={storeRecord.name}
        logoUrl={storeRecord.logoUrl}
        headerStyle={storeRecord.headerStyle}
        theme={theme}
        itemCount={itemCount}
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} {storeRecord.name} — oscarshouse ile oluşturuldu
      </footer>
      <FloatingCartButton
        storeSlug={store}
        itemCount={itemCount}
        buttonBg={theme.buttonBg}
        buttonText={theme.buttonText}
      />
    </div>
  );
}
