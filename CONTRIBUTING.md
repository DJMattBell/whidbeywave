# Contributing to WhidbeyWave

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev                        # http://localhost:3000
```

## Project Structure

```
app/            → Next.js App Router (pages + API routes)
components/     → Shared React components
lib/            → Utilities, data fetching, Supabase client
  constants.ts  → Shared display constants (emoji maps, color badges)
  validate.ts   → Input validation helpers + canonical allowlists
  adminAuth.ts  → Admin JWT verification
  userAuth.ts   → Logged-in user verification (Bearer token)
  cronAuth.ts   → Cron job authentication (Vercel Cron / CRON_SECRET)
  email.ts      → Shared email layout helpers (header, button, card)
  supabase.ts   → Supabase client (browser singleton + server factory)
  db-types.ts   → TypeScript types for database tables
  data.ts       → Static demo data + category color map
  ferry.ts      → WSDOT Ferry API client
  marketplace.ts→ Marketplace types + formatting
  newsletter.ts → Unsubscribe token generation (HMAC)
  recurring.ts  → Recurring event date generation
  escapeHtml.ts → XSS-safe HTML escaping
  whidbey-zips.ts → Whidbey Island zip code validation
  scrapers/     → Event scrapers (one file per source)
supabase/       → Database migrations
scripts/        → Seed scripts
```

## Key Conventions

### Authentication Patterns

There are three auth helpers — use the right one for your route:

| Helper | Import | Use when |
|--------|--------|----------|
| `verifyAdminRequest` | `@/lib/adminAuth` | Route requires the admin email (moderation, news CRUD) |
| `verifyUserRequest` | `@/lib/userAuth` | Route requires any logged-in user (forum replies, reviews) |
| `verifyCronRequest` | `@/lib/cronAuth` | Route is triggered by Vercel Cron or manual Bearer token |

### Shared Constants

**Do not redefine these per-file.** Import from `@/lib/constants`:

- `CATEGORY_EMOJI` — event category → emoji mapping
- `FORUM_CATEGORY_COLORS` — forum category → Tailwind badge classes
- `FORUM_CATEGORIES` — forum category list (with "All")

Event/listing category colors live in `@/lib/data` as `categoryColors`.

### Validation

Server-side validation uses the `Validator` class from `@/lib/validate`:

```ts
const v = new Validator();
v.required(title, 'Title')
 .maxLength(title, 200, 'Title')
 .oneOf(category, ALLOWED_EVENT_CATEGORIES, 'Category');

if (!v.ok()) {
  return NextResponse.json({ error: v.firstError() }, { status: 400 });
}
```

Canonical allowlists (`ALLOWED_TOWNS`, `ALLOWED_EVENT_CATEGORIES`, etc.) are
also exported from `@/lib/validate`.

### Email Templates

Use the helpers from `@/lib/email` for consistent styling:

- `emailLayout({ body, headerTitle?, footerHtml? })` — full HTML wrapper
- `emailButton(href, label)` — styled CTA button
- `emailCard(innerHtml)` — parchment card block

### Error Handling

- External API calls (ferry, weather, scrapers) fail silently and return empty data
- Email sending is always non-fatal — the DB operation should succeed regardless
- API routes wrap in try/catch and return `{ error: "message" }` with appropriate status codes
- Scrapers return `[]` on failure, never throw

### Environment Variables

| Variable | Where | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes |
| `RESEND_API_KEY` | Server only | Yes (for email) |
| `NEXT_PUBLIC_SITE_URL` | Both | Defaults to whidbeywave.com |
| `ADMIN_EMAIL` | Server only | Yes |
| `CRON_SECRET` | Server only | Yes (protects cron endpoints) |
| `WSDOT_API_KEY` | Server only | Yes (ferry data) |

### Design System

- **Colors:** forest green, parchment cream, slate blue (sound), warm amber, terracotta (terra)
- **Fonts:** Playfair Display (headings), Lora (body)
- **Tone:** Warm, unhurried, small-town Pacific Northwest
- **No:** Sharp gradients, glowing effects, startup/SaaS aesthetics
- **Always:** Mobile-first

### Adding Event Scrapers

See `lib/scrapers/types.ts` for the `ScrapedEvent` type. Each scraper exports
a `scrape()` function. Priority order:

1. Fix HTML selectors (cheerio + correct CSS selectors)
2. Platform API (Squarespace `?format=json`, WordPress REST, etc.)
3. iCal/ICS feed

Never copy selectors between scrapers — always inspect the actual site.

## Commands

```bash
npm run dev       # Dev server
npm run build     # Production build (run before pushing)
npm run lint      # ESLint
```
