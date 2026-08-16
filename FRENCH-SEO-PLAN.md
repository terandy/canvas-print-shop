# Quebec French SEO — Audit & Implementation Plan

Audit date: 2026-08-10. Audited against the live site (`https://canvasprintshop.ca`) and
the `main` branch at commit `6ac0cc7`.

## Read this first

The French site is **not** technically broken. Titles, H1s, meta descriptions,
canonicals, hreflang, the sitemap and all 1,199 translation keys are present,
correct and genuinely well-written French. A previous pass already fixed the
big structural defects (per-page canonicals, locale-wildcarded robots rules,
soft-404s, orphaned landing pages).

The French side underperforms for four reasons that are **content and URL
strategy**, not plumbing. Do not go looking for a missing `hreflang` tag — it is
there. Fix the four things in Phase 1.

**Guiding constraint: do not touch English URLs.** English rankings are healthy.
Every URL change in this plan applies to `/fr/*` only. This keeps the blast
radius small and makes the whole plan safely reversible.

---

## Findings

### P0 — French URLs contain no French

Every French page is served under an English path. The slug is the single
largest remaining difference between the two locales.

| Live French URL                            | What the page targets                    |
| ------------------------------------------ | ---------------------------------------- |
| `/fr/canvas-prints/wedding`                | "toiles de mariage"                      |
| `/fr/canvas-prints/pet-portrait`           | "portrait d'animal sur toile"            |
| `/fr/shop`                                 | "boutique de toiles"                     |
| `/fr/blog/how-to-choose-canvas-print-size` | "comment choisir le bon format de toile" |
| `/fr/product/canvas`                       | "impression sur toile personnalisée"     |

Two costs. Google reads path tokens as a relevance signal, so the French pages
are handing that signal to English terms. Worse, the SERP renders the URL as a
breadcrumb — a Quebec searcher sees `canvasprintshop.ca › fr › canvas-prints ›
wedding` and reads it as an English page, which suppresses CTR, which feeds back
into ranking.

Competitors ranking for these terms in Quebec use French slugs. `digitaltx.ca`
ranks on `/fr/impression-sur-toile-canevas-montreal/`.

### P0 — Zero coverage of "canevas", the Quebec term

`messages/fr.json` contains **531 occurrences of "toile" and 0 of "canevas"**.

In Quebec, "canevas" is standard consumer vocabulary for this product and every
significant local competitor targets it, usually alongside "toile":

| Competitor            | H1 / title                                     |
| --------------------- | ---------------------------------------------- |
| Photolab Yves Thomas  | H1: **"Impression sur toile canevas"**         |
| Kant Photo (Montréal) | Title: **"Canevas & Toile Sur Cadre"**         |
| Gosselin Photo        | **"Canevas sur toile"**                        |
| Oleka Canvas          | **"canevas personnalisé"**                     |
| Digital TX            | URL: `/impression-sur-toile-canevas-montreal/` |

The site is invisible for an entire high-intent query family — "canevas photo",
"impression sur canevas", "canevas personnalisé", "canevas photo Montréal".
This is the highest-value, lowest-effort win in the plan.

### P0 — The 14 city pages are near-duplicates of each other

Measured vocabulary overlap against the Montreal page (French):

```
quebec-city 89%   sherbrooke 91%   longueuil 91%   ottawa    89%
laval       89%   trois-riv. 94%   toronto    86%   kingston  92%
gatineau    89%   hamilton   84%   mississ.   86%   windsor   93%
london      90%                                     (montreal 100%)
```

All 14 share a byte-identical `subheading` and the same 4 FAQ questions with
only the city name swapped. This is a textbook doorway-page pattern. Google
typically indexes one and filters or ignores the rest. It affects English too,
but English survives on domain-level signals the French side does not have.

### P0 — `/fr/product/canvas` is the weakest page on the French site

It is the primary commercial page and it has:

- **H1 = "Toile"** — one generic word. (English H1 is "Canvas Prints".) This
  comes from `products.title_fr` in the database.
