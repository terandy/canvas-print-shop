import { z } from "zod";

const envSchema = z.object({
  COMPANY_NAME: z.string(),
  SITE_NAME: z.string(),

  // Database (Vercel Postgres)
  POSTGRES_URL: z.string(),

  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // Email (Resend)
  RESEND_API_KEY: z.string(),
  ORDER_EMAIL: z.string(),
  ADMIN_EMAIL: z.string(),

  // Admin Auth
  ADMIN_JWT_SECRET: z.string(),

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
