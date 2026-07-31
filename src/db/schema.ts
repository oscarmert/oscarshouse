import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Platform-level users: store owners + platform admins.
// (Storefront customers are a separate table, scoped per store, see below.)
// ---------------------------------------------------------------------------
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["PLATFORM_ADMIN", "STORE_OWNER"] })
      .notNull()
      .default("STORE_OWNER"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

// ---------------------------------------------------------------------------
// Stores == tenants. Each store is an isolated "shop" like on Shopify/Ticimax.
// ---------------------------------------------------------------------------
export const stores = sqliteTable(
  "stores",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    subdomain: text("subdomain").notNull(),
    customDomain: text("custom_domain"),
    theme: text("theme").notNull().default("classic"),
    headerStyle: text("header_style").notNull().default("classic"),
    logoUrl: text("logo_url"),
    currency: text("currency").notNull().default("TRY"),
    language: text("language").notNull().default("tr"),
    status: text("status", { enum: ["ACTIVE", "SUSPENDED"] })
      .notNull()
      .default("ACTIVE"),
    plan: text("plan", { enum: ["TRIAL", "BASIC", "PRO"] })
      .notNull()
      .default("TRIAL"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("stores_subdomain_idx").on(table.subdomain)]
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    imageUrl: text("image_url"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("categories_store_slug_idx").on(table.storeId, table.slug)]
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    price: real("price").notNull(),
    compareAtPrice: real("compare_at_price"),
    imageUrl: text("image_url"),
    inventory: integer("inventory").notNull().default(0),
    status: text("status", { enum: ["ACTIVE", "DRAFT"] })
      .notNull()
      .default("ACTIVE"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("products_store_slug_idx").on(table.storeId, table.slug)]
);

// Per-store customer accounts (separate from platform `users`).
export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("customers_store_email_idx").on(table.storeId, table.email)]
);

export const carts = sqliteTable("carts", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  priceAtAdd: real("price_at_add").notNull(),
});

export const discounts = sqliteTable(
  "discounts",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    type: text("type", { enum: ["PERCENTAGE", "FIXED"] }).notNull(),
    value: real("value").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [uniqueIndex("discounts_store_code_idx").on(table.storeId, table.code)]
);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  customerId: text("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  status: text("status", {
    enum: ["PENDING", "PAID", "FULFILLED", "CANCELLED"],
  })
    .notNull()
    .default("PENDING"),
  subtotal: real("subtotal").notNull(),
  discountTotal: real("discount_total").notNull().default(0),
  total: real("total").notNull(),
  currency: text("currency").notNull().default("TRY"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// ---------------------------------------------------------------------------
// Relations (used for convenient nested queries via drizzle's query API)
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  products: many(products),
  categories: many(categories),
  customers: many(customers),
  orders: many(orders),
  discounts: many(discounts),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, { fields: [categories.storeId], references: [stores.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  store: one(stores, { fields: [carts.storeId], references: [stores.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
