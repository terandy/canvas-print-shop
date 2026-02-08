import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

// ============================================
// PRODUCT TABLES
// ============================================

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  handle: varchar("handle", { length: 255 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleFr: varchar("title_fr", { length: 255 }),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  descriptionHtmlEn: text("description_html_en"),
  descriptionHtmlFr: text("description_html_fr"),
  featuredImageUrl: text("featured_image_url"),
  seoTitleEn: varchar("seo_title_en", { length: 255 }),
  seoTitleFr: varchar("seo_title_fr", { length: 255 }),
  seoDescriptionEn: text("seo_description_en"),
  seoDescriptionFr: text("seo_description_fr"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  width: integer("width"),
  height: integer("height"),
  sortOrder: integer("sort_order").default(0),
});

export const productOptions = pgTable("product_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(), // "dimension", "frame", "depth", "border_style"
  values: text("values").array().notNull(), // ["8x10", "11x14", ...]
  affectsPrice: boolean("affects_price").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }),
  title: varchar("title", { length: 255 }).notNull(), // "8x10 / black / gallery"
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("CAD"),
  availableForSale: boolean("available_for_sale").default(true),
  // Flexible options as JSONB: { "dimension": "8x10", "frame": "black", "depth": "gallery" }
  options: jsonb("options").notNull().$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// CUSTOMER & CART TABLES
// ============================================

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  sessionId: varchar("session_id", { length: 255 }), // For anonymous users
  status: varchar("status", { length: 50 }).default("active"), // "active", "converted", "abandoned"
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  // Non-price attributes: { "borderStyle": "wrapped", "imageUrl": "https://...", "orientation": "landscape" }
  attributes: jsonb("attributes")
    .notNull()
    .default({})
    .$type<{
      borderStyle?: string;
      imageUrl?: string;
      orientation?: "landscape" | "portrait";
    }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// ORDER TABLES
// ============================================

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: serial("order_number").unique(),
  customerId: uuid("customer_id").references(() => customers.id),
  cartId: uuid("cart_id").references(() => carts.id),

  // Stripe references
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
    length: 255,
  }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),

  // Status tracking
  status: varchar("status", { length: 50 }).default("pending"), // "pending", "paid", "processing", "shipped", "fulfilled", "cancelled", "refunded"
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // "pending", "paid", "failed", "refunded"

  // Pricing (stored at time of order)
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").default(0),
  shippingCents: integer("shipping_cents").default(0),
  totalCents: integer("total_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("CAD"),

  // Addresses
  shippingAddress: jsonb("shipping_address").$type<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),
  billingAddress: jsonb("billing_address").$type<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),

  // Customer info snapshot
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }),

  // Shipping tracking
  trackingNumber: varchar("tracking_number", { length: 255 }),
  trackingUrl: text("tracking_url"),
  notes: text("notes"),

  // Timestamps
  paidAt: timestamp("paid_at"),
  shippedAt: timestamp("shipped_at"),
  fulfilledAt: timestamp("fulfilled_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id),
  productHandle: varchar("product_handle", { length: 255 }).notNull(),
  productTitle: varchar("product_title", { length: 255 }).notNull(),
  variantTitle: varchar("variant_title", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
  // Snapshot of variant options at time of order
  selectedOptions: jsonb("selected_options")
    .notNull()
    .$type<Record<string, string>>(),
  // Non-price attributes
  attributes: jsonb("attributes")
    .notNull()
    .default({})
    .$type<{
      borderStyle?: string;
      imageUrl?: string;
      orientation?: "landscape" | "portrait";
    }>(),
});

// ============================================
// ADMIN TABLES
// ============================================

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("admin"), // "admin", "staff"
  isActive: boolean("is_active").default(true),
  receiveOrderEmails: boolean("receive_order_emails").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminUserId: uuid("admin_user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminUserId: uuid("admin_user_id").references(() => adminUsers.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }), // "order", "product", etc.
  entityId: uuid("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type ProductOption = typeof productOptions.$inferSelect;
export type NewProductOption = typeof productOptions.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
