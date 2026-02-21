# Canvas Print Shop

E-commerce app for custom canvas prints built with Next.js 15, React 18, and TypeScript.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with `src/app/[locale]/` routing
- **Database**: Vercel Postgres with Drizzle ORM (`src/lib/db/`)
- **Styling**: Tailwind CSS (no component library — custom HTML + Tailwind)
- **Icons**: Lucide React
- **Payments**: Stripe
- **Email**: Resend
- **Storage**: AWS S3
- **i18n**: next-intl (English + French)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run tsc` — type check

## Project Structure

- `src/app/[locale]/` — pages (all routes are locale-prefixed)
- `src/app/api/` — API routes (Stripe webhooks, etc.)
- `src/components/` — React components (organized by feature: admin/, cart/, product/, etc.)
- `src/lib/db/schema.ts` — Drizzle schema
- `src/lib/db/queries/` — database read queries
- `src/lib/db/actions/` — database write actions (server actions)
- `messages/en.json`, `messages/fr.json` — translation files

## Important Conventions

- **All user-facing strings must be translated** using `next-intl`. Use `getTranslations()` in server components or `useTranslations()` in client components. Never hardcode user-facing text — add keys to both `messages/en.json` and `messages/fr.json`.
- **Monetary values** are stored in cents (`totalCents`) and displayed as `$XX.XX`.
- **Order numbers** are displayed as `#123`.
- **Status badges** use a shared `STATUS_COLORS` map for consistent color coding.
