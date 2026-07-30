"use server";

import { db } from "@/db";
import { products, categories, stores } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createId, slugify, randomSuffix } from "@/lib/id";
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

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function createProductAction(
  subdomain: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const store = await requireStoreOwner(subdomain);

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price"));
  const compareAtPriceRaw = formData.get("compareAtPrice");
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const inventory = Number(formData.get("inventory") || 0);
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const categoryId = String(formData.get("categoryId") || "") || null;
  const status = formData.get("status") === "DRAFT" ? "DRAFT" : "ACTIVE";

  if (title.length < 2) return { fieldErrors: { title: "Ürün adı en az 2 karakter olmalı" } };
  if (!Number.isFinite(price) || price < 0) return { fieldErrors: { price: "Geçerli bir fiyat girin" } };

  let slug = slugify(title);
  const [clash] = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, store.id), eq(products.slug, slug)))
    .limit(1);
  if (clash) slug = `${slug}-${randomSuffix()}`;

  await db.insert(products).values({
    id: createId("prod"),
    storeId: store.id,
    categoryId,
    title,
    slug,
    description,
    price,
    compareAtPrice,
    imageUrl,
    inventory,
    status,
  });

  revalidatePath(`/admin/${subdomain}/products`);
  redirect(`/admin/${subdomain}/products`);
}

export async function updateProductAction(
  subdomain: string,
  productId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const store = await requireStoreOwner(subdomain);

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price"));
  const compareAtPriceRaw = formData.get("compareAtPrice");
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;
  const inventory = Number(formData.get("inventory") || 0);
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const categoryId = String(formData.get("categoryId") || "") || null;
  const status = formData.get("status") === "DRAFT" ? "DRAFT" : "ACTIVE";

  if (title.length < 2) return { fieldErrors: { title: "Ürün adı en az 2 karakter olmalı" } };

  await db
    .update(products)
    .set({ title, description, price, compareAtPrice, inventory, imageUrl, categoryId, status })
    .where(and(eq(products.id, productId), eq(products.storeId, store.id)));

  revalidatePath(`/admin/${subdomain}/products`);
  redirect(`/admin/${subdomain}/products`);
}

export async function deleteProductAction(subdomain: string, productId: string) {
  const store = await requireStoreOwner(subdomain);
  await db.delete(products).where(and(eq(products.id, productId), eq(products.storeId, store.id)));
  revalidatePath(`/admin/${subdomain}/products`);
}

export async function createCategoryAction(
  subdomain: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const store = await requireStoreOwner(subdomain);
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return { fieldErrors: { name: "Kategori adı en az 2 karakter olmalı" } };

  let slug = slugify(name);
  const [clash] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.storeId, store.id), eq(categories.slug, slug)))
    .limit(1);
  if (clash) slug = `${slug}-${randomSuffix()}`;

  await db.insert(categories).values({ id: createId("cat"), storeId: store.id, name, slug });
  revalidatePath(`/admin/${subdomain}/categories`);
}

export async function deleteCategoryAction(subdomain: string, categoryId: string) {
  const store = await requireStoreOwner(subdomain);
  await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.storeId, store.id)));
  revalidatePath(`/admin/${subdomain}/categories`);
}

export async function updateStoreSettingsAction(
  subdomain: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const store = await requireStoreOwner(subdomain);
  const name = String(formData.get("name") || "").trim();
  const theme = String(formData.get("theme") || "classic");
  const currency = String(formData.get("currency") || "TRY");
  const language = String(formData.get("language") || "tr");

  if (name.length < 2) return { fieldErrors: { name: "Mağaza adı en az 2 karakter olmalı" } };

  await db
    .update(stores)
    .set({ name, theme, currency, language })
    .where(eq(stores.id, store.id));

  revalidatePath(`/admin/${subdomain}/settings`);
  revalidatePath(`/store/${subdomain}`);
  return {};
}
