"use server";

import { z } from "zod";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@/lib/id";
import { getStoreBySubdomain } from "@/lib/store";
import { getOrCreateCartWithItems, clearCart } from "@/lib/cart";
import { redirect } from "next/navigation";

export type CheckoutState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

const checkoutSchema = z.object({
  name: z.string().min(2, "Ad soyad girin"),
  email: z.string().email("Geçerli bir e-posta girin"),
  line1: z.string().min(3, "Adres girin"),
  city: z.string().min(2, "Şehir girin"),
  postalCode: z.string().min(3, "Posta kodu girin"),
  country: z.string().min(2, "Ülke girin"),
});

export async function checkoutAction(
  subdomain: string,
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    line1: formData.get("line1"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const store = await getStoreBySubdomain(subdomain);
  if (!store) return { error: "Mağaza bulunamadı" };

  const { cartId, items, subtotal } = await getOrCreateCartWithItems(store.id);
  if (items.length === 0) {
    return { error: "Sepetiniz boş" };
  }

  // Simulated payment: in production this is where you'd integrate a real
  // gateway (Stripe, iyzico, PayTR, ...). We mark the order as PAID directly.
  const orderId = createId("order");
  await db.insert(orders).values({
    id: orderId,
    storeId: store.id,
    customerEmail: parsed.data.email,
    customerName: parsed.data.name,
    shippingAddress: JSON.stringify({
      line1: parsed.data.line1,
      city: parsed.data.city,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
    }),
    status: "PAID",
    subtotal,
    discountTotal: 0,
    total: subtotal,
    currency: store.currency,
  });

  for (const item of items) {
    await db.insert(orderItems).values({
      id: createId("oitem"),
      orderId,
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      price: item.priceAtAdd,
    });
    // Decrement inventory (never below 0).
    const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
    if (product) {
      const newInventory = Math.max(0, product.inventory - item.quantity);
      await db.update(products).set({ inventory: newInventory }).where(eq(products.id, product.id));
    }
  }

  await clearCart(cartId);

  redirect(`/store/${subdomain}/checkout/success?order=${orderId}`);
}
