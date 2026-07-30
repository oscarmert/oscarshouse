import { cookies } from "next/headers";
import { db } from "@/db";
import { carts, cartItems, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createId } from "@/lib/id";

const cartCookieName = (storeId: string) => `cart_${storeId}`;

// Reads the cart id cookie without writing anything. Safe to call during a
// normal page render (Server Components can't set cookies outside of a
// Server Action / Route Handler).
async function getCartIdReadOnly(storeId: string) {
  const store = await cookies();
  const existing = store.get(cartCookieName(storeId))?.value;
  if (!existing) return null;
  const [found] = await db.select().from(carts).where(eq(carts.id, existing)).limit(1);
  return found?.id ?? null;
}

// Reads the cart id cookie, creating a new cart + cookie if none exists yet.
// Only call this from Server Actions or Route Handlers.
export async function getOrCreateCartId(storeId: string) {
  const store = await cookies();
  const existing = store.get(cartCookieName(storeId))?.value;
  if (existing) {
    const [found] = await db.select().from(carts).where(eq(carts.id, existing)).limit(1);
    if (found) return found.id;
  }
  const id = createId("cart");
  await db.insert(carts).values({ id, storeId });
  store.set(cartCookieName(storeId), id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

async function loadCartItems(cartId: string | null) {
  if (!cartId) return { items: [], subtotal: 0 };
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      priceAtAdd: cartItems.priceAtAdd,
      title: products.title,
      imageUrl: products.imageUrl,
      slug: products.slug,
      inventory: products.inventory,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  const subtotal = items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
  return { items, subtotal };
}

// For rendering (Server Components): read-only, never creates a cart or
// writes a cookie. An empty cart is returned when nothing exists yet.
export async function getCartWithItems(storeId: string) {
  const cartId = await getCartIdReadOnly(storeId);
  const { items, subtotal } = await loadCartItems(cartId);
  return { cartId, items, subtotal };
}

// For Server Actions (e.g. checkout): ensures a cart exists.
export async function getOrCreateCartWithItems(storeId: string) {
  const cartId = await getOrCreateCartId(storeId);
  const { items, subtotal } = await loadCartItems(cartId);
  return { cartId, items, subtotal };
}

export async function addItemToCart(storeId: string, productId: string, quantity: number) {
  const cartId = await getOrCreateCartId(storeId);
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || product.storeId !== storeId) throw new Error("Ürün bulunamadı");

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      id: createId("citem"),
      cartId,
      productId,
      quantity,
      priceAtAdd: product.price,
    });
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }
}

export async function clearCart(cartId: string) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