- **Ten hardcoded English review strings** rendered as visible body text —
  "I highly recommend", "Really happy with my canvas", "Best place for imaging
  in Quebec". Verified live on `/fr/product/canvas`. A mid-page block of English
  on a French URL is a direct quality signal against the page.
  Source: `src/app/[locale]/product/[handle]/page.tsx` — the `reviews` array.
- Meta description says **"Téléchargez votre photo"** — _download_ your photo.
  The word needed is **"Téléversez"** (upload), which is also the OQLF-correct
  Quebec term. From `products.seo_description_fr`.
- Title is 79 characters and truncates in the SERP, losing the brand.

### P1 — The index is stale; the recent fixes have not been recrawled

Google currently shows `/fr` with the title
**"Impression sur Toile Canada | Toile Murale Personnalisée"**. The live title
has been **"Impression sur toile | Québec et Ontario | Canvas Print Shop"**
since the SEO commits landed. None of the 28 French landing pages surface at all.

Some of the perceived "appalling" state is simply that the previous fixes are
not yet reflected. Phase 4 handles this. It also means **you will not be able to
measure any of this work without Search Console access** — get it first.

### P1 — Nothing is cacheable at the edge

Every route sets `export const dynamic = "force-dynamic"` and the locale layout
reads `cookies()`/`headers()`. Live headers on `/fr`:

```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
```

Every crawl of all 84 URLs is a cold render against Postgres. Slow TTFB, wasted
crawl budget, and it drags Core Web Vitals on the pages that most need help.

### P1 — `/` locale redirect has no `Vary` header

```
GET /                              → 307 /en
GET / (Accept-Language: fr-CA)     → 307 /fr
```

The response varies on `Accept-Language` but does not declare it. A CDN or
intermediary can cache the `/en` redirect and serve it to French users.

### P2 — Metadata renders in `<body>`, not `<head>`

On the live French page, `</head>` closes at byte 1577 and `<title>` appears at
byte 22227 — inside the body. This is Next 15 streaming metadata and holds even
for a Googlebot user-agent. Google renders JS so this is tolerated, but Bing and
social scrapers are less forgiving. Configure `htmlLimitedBots` to block-render
metadata for non-JS crawlers.

### P2 — Smaller items

- `opengraph-image.tsx` is English-only and serves both locales.
- `LocalBusiness` JSON-LD is byte-identical across locales: no `inLanguage`,
  English `areaServed` names ("Quebec"), no French `description`.
- Sitemap `alternates` omit `x-default` (page-level `<link>` tags have it).
- `LanguageSwitcher.tsx` does a naive `/${locale}` prefix swap. **This will
  silently break the moment Phase 2 lands** — it must use next-intl's routing
  helpers so it maps `/en/canvas-prints/wedding` → `/fr/impression-sur-toile/mariage`.
- 3 orphan keys in `fr.json` with no English counterpart: `Cart.NotFound.{title,message,button}`.
- Blog has 3 posts, all direct translations. No French-first topics.

---

## Implementation plan

### Phase 0 — Prerequisites (do before writing code)

1. Get Google Search Console access for the property. Without it none of this is
   measurable. Confirm the `fr` URLs are submitted and check the Pages report for
   "Crawled – currently not indexed" / "Duplicate without user-selected canonical"
   on the `/fr/canvas-prints/*` set — that will confirm the duplicate-content
   diagnosis in P0 #3.
2. Record baseline: current impressions/clicks/avg position for `/fr/*`, so the
   URL migration in Phase 2 can be judged against something.

### Phase 1 — Content fixes (no URL changes, ship first)

These are independent of the URL migration, carry near-zero risk, and should go
out on their own so their effect is measurable before URLs move.

**1.1 Introduce "canevas" across French copy.** Edit `messages/fr.json` only.
Weave it in naturally — H2s, FAQ questions, body prose — do not stuff. Target
roughly one use per page section where it reads naturally. Specific placements:

