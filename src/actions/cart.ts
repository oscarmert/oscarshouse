"use server";

import { addItemToCart, updateCartItemQuantity, getOrCreateCartId } from "@/lib/cart";
import { getStoreBySubdomain } from "@/lib/store";
import { revalidatePath } from "next/cache";

export async function addToCartAction(subdomain: string, productId: string, formData: FormData) {
  const store = await getStoreBySubdomain(subdomain);
  if (!store) throw new Error("Mağaza bulunamadı");
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
  await addItemToCart(store.id, productId, quantity);
  revalidatePath(`/store/${subdomain}/cart`);
  revalidatePath(`/store/${subdomain}`);
}

export async function updateCartItemAction(subdomain: string, itemId: string, quantity: number) {
  await updateCartItemQuantity(itemId, quantity);
  revalidatePath(`/store/${subdomain}/cart`);
}

export async function ensureCartAction(subdomain: string) {
  const store = await getStoreBySubdomain(subdomain);
  if (!store) throw new Error("Mağaza bulunamadı");
  return getOrCreateCartId(store.id);
}
