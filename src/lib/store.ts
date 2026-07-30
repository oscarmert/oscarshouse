import "server-only";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

// Resolve a store by its subdomain/slug. Cached per-request so multiple
// server components/actions on the same request page don't hit the DB twice.
export const getStoreBySubdomain = cache(async (subdomain: string) => {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.subdomain, subdomain))
    .limit(1);
  return store ?? null;
});

export const getStoreById = cache(async (id: string) => {
  const [store] = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return store ?? null;
});

// Re-exported for convenience so existing server-side imports of
// `formatMoney` from "@/lib/store" keep working. Client Components must
// import from "@/lib/format" directly (this file pulls in the DB client).
export { formatMoney } from "@/lib/format";

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "app",
  "store",
  "dashboard",
  "login",
  "signup",
  "static",
  "assets",
]);
