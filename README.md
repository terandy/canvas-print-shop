# Canvas Print Shop

E-commerce platform for canvas prints built with Next.js.

## Links

- **Production**: https://canvasprintshop.ca
- **Vercel Dashboard**: https://vercel.com/canvas-print-shop
- **Stripe Dashboard**: https://dashboard.stripe.com
- **AWS S3 Console**: https://s3.console.aws.amazon.com
- **Resend Dashboard**: https://resend.com
- **Domain Registrar (GoDaddy)**: https://dcc.godaddy.com

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`

3. Run the development server:

   ```bash
   npm run dev
   ```

4. For Stripe webhooks in development:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

Open http://localhost:3000 to view the site.

## Environment Variables

Required variables:

- `POSTGRES_URL` - Vercel Postgres connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `AWS_ACCESS_KEY_ID` - AWS credentials for S3
- `AWS_SECRET_ACCESS_KEY` - AWS credentials for S3
- `AWS_REGION` - AWS region (e.g., ca-central-1)
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `RESEND_API_KEY` - Resend API key for emails
- `ADMIN_EMAIL` - Email address to notifiy admin of new orders
- `ORDER_EMAIL` - Sender email address for order updates
- `NEXT_PUBLIC_BASE_URL` - Base URL for the site
- `JWT_SECRET` - Secret for admin authentication

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│                    (Vercel Deployment)                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend          │  Admin Dashboard    │  API Routes      │
│  - Product pages   │  - Order management │  - Stripe        │
│  - Cart            │  - Product editing  │    webhooks      │
│  - Checkout        │  - Status updates   │                  │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Vercel Postgres │  │     AWS S3       │  │     Stripe       │
│  (Database)      │  │  (Image Storage) │  │  (Payments)      │
│  - Products      │  │                  │  │                  │
│  - Orders        │  │                  │  │                  │
│  - Carts         │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                                                    │
                                                    ▼
                                           ┌──────────────────┐
                                           │     Resend       │
                                           │  (Email Service) │
                                           │  - Order confirm │
                                           │  - Shipping      │
                                           └──────────────────┘
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Vercel Postgres with Drizzle ORM
- **Payments**: Stripe Checkout
- **Image Storage**: AWS S3
- **Email**: Resend
- **Styling**: Tailwind CSS
- **i18n**: next-intl (English/French)
