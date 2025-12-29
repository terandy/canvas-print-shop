import { z } from "zod";

const envSchema = z.object({
  COMPANY_NAME: z.string(),
  SITE_NAME: z.string(),

  // Database (Vercel Postgres)
  POSTGRES_URL: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),

  // Admin Auth
  ADMIN_JWT_SECRET: z.string().optional(),

  // Legacy Shopify (keep during migration, remove after)
  SHOPIFY_REVALIDATION_SECRET: z.string().optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_STORE_DOMAIN: z.string().optional(),

  // AWS S3
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_S3_BUCKET: z.string(),

  // App
  BASE_URL: z.string(),
});

envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
