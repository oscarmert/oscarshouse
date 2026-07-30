"use server";

import { z } from "zod";
import { db } from "@/db";
import { users, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId, slugify } from "@/lib/id";
import {
  createPlatformSession,
  clearPlatformSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { RESERVED_SUBDOMAINS } from "@/lib/store";
import { redirect } from "next/navigation";

const signupSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  storeName: z.string().min(2, "Mağaza adı en az 2 karakter olmalı"),
  subdomain: z
    .string()
    .min(3, "Alt alan adı en az 3 karakter olmalı")
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanılabilir"),
  currency: z.string().default("TRY"),
  language: z.string().default("tr"),
});

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    storeName: formData.get("storeName"),
    subdomain: formData.get("subdomain"),
    currency: formData.get("currency") || "TRY",
    language: formData.get("language") || "tr",
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, email, password, storeName, subdomain, currency, language } = parsed.data;

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return { fieldErrors: { subdomain: "Bu alt alan adı ayrılmış, başka bir tane deneyin" } };
  }

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    return { fieldErrors: { email: "Bu e-posta zaten kayıtlı" } };
  }

  const [existingStore] = await db
    .select()
    .from(stores)
    .where(eq(stores.subdomain, subdomain))
    .limit(1);
  if (existingStore) {
    return { fieldErrors: { subdomain: "Bu alt alan adı zaten kullanılıyor" } };
  }

  const userId = createId("user");
  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ id: userId, name, email, passwordHash, role: "STORE_OWNER" });

  const storeId = createId("store");
  await db.insert(stores).values({
    id: storeId,
    ownerId: userId,
    name: storeName,
    subdomain,
    currency,
    language,
  });

  await createPlatformSession(userId, "STORE_OWNER");
  redirect(`/admin/${subdomain}`);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Geçersiz giriş" };

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "E-posta veya şifre hatalı" };
  }

  await createPlatformSession(user.id, user.role);

  const [store] = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1);
  redirect(store ? `/admin/${store.subdomain}` : "/dashboard");
}

export async function logoutAction() {
  await clearPlatformSession();
  redirect("/login");
}

export async function createStoreAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { getPlatformSession } = await import("@/lib/auth");
  const session = await getPlatformSession();
  if (!session) redirect("/login");

  const name = String(formData.get("storeName") || "").trim();
  const subdomainRaw = String(formData.get("subdomain") || "").trim();
  const subdomain = slugify(subdomainRaw);

  if (name.length < 2) return { fieldErrors: { storeName: "Mağaza adı en az 2 karakter olmalı" } };
  if (subdomain.length < 3) return { fieldErrors: { subdomain: "Alt alan adı en az 3 karakter olmalı" } };
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return { fieldErrors: { subdomain: "Bu alt alan adı ayrılmış" } };
  }

  const [existingStore] = await db.select().from(stores).where(eq(stores.subdomain, subdomain)).limit(1);
  if (existingStore) return { fieldErrors: { subdomain: "Bu alt alan adı zaten kullanılıyor" } };

  const storeId = createId("store");
  await db.insert(stores).values({
    id: storeId,
    // biome-ignore lint: session is platform session here
    ownerId: (session as { userId: string }).userId,
    name,
    subdomain,
  });

  redirect(`/admin/${subdomain}`);
}