- `Metadata.title` (fr): `Impression sur toile et canevas photo | Québec et Ontario`
- `LandingPages.<city>.meta.title`: `Impression sur toile et canevas — <Ville>`
- Add one FAQ entry to `LandingPages.common` (or per-page) along the lines of:
  _« Quelle est la différence entre une toile et un canevas ? »_ — answer that
  they are the same product, the two words are used interchangeably at Quebec.
  This captures the query and justifies the vocabulary on-page.
- Product page copy (`Product.canvasPage.*`) — at minimum the quality section
  and the FAQ answers.

**1.2 Fix the product page.** Three separate fixes:

- Database: set `products.title_fr` for handle `canvas` to something real, e.g.
  `Impression sur toile personnalisée`. This is the H1.
- Database: fix `products.seo_description_fr` — `Téléchargez` → `Téléversez`.
- Database: shorten `products.seo_title_fr` to ≤ 40 chars so the appended
  `| Canvas Print Shop` template keeps the whole title under ~60. Suggested:
  `Impression sur toile et canevas personnalisée`.
- While in there: `seo_title_en` currently already ends in "Canvas Print Shop"
  and the layout template appends it again, producing
  `... | Canvas Print Shop | Canvas Print Shop`. Strip the trailing brand.

**1.3 Translate or remove the English reviews.**
`src/app/[locale]/product/[handle]/page.tsx` — the `reviews` array is hardcoded
English. Either add a `commentFr` field to each entry and select on locale, or
move the reviews into the messages files. Note the surrounding comment in that
file: these are Google reviews and several are about labels/laminating, not
canvas. Do **not** reintroduce `Review`/`AggregateRating` schema for them.

**1.4 De-duplicate the city pages.** For each of the 14, replace the shared
boilerplate with genuinely local content — 150+ unique words each. Suggested
angles that are cheap to write and actually useful: local pickup vs. delivery
for that city, transit time from the Quebec City studio, a reference to local
neighbourhoods or a local landmark, wall sizes typical of that city's housing
stock (a Plateau apartment vs. a Laval bungalow). At minimum, make the
`subheading` and two of the four FAQ answers unique per city. Do this in French
first; port to English after.

**1.5 Housekeeping.** Delete the 3 orphan `Cart.NotFound.*` keys from `fr.json`,
or add the English counterparts if the UI actually uses them (check first).

### Phase 2 — French URL migration (the big one)

Ship this only after Phase 1 is live and stable. English paths must not change.

**2.1 Declare localized pathnames.** `src/i18n/routing.ts` — add a `pathnames`
map to `defineRouting`:

```ts
pathnames: {
  "/": "/",
  "/shop": { en: "/shop", fr: "/boutique" },
  "/blog": { en: "/blog", fr: "/blogue" },          // "blogue" is the OQLF form
  "/faqs": { en: "/faqs", fr: "/faq" },
  "/contact": "/contact",
  "/how-we-make-our-canvas-prints": {
    en: "/how-we-make-our-canvas-prints",
    fr: "/comment-nous-fabriquons-nos-toiles",
  },
  "/quality-guarantee":  { en: "/quality-guarantee",  fr: "/garantie-qualite" },
  "/shipping-policy":    { en: "/shipping-policy",    fr: "/politique-de-livraison" },
  "/returns-policy":     { en: "/returns-policy",     fr: "/politique-de-retour" },
  "/privacy-policy":     { en: "/privacy-policy",     fr: "/politique-de-confidentialite" },
  "/search":             { en: "/search",             fr: "/recherche" },
  "/cart":               { en: "/cart",               fr: "/panier" },
  "/checkout":           { en: "/checkout",           fr: "/paiement" },
  "/product/[handle]":   { en: "/product/[handle]",   fr: "/produit/[handle]" },
  "/canvas-prints/[slug]": {
    en: "/canvas-prints/[slug]",
    fr: "/impression-sur-toile/[slug]",
  },
  "/blog/[slug]": { en: "/blog/[slug]", fr: "/blogue/[slug]" },
}
```

**2.2 Translate the dynamic slugs.** next-intl localizes the static segments but
**not** the `[slug]` value — that needs its own layer. In
`src/lib/landing-pages.ts`, keep the existing English slugs as the canonical
internal key and add a translation map plus two resolvers:

