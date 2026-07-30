import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const secretKey = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

export type PlatformSessionPayload = {
  kind: "platform";
  userId: string;
  role: "PLATFORM_ADMIN" | "STORE_OWNER";
};

export type CustomerSessionPayload = {
  kind: "customer";
  customerId: string;
  storeId: string;
};

export type SessionPayload = PlatformSessionPayload | CustomerSessionPayload;

const PLATFORM_COOKIE = "platform_session";
const customerCookieName = (storeId: string) => `customer_session_${storeId}`;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

async function decrypt<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as T;
  } catch {
    return null;
  }
}

// ---- Platform (store owner / admin) session ----

export async function createPlatformSession(userId: string, role: "PLATFORM_ADMIN" | "STORE_OWNER") {
  const token = await encrypt({ kind: "platform", userId, role });
  const store = await cookies();
  store.set(PLATFORM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getPlatformSession() {
  const store = await cookies();
  return decrypt<PlatformSessionPayload>(store.get(PLATFORM_COOKIE)?.value);
}

export async function clearPlatformSession() {
  const store = await cookies();
  store.delete(PLATFORM_COOKIE);
}

// ---- Customer (storefront) session, scoped per store ----

export async function createCustomerSession(customerId: string, storeId: string) {
  const token = await encrypt({ kind: "customer", customerId, storeId });
  const store = await cookies();
  store.set(customerCookieName(storeId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCustomerSession(storeId: string) {
  const store = await cookies();
  return decrypt<CustomerSessionPayload>(store.get(customerCookieName(storeId))?.value);
}

export async function clearCustomerSession(storeId: string) {
  const store = await cookies();
  store.delete(customerCookieName(storeId));
}
