import { db } from "./index";
import { users, stores, categories, products } from "./schema";
import { createId } from "../lib/id";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  const email = "demo@shopkurucu.com";
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    console.log("Demo verisi zaten mevcut, atlanıyor. (demo@shopkurucu.com / demo1234)");
    return;
  }

  const userId = createId("user");
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash: await bcrypt.hash("demo1234", 10),
    name: "Demo Sahibi",
    role: "STORE_OWNER",
  });

  const storeId = createId("store");
  await db.insert(stores).values({
    id: storeId,
    ownerId: userId,
    name: "Demo Mağaza",
    subdomain: "demo",
    theme: "vivid",
    currency: "TRY",
    language: "tr",
  });

  const catNames = ["Giyim", "Aksesuar", "Ev & Yaşam"];
  const catIds: Record<string, string> = {};
  for (const name of catNames) {
    const id = createId("cat");
    catIds[name] = id;
    await db.insert(categories).values({
      id,
      storeId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/ı/g, "i").replace(/ğ/g, "g"),
    });
  }

  const demoProducts = [
    {
      title: "Oversize Pamuklu Tişört",
      category: "Giyim",
      price: 349,
      compareAtPrice: 449,
      inventory: 40,
      description: "%100 pamuk, rahat kesim, günlük kullanım için ideal tişört.",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    },
    {
      title: "Slim Fit Kot Pantolon",
      category: "Giyim",
      price: 699,
      compareAtPrice: null,
      inventory: 25,
      description: "Esnek kumaşı sayesinde gün boyu konfor sağlayan slim fit kot pantolon.",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
    },
    {
      title: "Deri Kemer",
      category: "Aksesuar",
      price: 249,
      compareAtPrice: 299,
      inventory: 60,
      description: "Hakiki deri, ayarlanabilir toka.",
      imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600",
    },
    {
      title: "Güneş Gözlüğü",
      category: "Aksesuar",
      price: 449,
      compareAtPrice: null,
      inventory: 15,
      description: "UV400 korumalı, hafif çerçeveli güneş gözlüğü.",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    },
    {
      title: "Aromatik Mum Seti",
      category: "Ev & Yaşam",
      price: 199,
      compareAtPrice: 249,
      inventory: 50,
      description: "3'lü doğal soya mumu seti, uzun yanma süresi.",
      imageUrl: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600",
    },
    {
      title: "Seramik Kupa",
      category: "Ev & Yaşam",
      price: 129,
      compareAtPrice: null,
      inventory: 80,
      description: "El yapımı seramik kupa, 350ml.",
      imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    },
  ];

  for (const p of demoProducts) {
    await db.insert(products).values({
      id: createId("prod"),
      storeId,
      categoryId: catIds[p.category],
      title: p.title,
      slug: p.title
        .toLowerCase()
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: p.imageUrl,
      inventory: p.inventory,
      status: "ACTIVE",
    });
  }

  console.log("Demo mağaza oluşturuldu: demo.shopkurucu.com");
  console.log("Giriş: demo@shopkurucu.com / demo1234");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