```ts
export const SLUG_FR: Record<Slug, string> = {
  // cities — unchanged except quebec-city
  montreal: "montreal", "quebec-city": "quebec", laval: "laval",
  gatineau: "gatineau", sherbrooke: "sherbrooke",
  "trois-rivieres": "trois-rivieres", longueuil: "longueuil",
  toronto: "toronto", ottawa: "ottawa", mississauga: "mississauga",
  hamilton: "hamilton", london: "london", kingston: "kingston",
  windsor: "windsor",
  // sizes — unchanged
  "16x20": "16x20", "24x36": "24x36", "36x48": "36x48",
  // use cases — all translated
  wedding: "mariage",            family: "famille",
  "pet-portrait": "portrait-animal", bedroom: "chambre",
  "living-room": "salon",        large: "grand-format",
  framed: "encadree",            custom: "sur-mesure",
  "wall-art": "art-mural",       "gallery-wrap": "toile-galerie",
  personalized: "personnalisee",
};

export const toLocalizedSlug = (slug: Slug, locale: Locale): string => ...
export const fromLocalizedSlug = (input: string, locale: Locale): Slug | undefined => ...
```

Everything downstream — the `LandingPages.<slug>` translation namespace, the
`related` arrays, the footer links, `slugPriority` — keeps using the canonical
English key. Only the emitted URL changes. `fromLocalizedSlug` must accept the
canonical English slug on `/fr` too, so old inbound links still resolve before
the redirect fires.

Do the same for blog posts: add `slugFr` to the `BlogPost` type in
`src/lib/blog.ts` and give each of the 3 posts a French slug.

**2.3 Fix `canonicalMetadata` — this is the subtle part.**
`src/lib/seo.ts` currently assumes the same path across locales:

```ts
languages[`${loc}-CA`] = `${BASE_URL}/${loc}${path}`; // ← breaks under 2.1
```

Once French paths differ, this emits hreflang pointing at URLs that 301 or 404.
**Broken hreflang is worse than no hreflang.** Change the signature to take
either a per-locale path map or a `(locale) => string` builder, and update all
14 call sites. Same fix in `src/app/sitemap.ts` — its `localized()` helper has
the identical assumption.

**2.4 Redirect the old French URLs.** Every `/fr/*` path that changes needs a
301 in `next.config.ts` `redirects()` (`permanent: true`), following the pattern
already established there for the retired city pages. That is ~10 static paths

- 28 landing slugs + 3 blog posts + the product path. Generate them from the
  same maps rather than hand-listing.

**2.5 Fix `LanguageSwitcher.tsx`.** Replace the naive prefix swap with
next-intl's `usePathname`/`Link` from `src/i18n/navigation.ts` so switching
language maps between the localized equivalents. Verify it on a landing page and
a blog post, both directions.

