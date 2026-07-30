import { NextRequest, NextResponse } from "next/server";

// Root domains that should NOT be treated as a store subdomain.
// Add your platform's real domain(s) here when you deploy
// (e.g. "myplatform.com").
const ROOT_DOMAINS = ["localhost", "127.0.0.1"];

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "app",
  "store",
  "dashboard",
]);

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // Detect "<subdomain>.<root-domain>" shape, e.g. "demo.localhost" or
  // "demo.myplatform.com". Anything with >= 2 labels where the base domain
  // is one of our root domains counts as a tenant subdomain.
  let subdomain: string | null = null;
  if (parts.length >= 2) {
    const base = parts.slice(1).join(".");
    if (ROOT_DOMAINS.includes(base) && !RESERVED_SUBDOMAINS.has(parts[0])) {
      subdomain = parts[0];
    }
  }

  if (subdomain) {
    const url = req.nextUrl.clone();
    // Only rewrite storefront-facing paths; let /api and /_next pass through.
    if (!url.pathname.startsWith("/store/")) {
      url.pathname = `/store/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
