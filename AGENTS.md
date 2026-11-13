# AGENTS.md

Architecture reference for WhidbeyWave. Operational rules → CLAUDE.md. Domain-specific guidance → .claude/rules/.

## Project Overview

WhidbeyWave.com is a community hub for Whidbey Island, WA. Events, news, marketplace, barter board, community forum, local recommendations/reviews, newsletter, and live ferry status. Deployed on Vercel.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4 with custom PNW-themed design system
- **Database:** Supabase (Postgres with Row Level Security)
- **Auth:** Supabase Auth (magic link + Google OAuth)
- **Email:** Resend (transactional emails and weekly digest)
- **External APIs:** WSDOT Ferry Schedule, NOAA + Open-Meteo (tides + weather)
- **Fonts:** Playfair Display (headings), Lora (body)

## Routing (App Router)

All pages under `app/`:

- `/` — Homepage: hero, quick-links, weather widget, preview cards
- `/events` — Community calendar (Supabase `event_submissions`)
- `/news` — Blog-style news (hardcoded in `lib/data.ts`)
- `/marketplace`, `/barter` — Buy/sell and barter boards
- `/forum`, `/forum/[id]` — Community forum with threaded replies
- `/recommendations` — Local business/place recommendations with reviews
- `/newsletter` — Newsletter signup
- `/ferry` — Live ferry schedule/status from WSDOT API
- `/submit-event`, `/submit-listing` — Public submission forms
- `/admin/events` — Admin moderation panel
- `/auth/callback` — OAuth/magic-link callback handler
- `/profile` — User profile page
- `/search` — Site-wide search
- `/feed.xml` — RSS feed (route handler)

## API Routes (`app/api/`)

- `api/events/submit` — Save event, email admin + submitter receipt
- `api/events/moderate` — Admin approve/reject, email submitter
- `api/events/scrape` — Cron: scrape event sources
- `api/events/recurring/generate` — Cron: generate recurring event instances
- `api/contact` — Contact form → email admin
- `api/listings/submit` — Marketplace listing submission
- `api/listings/expire-flash-gives` — Cron: expire old flash gives
- `api/newsletter` — Newsletter signup
- `api/newsletter/send-digest` — Cron: Monday digest
- `api/newsletter/send-weekend` — Cron: Thursday weekend preview
- `api/forum/reply` — Authenticated reply insertion
- `api/ferry-status` — WSDOT ferry proxy (cached 5 min)
- `api/auto-approve` — Cron: auto-approve trusted sources
- `api/notifications/test` — Admin test endpoint for notification pipeline

## Data Layer

- **`lib/supabase.ts`** — Browser singleton + `createServerClient()` factory + auth helpers. `isConfigured` flag for graceful degradation.
- **`lib/data.ts`** — Hardcoded demo data + `formatDate`, `formatShortDate`, `categoryColors`
- **`lib/db-types.ts`** — TypeScript types for all Supabase tables
- **`lib/ferry.ts`** — WSDOT client: `fetchFerryBarStatus()` (hero strip), `fetchFerryPageData()` (full page)
- **`lib/notifications.ts`** — `notify()` central routing for all per-user notifications
- **`lib/whidbey-zips.ts`** — Whidbey zip codes + `isWhidbeyLocal()` helper
- **`lib/scrapers/`** — One file per event source. Shared: `sno-isle-common.ts`
- **`lib/constants.ts`** — `CATEGORY_EMOJI`, `FORUM_CATEGORY_COLORS`, `FORUM_CATEGORIES`

## Database Schema

- Authoritative schema: `supabase-schema.sql` (root)
- Migrations: `supabase/` directory
- Key tables: `event_submissions`, `newsletter_subscribers`, `forum_categories`, `forum_posts`, `forum_replies`, `recommendations`, `reviews`, `notification_preferences`, `notification_log`, `scrape_log`
- RLS pattern: public read, authenticated insert for user content, service role for admin ops

## Components

- **`AuthModal.tsx`** — Login/signup modal (magic link + Google)
- **`AuthProvider.tsx`** — Auth context + `useAuth()` hook
- **`ZipPrompt.tsx`** — Post-login zip code collection
- **`Navbar.tsx`** / **`Footer.tsx`** — Site-wide layout
- **`WeatherTideWidget.tsx`** — Weather, tide, ferry status bar
- **`EventsFilter.tsx`** — Tag/category filtering
- **`EventRsvpButton.tsx`** — RSVP interaction
- **`NewsCommentSection.tsx`** — Comments on news
- **`ShareButton.tsx`** — Social sharing
- **`LocalBadge.tsx`** — "Local" badge for Whidbey zip users
- **`forum/NewPostForm.tsx`** / **`forum/ReplyForm.tsx`** — Forum forms

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Admin Supabase key (server-only, bypasses RLS)
- `RESEND_API_KEY` — Resend email service
- `WSDOT_API_KEY` — Ferry API
- `NEXT_PUBLIC_SITE_URL` — Canonical URL (emails, OAuth redirects)
- `ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL` — Admin inbox
- `CRON_SECRET` — Bearer token for cron endpoints

## Conventions (reference)

- `trailingSlash: true` in `next.config.js`
- Path alias `@/*` maps to project root
- `categoryColors` in `lib/data.ts` — update when adding categories
- Email templates are inline HTML in route handlers (no template engine)
