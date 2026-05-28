# Phase 14 — Observability & Tooling

## Goal

Add the operational tooling the strategic phases (15–17) need: error tracking, analytics, smoke tests, scraper monitoring. Also add the shared `<DataStatus>` and `<EmptyState>` components that consolidate scattered patterns.

**Why now and not earlier:** the polish phases didn't strictly need this. Phase 15 (notifications) and Phase 16 (flash gives) do — we can't ship them confidently without error tracking and analytics. Inserting it here means it's earned its place rather than gathering dust.

## Files to Read

- `package.json`
- `next.config.js`
- All scrapers in `lib/scrapers/`
- `Planning Documents/design/error-states.md` (DataStatus pattern)

## Planning Prompt

```
Phase 14 goal: operational visibility and shared components before strategic features begin.

Specs:

1. Sentry:
   - Install @sentry/nextjs
   - Configure with SENTRY_DSN env var. Add to .env.local.example
   - Source maps uploaded on Vercel build
   - Browser and server error capture both on
   - Performance monitoring on, sample rate 0.2 (cost control)
   - Wire to error boundaries on every layout

2. Plausible (privacy-respecting analytics):
   - Add via script tag in layout.tsx
   - NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var
   - Auto page-view tracking
   - Custom events: persona-selected, notification-opt-in, flash-give-submitted, recommendation-submitted, ferry-status-viewed, listing-contact-clicked, event-rsvp-clicked

3. Playwright smoke tests:
   - Install @playwright/test, install browsers
   - playwright.config.ts targeting localhost:3000
   - tests/smoke/ directory with one spec per surface
   - npm script: `smoke` runs all; `smoke:phase-N` runs phase-specific
   - Initial smoke suite covers: home renders 200, /events renders 200, /forum renders 200, /marketplace renders 200, /ferry renders 200, BottomTabBar visible at 375px, FAB visible at 375px

4. Scraper monitoring:
   - New migration: scrape_log (id, source, started_at, finished_at, event_count, status enum 'success'|'partial'|'failed', error text). RLS service-role only.
   - Update each scraper to write a row on every run (wrap in try/finally so failures still log)
   - New page /admin/scrapers: lists sources with last-success time and colored status dot (green <24h, amber <7d, red >7d). Admin auth required.
   - New api route /api/scrape-run-log (service role)

5. Shared components:
   - components/EmptyState.tsx (consumes empty-states.md patterns)
   - components/ErrorState.tsx (consumes error-states.md patterns — all seven kinds)
   - components/DataStatus.tsx (live / cached / on-island-time per error-states.md)
   - Replace scattered empty-state JSX with EmptyState (grep for existing patterns first; report findings)
   - Replace scattered inline error banners with ErrorState where the kind matches one of the seven

6. CONTRIBUTING.md updates:
   - Document Sentry/Plausible config
   - Document Playwright smoke test pattern
   - Document EmptyState/ErrorState/DataStatus components

Constraints:
- Do not change any existing feature behavior
- No new feature work — pure tooling
- Sentry sample rate at 0.2 to control costs
- Playwright tests run locally and can be added to Vercel later — don't add CI now

Plan output: list dependencies to install, new migrations, new components, and which existing components/files get refactored to consume the new shared components.
```

## Iteration Checklist

- [ ] Sentry installed and verified working (trigger a test error)
- [ ] Plausible installed and verified (page view appears)
- [ ] Playwright installed; `npm run smoke` passes
- [ ] scrape_log migration applies cleanly
- [ ] /admin/scrapers shows 21 sources with status dots
- [ ] EmptyState, ErrorState, DataStatus components match canonical docs
- [ ] Existing empty-state JSX replaced where appropriate (not exhaustively — report what was changed)

## Definition of Done

- `npm run smoke` passes
- Trigger a test error → appears in Sentry within 30s
- Visit home → page view in Plausible
- /admin/scrapers (signed in) shows all sources with status
- Manually run one scraper → row appears in scrape_log
- `npm run build` passes
