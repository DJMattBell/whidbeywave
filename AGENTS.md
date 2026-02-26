# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

WhidbeyWave.com is a community hub for Whidbey Island, WA. It serves events, news, a marketplace, barter board, community forum, local recommendations/reviews, a newsletter, and live ferry status. The site is deployed on Vercel.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS 3 with a custom PNW-themed design system (see below)
- **Database:** Supabase (Postgres with Row Level Security)
- **Auth:** Supabase Auth (magic link + Google OAuth)
- **Email:** Resend (transactional emails and weekly digest)
- **External API:** WSDOT Ferry Schedule API for live ferry status
- **Fonts:** Playfair Display (headings) and Lora (body), loaded via Google Fonts

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Serve production build locally
npm run lint      # ESLint via next lint
```

There is no test framework configured in this project.

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project credentials (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Admin-level Supabase key (server-side only, bypasses RLS)
- `RESEND_API_KEY` — Resend email service key
- `WSDOT_API_KEY` — Washington State DOT ferry API key
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL (used in email links and OAuth redirects)
- `ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL` — Admin inbox for notifications
- `CRON_SECRET` — Bearer token protecting the weekly digest cron endpoint

## Architecture

### Routing (App Router)

All pages live under `app/`. Key routes:

- `/` — Homepage with hero, quick-links, weather widget, and preview cards for events/news/listings
- `/events` — Community calendar (reads approved events from Supabase `event_submissions` table)
- `/news` — Blog-style news (currently hardcoded in `lib/data.ts`)
- `/marketplace`, `/barter` — Buy/sell and barter boards
- `/forum`, `/forum/[id]` — Community forum with categories and threaded replies
- `/recommendations` — Local business/place recommendations with reviews
- `/newsletter` — Newsletter signup (stores subscribers in Supabase, sends welcome via Resend)
- `/ferry` — Live ferry schedule/status from WSDOT API
- `/submit-event`, `/submit-listing` — Public submission forms
- `/admin/events` — Admin moderation panel for event submissions
- `/auth/callback` — OAuth/magic-link callback handler
- `/profile` — User profile page
- `/search` — Site-wide search
- `/feed.xml` — RSS feed (route handler)

### API Routes (`app/api/`)

All API routes are Next.js Route Handlers (POST or GET):

- `api/events/submit` — Saves event to Supabase, emails admin + submitter receipt via Resend
- `api/events/moderate` — Admin approves/rejects events, emails submitter on approval
- `api/contact` — Contact form → emails admin via Resend
- `api/listings/submit` — Marketplace listing → emails admin + seller receipt
- `api/newsletter` — Newsletter signup → sends welcome email
- `api/newsletter/send-digest` — **Cron-triggered** (Vercel cron, Mondays 9am PT). Fetches confirmed subscribers via service role key, builds personalized HTML digest with upcoming events + news + forum activity, sends in batches of 10
- `api/forum/reply` — Authenticated reply insertion; notifies original post author via email
- `api/ferry-status` — Proxies WSDOT ferry data, cached 5 minutes

### Data Layer

- **`lib/supabase.ts`** — Exports a browser singleton (`supabase`) for client components and a `createServerClient()` factory for server components. Also exports auth helpers (`signInWithMagicLink`, `signInWithGoogle`, `signOut`, `getUser`). The `isConfigured` flag lets the app gracefully degrade when Supabase credentials are missing.
- **`lib/data.ts`** — Hardcoded demo data (events, news posts, marketplace listings) plus helper functions (`formatDate`, `formatShortDate`) and the `categoryColors` map. The homepage and news page still read from this file; events page reads from Supabase.
- **`lib/db-types.ts`** — TypeScript types for all Supabase tables (newsletter, forum, recommendations, reviews, event submissions).
- **`lib/ferry.ts`** — WSDOT Ferry API client. Exports `fetchFerryBarStatus()` (lightweight, alerts only) for the weather widget status bar and `fetchFerryPageData()` (full schedule + alerts) for the `/ferry` page. Parses .NET JSON date format from WSDOT.
- **`lib/whidbey-zips.ts`** — Set of valid Whidbey Island zip codes and `isWhidbeyLocal()` helper. Used by forum and recommendations for "local" badges.

### Database Schema

Two schema files exist:

- `supabase/schema.sql` — Older/simpler version
- `supabase-schema.sql` (root) — Current authoritative schema with full RLS policies, triggers, and indexes

Key tables: `event_submissions`, `newsletter_subscribers`, `forum_categories`, `forum_posts`, `forum_replies`, `recommendations`, `reviews`.

RLS pattern: public read for most tables, authenticated insert for forum content, service role for admin operations (digest cron, moderation).

### Auth Flow

Supabase Auth with magic link and Google OAuth. `AuthProvider` (React context in `components/AuthProvider.tsx`) wraps the app, provides `useAuth()` hook (`user`, `loading`, `signOut`). After login, `ZipPrompt` component prompts users to enter their zip code (stored in `user_metadata`). Forum reply API validates auth via Bearer token from the client session.

### Components

- **`AuthModal.tsx`** — Login/signup modal (magic link + Google)
- **`AuthProvider.tsx`** — Auth context provider + `useAuth()` hook
- **`ZipPrompt.tsx`** — Post-login zip code collection modal
- **`Navbar.tsx`** / **`Footer.tsx`** — Site-wide layout
- **`WeatherTideWidget.tsx`** — Displays weather, tide, and ferry status bar on homepage
- **`EventsFilter.tsx`** — Tag/category filtering for events page
- **`EventRsvpButton.tsx`** — RSVP interaction for events
- **`NewsCommentSection.tsx`** — Comments on news articles
- **`ShareButton.tsx`** — Social sharing
- **`LocalBadge.tsx`** — "Local" badge shown when user's zip is a Whidbey zip
- **`forum/NewPostForm.tsx`** / **`forum/ReplyForm.tsx`** — Forum interaction forms

### Scheduled Jobs

A Vercel cron (`vercel.json`) hits `GET /api/newsletter/send-digest` every Monday at 9am PT. It is protected by either the `x-vercel-cron` header or a `Bearer` token matching `CRON_SECRET`.

## Design System

The Tailwind config (`tailwind.config.ts`) defines a Pacific Northwest-themed palette:

- **`forest-*`** — Deep green (primary brand)
- **`sound-*`** — Slate blue (secondary)
- **`amber-*`** — Golden-hour ochre (highlights)
- **`terra-*`** — Terracotta (accent)
- **`parchment-*`** — Warm cream (backgrounds)

Custom shadow scale: `shadow-warm-sm`, `shadow-warm`, `shadow-warm-md`, `shadow-warm-lg`.

Global CSS (`app/globals.css`) defines reusable component classes: `.btn-primary`, `.btn-secondary`, `.card`, `.section-title`, `.section-subtitle`, `.badge`.

Always use these custom colors and component classes rather than default Tailwind colors. The background is `bg-parchment-50` and body text is `text-stone-800`.

## Key Conventions

- API routes create fresh Supabase clients per request (not the singleton) using `createClient()` directly from `@supabase/supabase-js`
- Email templates are inline HTML strings within route handlers (no template engine)
- The `categoryColors` map in `lib/data.ts` must be updated when adding new content categories
- Ferry route IDs: Mukilteo–Clinton = 7, Port Townsend–Coupeville = 8
- `trailingSlash: true` is enabled in `next.config.js`
- Path alias `@/*` maps to project root (e.g., `@/lib/supabase`, `@/components/Navbar`)