**2.6 Audit every hardcoded href.** Grep for `` `/${locale}/ `` — `footer.tsx`,
`navbar/`, `landing-page.tsx`, `page.tsx` and the product page all build hrefs
by string interpolation. All of these must go through the localized-path helper
or French internal links will point at redirects.

**2.7 Update `robots.ts`.** The disallow list uses English paths (`/*/checkout/`,
`/*/cart/`, `/*/search`). Add the French equivalents (`/*/paiement/`,
`/*/panier/`, `/*/recherche`).

### Phase 3 — Infrastructure

**3.1 Make pages cacheable.** The blanket `force-dynamic` exists because the
locale layout calls `cookies()`/`headers()` for cart and admin detection. Move
that into a client component or a smaller server boundary so the marketing
routes (`/`, `/shop`, `/canvas-prints/*`, `/blog/*`, policy pages) can use ISR
(`export const revalidate = 3600`). Note the comment in
`canvas-prints/[slug]/page.tsx` explaining why `generateStaticParams` was
removed — solving the layout's dynamic-API usage is the prerequisite that
unblocks it.

**3.2 Add `Vary: Accept-Language`** to the locale-detection redirect in
`src/middleware.ts`.

**3.3 Configure `htmlLimitedBots`** in `next.config.ts` so metadata is
block-rendered into `<head>` for non-JS crawlers.

**3.4 Localize `opengraph-image.tsx`** — make it locale-aware, or add a French
variant.

**3.5 Localize the `LocalBusiness` JSON-LD** in `src/app/[locale]/layout.tsx`:
add `inLanguage`, use `"Québec"` / `"Ontario"` for `areaServed` on the French
page, and add a French `description`.

**3.6 Add `x-default`** to the sitemap `alternates.languages` map to match what
the page-level tags already emit.

### Phase 4 — Recrawl and measure

1. Resubmit `sitemap.xml` in Search Console after Phase 2 deploys.
2. Use URL Inspection → Request Indexing on `/fr`, `/fr/boutique`,
   `/fr/produit/toile` and the top 5 Quebec city pages.
3. Watch the Pages report for the 301'd French URLs — expect them to move to
   "Page with redirect" over 2–6 weeks. That is the migration working.
4. Expect a temporary French ranking dip after Phase 2. This is normal for a URL
   migration. Do not revert inside the first 6 weeks.
5. Re-baseline French impressions/position at 6 and 12 weeks against the Phase 0
   numbers.

### Phase 5 — Content growth (ongoing)

- Write French-first blog posts rather than translations. Topics with local
  intent: _« Toile ou canevas : quelle différence ? »_, _« Où faire imprimer une
  photo sur toile à Montréal »_, _« Quel format de toile pour un condo »_.
- Consider a dedicated `/fr/impression-sur-toile/canevas-photo` page once
  "canevas" coverage exists site-wide and there is data showing the query
  converts.

---

## Ordering and risk

| Phase                               | Risk       | Ship independently?          |
| ----------------------------------- | ---------- | ---------------------------- |
| 0 — GSC access + baseline           | none       | prerequisite                 |
| 1 — content, keywords, product page | low        | **yes, ship first**          |
| 2 — URL migration                   | **high**   | only after Phase 1 is stable |
| 3 — infrastructure                  | low–medium | anytime after Phase 1        |
| 4 — recrawl                         | none       | after Phase 2                |
| 5 — content growth                  | none       | ongoing                      |

The three things most likely to break in Phase 2, in order: **hreflang pointing
at redirected URLs (2.3)**, **the language switcher (2.5)**, and **hardcoded
`/${locale}/...` hrefs (2.6)**. Verify all three on a landing page, a blog post
and the product page before deploying.

## Verification commands

```bash
# hreflang cross-links must resolve 200, not 301/404
curl -s https://canvasprintshop.ca/fr/impression-sur-toile/mariage \
  | grep -oE '<link rel="alternate"[^>]*>'

# old French URLs must 301, not 404
curl -sI https://canvasprintshop.ca/fr/canvas-prints/wedding | head -1

# no English strings left on the French product page
curl -s https://canvasprintshop.ca/fr/produit/toile | grep -c "I highly recommend"

# translation key parity
node -e "const e=require('./messages/en.json'),f=require('./messages/fr.json');
const fl=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'&&!Array.isArray(v)?fl(v,p+k+'.'):[p+k]);
const E=fl(e),F=fl(f);
console.log('missing in fr:',E.filter(k=>!F.includes(k)));
console.log('orphan in fr:',F.filter(k=>!E.includes(k)));"
```

Run `npm run tsc`, `npm run lint` and `npm run build` after Phase 2 — the
`canonicalMetadata` signature change in 2.3 touches 14 call sites and the
compiler will find the ones you missed.

## Sources

- [Photolab Yves Thomas](https://ytlab.com/produits/toile/) · [Kant Photo](https://kantphoto.com/canevas-toile-sur-cadre) · [Oleka Canvas](https://olekacanvas.com/products/canevaspersonnalise) · [Gosselin Photo](https://impression.gosselinphoto.ca/impression/categories/canevas-sur-toile/315590) · [Digital TX](https://www.digitaltx.ca/fr/impression-sur-toile-canevas-montreal/) · [PJC Photo (Jean Coutu)](https://iphoto.jeancoutu.com/fr/produits/deco/canvas/)
