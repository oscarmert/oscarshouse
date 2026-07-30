import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlatformSession } from "@/lib/auth";
import { logoutAction } from "@/actions/platform";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateStoreForm } from "@/components/forms/CreateStoreForm";

export default async function DashboardPage() {
  const session = await getPlatformSession();
  if (!session) redirect("/login");

  const myStores = await db
    .select()
    .from(stores)
    .where(eq(stores.ownerId, (session as { userId: string }).userId));

  return (
    <main className="flex-1 bg-neutral-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Mağazalarım</h1>
          <form action={logoutAction}>
            <button className="text-sm text-neutral-500 hover:underline">Çıkış yap</button>
          </form>
        </div>

        <div className="space-y-3 mb-10">
          {myStores.length === 0 && (
            <p className="text-neutral-500">Henüz bir mağazanız yok, aşağıdan oluşturun.</p>
          )}
          {myStores.map((store) => (
            <div
              key={store.id}
              className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-5 py-4"
            >
              <div>
                <p className="font-semibold">{store.name}</p>
                <p className="text-sm text-neutral-500">{store.subdomain}.shopkurucu.com</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/store/${store.subdomain}`} className="text-neutral-500 hover:underline">
                  Mağazayı gör
                </Link>
                <Link
                  href={`/admin/${store.subdomain}`}
                  className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg hover:bg-neutral-800"
                >
                  Yönet
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="font-semibold mb-3">Yeni mağaza aç</h2>
          <CreateStoreForm />
        </div>
      </div>
    </main>
  );
}
