"use server";

import { db } from "@/db";
import { discounts, stores } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createId } from "@/lib/id";
import { getPlatformSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireStoreOwner(subdomain: string) {
  const session = await getPlatformSession();
  if (!session) redirect("/login");
  const [store] = await db.select().from(stores).where(eq(stores.subdomain, subdomain)).limit(1);
  if (!store) redirect("/dashboard");
  if (store.ownerId !== (session as { userId: string }).userId) {
    throw new Error("Bu mağazaya erişim yetkiniz yok");
  }
  return store;
}

export type DiscountFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

export async function createDiscountAction(
  subdomain: string,
  _prev: DiscountFormState,
  formData: FormData
): Promise<DiscountFormState> {
  const store = await requireStoreOwner(subdomain);

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const type = formData.get("type") === "FIXED" ? "FIXED" : "PERCENTAGE";
  const value = Number(formData.get("value"));

  if (code.length < 2) return { fieldErrors: { code: "Kod en az 2 karakter olmalı" } };
  if (!Number.isFinite(value) || value <= 0) {
    return { fieldErrors: { value: "Geçerli bir değer girin" } };
  }
  if (type === "PERCENTAGE" && value > 100) {
    return { fieldErrors: { value: "Yüzde indirim 100'den büyük olamaz" } };
  }

  const [clash] = await db
    .select()
    .from(discounts)
    .where(and(eq(discounts.storeId, store.id), eq(discounts.code, code)))
    .limit(1);
  if (clash) return { fieldErrors: { code: "Bu kod zaten kullanılıyor" } };

  await db.insert(discounts).values({
    id: createId("disc"),
    storeId: store.id,
    code,
    type,
    value,
    active: true,
  });

  revalidatePath(`/admin/${subdomain}/discounts`);
  return {};
}

export async function toggleDiscountActiveAction(subdomain: string, discountId: string, active: boolean) {
  const store = await requireStoreOwner(subdomain);
  await db
    .update(discounts)
    .set({ active })
    .where(and(eq(discounts.id, discountId), eq(discounts.storeId, store.id)));
  revalidatePath(`/admin/${subdomain}/discounts`);
}

export async function deleteDiscountAction(subdomain: string, discountId: string) {
  const store = await requireStoreOwner(subdomain);
  await db.delete(discounts).where(and(eq(discounts.id, discountId), eq(discounts.storeId, store.id)));
  revalidatePath(`/admin/${subdomain}/discounts`);
}
