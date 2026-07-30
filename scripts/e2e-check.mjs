import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const shotDir = "/tmp/shots";
fs.mkdirSync(shotDir, { recursive: true });

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"} - ${name}${detail ? " :: " + detail : ""}`);
}

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});

// 1. Landing page
await page.goto(BASE + "/");
check("Landing page loads", await page.locator("text=ShopKurucu").first().isVisible());
await page.screenshot({ path: `${shotDir}/01-landing.png` });

// 2. Demo storefront home
await page.goto(BASE + "/store/demo");
check("Storefront home loads", await page.locator("text=Demo Mağaza").first().isVisible());
await page.screenshot({ path: `${shotDir}/02-storefront-home.png`, fullPage: true });

// 3. Products listing
await page.goto(BASE + "/store/demo/products");
const productCount = await page.locator("a[href*='/products/']").count();
check("Products listing shows products", productCount >= 5, `count=${productCount}`);
await page.screenshot({ path: `${shotDir}/03-products.png`, fullPage: true });

// 4. Product detail + add to cart
await page.locator("a[href*='/products/']").first().click();
await page.waitForLoadState("networkidle");
check("Product detail loads", await page.locator("button:has-text('Sepete ekle')").isVisible());
await page.screenshot({ path: `${shotDir}/04-product-detail.png` });
await page.locator("button:has-text('Sepete ekle')").click();
await page.waitForLoadState("networkidle");
await page.waitForTimeout(500);

// 5. Cart page
await page.goto(BASE + "/store/demo/cart");
await page.waitForLoadState("networkidle");
const cartHasItem = await page.locator("text=Ödemeye geç").isVisible().catch(() => false);
check("Cart shows item after add-to-cart", cartHasItem);
await page.screenshot({ path: `${shotDir}/05-cart.png`, fullPage: true });

// 6. Checkout
if (cartHasItem) {
  await page.locator("text=Ödemeye geç").click();
  await page.waitForLoadState("networkidle");
  await page.fill("input[name=name]", "Test Müşteri");
  await page.fill("input[name=email]", "test@example.com");
  await page.fill("input[name=line1]", "Test mah. Test sok. No:1");
  await page.fill("input[name=city]", "İstanbul");
  await page.fill("input[name=postalCode]", "34000");
  await page.screenshot({ path: `${shotDir}/06-checkout-form.png`, fullPage: true });
  await page.locator("button:has-text('Siparişi tamamla')").click();
  await page.waitForURL(/checkout\/success/, { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
  const orderSuccess = await page.locator("text=Siparişiniz alındı").isVisible().catch(() => false);
  check("Checkout completes successfully", orderSuccess, page.url());
  await page.screenshot({ path: `${shotDir}/07-checkout-success.png`, fullPage: true });
}

// 7. Admin login
await page.goto(BASE + "/login");
await page.fill("input[name=email]", "demo@shopkurucu.com");
await page.fill("input[name=password]", "demo1234");
await page.screenshot({ path: `${shotDir}/08-login.png` });
await page.locator("button:has-text('Giriş yap')").click();
await page.waitForLoadState("networkidle");
check("Login redirects to admin", page.url().includes("/admin/demo"), page.url());
await page.screenshot({ path: `${shotDir}/09-admin-overview.png`, fullPage: true });

// 8. Admin: create a new product
const uniqueTitle = `E2E Test Ürünü ${Date.now()}`;
await page.goto(BASE + "/admin/demo/products/new");
await page.fill("input[name=title]", uniqueTitle);
await page.fill("textarea[name=description]", "Otomatik test ile eklendi.");
await page.fill("input[name=price]", "199.90");
await page.fill("input[name=inventory]", "10");
await page.screenshot({ path: `${shotDir}/10-new-product-form.png`, fullPage: true });
await page.locator("button:has-text('Ürünü oluştur')").click();
await page.waitForLoadState("networkidle");
const productListed = (await page.locator(`text=${uniqueTitle}`).count()) > 0;
check("New product appears in admin product list", productListed, page.url());
await page.screenshot({ path: `${shotDir}/11-products-list-after-create.png`, fullPage: true });

// 9. Admin: orders list shows the order we just placed
await page.goto(BASE + "/admin/demo/orders");
await page.waitForLoadState("networkidle");
const orderListed = (await page.locator("text=Test Müşteri").count()) > 0;
check("Order from checkout appears in admin orders list", orderListed);
await page.screenshot({ path: `${shotDir}/12-orders-list.png`, fullPage: true });

// 10. Admin settings page loads (theme/currency/language)
await page.goto(BASE + "/admin/demo/settings");
await page.waitForLoadState("networkidle");
check("Settings page loads", await page.locator("text=Mağaza ayarları").isVisible());
await page.screenshot({ path: `${shotDir}/13-settings.png`, fullPage: true });

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED CHECKS:", JSON.stringify(failed, null, 2));
  process.exit(1);
}
