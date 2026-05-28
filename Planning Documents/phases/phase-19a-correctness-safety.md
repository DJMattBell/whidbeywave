# Phase 19a — Correctness & Safety

**Status: queued. First phase in the consolidation track.**

## Goal

Fix the bugs and risks that compound on every new feature shipped on top. This is not new surface — it's safety. The four items below are the ones the planning team rated as "would embarrass us if exploited or surfaced."

## Scope (the only four things in this phase)

1. **XSS-safe email layout.** `lib/email.ts` `emailLayout()` interpolates user-supplied values (names, post titles, business names) into HTML without escaping. Wire `lib/escapeHtml.ts` through every dynamic interpolation in the four template functions (emailConfirmation, emailWelcome, emailApproval, emailForumReply). Add a comment block at top of lib/email.ts documenting which interpolations are user-supplied.

2. **ListingAlertSubscription → notify() migration.** Phase 15 set the rule: all per-user event notifications route through `notify()`. Phase 16 retro flagged that ListingAlertSubscription was never migrated. Existing subscribers are stranded on direct Resend. Migration plan:
   - Add a `new_listing_in_my_area` event_type to notification_preferences default rows
   - Write a one-time migration script: for each row in old ListingAlertSubscription table, insert matching notification_preferences row with scope `{ categories: [...], towns: [...] }` and channel='email', enabled=true
   - Refactor any code path that currently calls Resend for listing alerts to call notify() instead
   - Drop the old ListingAlertSubscription table only after migration verified in production (this phase keeps it; deletion is a follow-up)

3. **Flash-give expiry cron.** Phase 16 added `flash_give_duration` but no enforcement. Add a Vercel cron at `/api/listings/expire-flash-gives` running hourly. Query listings where `is_free=true` and `created_at + flash_give_duration < now()` and `status != 'expired'`; mark them expired. Protect with `CRON_SECRET`. Surface "Expired" badge on listing detail for transparency.

4. **Admin mobile QA at 375×812.** Phase 11 retro: never done. Walk every page under `/admin/*` at iPhone SE viewport. For each that breaks (overflow, untappable controls, unreadable text), fix in place with `.input-base`, responsive grid columns, or a "stacked on mobile" treatment. No redesign — just make it usable. Document each fixed page in retro.

## Out of scope

- Bulk approve/reject UI (Phase 11 retro #2) — that's a feature, not a correctness issue
- Inputs-to-.input-base sweep for admin (~100 instances) — that's design-system work, goes to 19c
- Anything not in the four items above

## Files to Read

- `lib/email.ts`, `lib/escapeHtml.ts`
- `components/ListingAlertSubscription.tsx`, `lib/notifications.ts`
- All API routes that call `resend.emails.send` for per-user event notifications (grep)
- `vercel.json` (for cron registration)
- Every file under `app/admin/`
- `Planning Documents/design/DESIGN.md`, `error-states.md`
- `supabase-schema.sql` for ListingAlertSubscription and notification_preferences tables

## Planning Prompt

```
Phase 19a goal: fix four correctness & safety items, nothing more.

Specs (each must be completed in this phase — no deferrals):

1. XSS-safe email layout
   - lib/email.ts: wrap every {dynamic_value} interpolation in escapeHtml()
   - Add header comment listing which interpolations are user-supplied
   - Verify with a test value containing <script>alert(1)</script> rendering as text

2. ListingAlertSubscription → notify() migration
   - Add migration SQL creating new_listing_in_my_area event_type defaults
   - Write supabase/migrations/migrate-listing-alerts-to-notify.sql for one-time data move
   - Refactor any Resend call for listing alerts to notify()
   - Keep old table — deletion is a separate follow-up phase
   - All new subscribers go through notify() going forward

3. Flash-give expiry cron
   - New route /api/listings/expire-flash-gives (GET, Bearer CRON_SECRET)
   - Hourly cron in vercel.json
   - Status transition: active → expired (don't delete)
   - "Expired" badge styling per DESIGN.md badge patterns
   - Hide expired flash-gives from "Neighbors are giving" home section

4. Admin mobile QA at 375×812
   - Walk: /admin (dashboard), /admin/events, /admin/listings, /admin/news, /admin/feedback, /admin/scrapers
   - For each broken page, document the break and the fix
   - Use existing tokens — no new components
   - Tables: use card-list pattern on mobile per DESIGN.md tables section
   - Headers: ensure parchment headers from Phase 11 hold at 375px

Constraints:
- No new features
- No bulk-action UI (defer)
- No admin input class sweep (defer to 19c)
- No old ListingAlertSubscription table drop (defer)
- Each of the four items must reach Definition of Done in this phase

Plan output: file list per item, migration SQL for items 2 and 3, fix list for item 4. Flag any item that can't be fully completed inside this phase so we can decide before starting.
```

## Iteration Checklist

- [ ] All four items in plan, none reduced in scope
- [ ] Migration SQL is reversible
- [ ] Cron is protected by CRON_SECRET
- [ ] Email escaping covers all four template functions
- [ ] Admin mobile pass enumerates every page touched
- [ ] No new components introduced

## Definition of Done

- [ ] Render an email template with `<script>` in a user-supplied field; output shows the literal string
- [ ] Submit a new listing alert through the marketplace UI; row appears in notification_preferences, not the old ListingAlertSubscription table
- [ ] Existing ListingAlertSubscription rows visible in notification_preferences after migration
- [ ] Create a flash-give with duration=24h, manually set created_at to 25h ago, run cron, listing shows Expired
- [ ] Every /admin/* page renders cleanly at 375×812 — no horizontal scroll, all controls tappable
- [ ] `npm run build` passes
- [ ] `npm run smoke` passes
- [ ] Retrospective written; if any of the four items had to defer, it gets its own follow-up phase file before this one is marked done
