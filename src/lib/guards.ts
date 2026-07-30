import { redirect, notFound } from "next/navigation";
import { getPlatformSession } from "@/lib/auth";
import { getStoreBySubdomain } from "@/lib/store";

export async function requireOwnedStore(subdomain: string) {
  const session = await getPlatformSession();
  if (!session || session.kind !== "platform") redirect("/login");

  const store = await getStoreBySubdomain(subdomain);
  if (!store) notFound();

  if (store.ownerId !== session.userId) {
    redirect("/dashboard");
  }

  return { store, session };
}
