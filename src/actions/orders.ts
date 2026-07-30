"use server";

import { db } from "@/db";
import { orders, stores } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getPlatformSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateOrderStatusAction(
  subdomain: string,
  orderId: string,
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED"
) {
  const session = await getPlatformSession();
  if (!session) redirect("/login");

  const [store] = await db.select().from(stores).where(eq(stores.subdomain, subdomain)).limit(1);
  if (!store || store.ownerId !== (session as { userId: string }).userId) {
    throw new Error("Yetkiniz yok");
  }

  await db
    .update(orders)
    .set({ status })
    .where(and(eq(orders.id, orderId), eq(orders.storeId, store.id)));

  revalidatePath(`/admin/${subdomain}/orders`);
  revalidatePath(`/admin/${subdomain}/orders/${orderId}`);
}
