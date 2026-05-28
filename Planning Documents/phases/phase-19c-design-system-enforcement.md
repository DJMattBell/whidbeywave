# Phase 19c — Design System Enforcement + Spine Cleanup

**Status: queued. Third phase in the consolidation track. Absorbs carries from 19a and 19b retros.**

## Goal

Stop accumulating partial token adoption. Close the loops opened by 19a and 19b retros so the consolidation track ends clean — no carries trailing into Phase 20+. After 19c, the design system is *enforced* (not just available), the notification spine has *one path* (not two), and every retro carry from 19a/b is either closed or has its own phase file.

## Scope (10 items, four groups)

### Group A — Design system enforcement (original 19c)

1. **EmptyState component adoption sweep.** ~15 inline empty states across the codebase still use ad-hoc markup. Replace each with `<EmptyState>` from `components/EmptyState.tsx`. Grep targets: any JSX returning a div with text like "No results", "Nothing yet", "No upcoming". Each replacement preserves the current copy and Lucide icon.

2. **DataStatus integration on live-data surfaces.** `components/DataStatus.tsx` was built per error-states.md but never wired in. Add to: FerryLiveBoard, tides page, WeatherTideWidget. Shows "Last updated 2 min ago" with refresh affordance and "On Island Time" framing for stale data.

3. **ESLint rule banning `red-*` Tailwind classes.** Phase 13 swept red→terra. Without enforcement, contributors will re-introduce. Add custom rule via `eslint-plugin-tailwindcss` or a regex restriction. Allow-list: `.badge-now` in globals.css uses red intentionally. Document in CONTRIBUTING.md.

4. **Extract `normalize()` to lib/news.ts.** Currently duplicated in 4 files (news/page.tsx, news/[slug]/page.tsx, guides/page.tsx, guides/[slug]/page.tsx). Single source of truth.

5. **Extract DateStrip from EventsFilter.tsx.** EventsFilter is 500+ lines. The horizontal date selector is a self-contained subtree. Move to `components/DateStrip.tsx`. Verify rendering identical at 375×812.

6. **CLS min-height guards on events/news grids.** Phase 3 Definition of Done required these but they were silently dropped. Add `min-h-[280px]` (or matching card height) on grid containers for events and news on the home page. Verify CLS < 0.05.

### Group B — Listing-alert convergence (carry from 19a retro — Option 1 chosen)

7. **Migrate anonymous listing alerts to authenticated path.** The 19a retro left `listing_alerts` (anonymous email) and `notification_preferences` (authenticated) as two parallel systems. Decision made: require auth for listing alerts. Steps:
   - Send one-time transition email to every row in `listing_alerts`: "Sign in to keep getting alerts. Anyone not signed in by [date + 60 days] will be unsubscribed." Use a one-off Resend send, not the notification engine.
   - Add a `migrated_to_user_id` nullable column on `listing_alerts` so re-subscriptions through the auth flow can be linked back.
   - Update `ListingAlertSubscription.tsx` to require sign-in. Replace the email input with an "Sign in to subscribe" CTA when unauthenticated, using the error-states.md "Sign in to continue" pattern. When authenticated, submit creates a row in `notification_preferences` for event_type `new_listing_in_my_area`.
   - 60 days after deploy: delete remaining `listing_alerts` rows where `migrated_to_user_id IS NULL` and drop the table. This is a separate scripted task; queue it as a calendar reminder, don't ship the deletion in 19c.
   - Update AGENTS.md to document that all listing notifications now route through `notify()`.

### Group C — Notification spine cleanup (carries from 19b retro)

8. **Bell badge realtime or poll.** The 19b retro flagged that the unread count is fetched once on mount; long-open tabs go stale. Implement Supabase Realtime subscription on `notification_log` filtered to `user_id = current_user AND read_at IS NULL`. Increments the badge when a new row arrives. If Realtime adds too much complexity, fall back to a 60-second poll interval on `/api/notifications/unread-count` (acceptable tradeoff, document in retro which path was taken and why).

9. **`/api/notifications/test` event_type validation + CONTRIBUTING.md doc.** The 19b retro flagged both:
   - Add a hard event_type allowlist in the route. Unknown types return HTTP 400 with the list of valid types in the error body. Source of truth: a const exported from `lib/notifications.ts` listing all event types the engine knows how to handle.
   - Add "Debugging push notifications" section to CONTRIBUTING.md with the curl example currently in JSDoc, plus a list of valid event_types and a note about admin auth.

### Group D — Pre-submit consent moment (raised in the 19b audit, not previously routed)

10. **Pre-submit name/town disclosure on recommendations.** The 19b retro moved the first-time recommender prompt to *post*-submission. The original spec called for pre-submission because the prompt was about *consent* ("your name and town will appear publicly"), not about feature opt-in. Audit the current submit flow:
    - If the existing UI already shows the user's display name + town visibly above the submit button (so a user couldn't reasonably miss what they're publishing), this item is closed with a one-line retro note confirming the disclosure is adequate.
    - If not, add a small inline note above the submit button: "This recommendation will be posted as [Display Name] from [Town]." Static, every submission, not a one-time prompt. No friction added, no flag stored.

### Out of scope

- Bottom-sheet reply pattern for forum (feature, separate phase)
- "Ask the island" sticky prompt card (feature)
- Tap-to-zoom lightbox for ImageGallery (feature)
- Display-size departure times (feature decision, not enforcement)
- Visual tide chart (feature)
- Admin `.input-base` sweep and card-list patterns for admin tables — moved to a follow-up admin polish phase
- PersonaSelector deletion — gated on Phase 18 production verification, separate decision
- `business_id` migration for recommendations — Phase 22
- Anonymous listing alert deletion script — calendar reminder, not 19c scope (only the migration ships here)

## Files to Read

- `components/EmptyState.tsx`, `components/DataStatus.tsx`
- All files matching `grep -lE "(No results|Nothing yet|No upcoming)" app/ components/`
- `components/FerryLiveBoard.tsx`, `app/tides/page.tsx`, `components/WeatherTideWidget.tsx`
- `app/news/page.tsx`, `app/news/[slug]/page.tsx`, `app/guides/page.tsx`, `app/guides/[slug]/page.tsx`
- `components/EventsFilter.tsx`
- `app/page.tsx`
- `eslint.config.js`
- `components/ListingAlertSubscription.tsx`, `app/api/listing-alert/route.ts`, `app/api/listings/subscribe/route.ts`, `app/api/listings/unsubscribe/route.ts`
- `lib/notifications.ts` (for event_type allowlist export)
- `components/Navbar.tsx`, `app/api/notifications/unread-count/route.ts`, `app/api/notifications/test/route.ts`
- `app/recommendations/page.tsx`, `app/api/recommendations/route.ts`
- `CONTRIBUTING.md`, `AGENTS.md`
- `Planning Documents/design/DESIGN.md`, `empty-states.md`, `error-states.md`

## Planning Prompt

```
Phase 19c goal: design system enforced, notification spine has one path, all 19a/b carries closed or routed.

Specs (all ten must complete in this phase — no deferrals; if any item can't, flag it before starting):

Group A — Design system

1. EmptyState adoption
   - Enumerate every inline empty-state in the codebase first (expect ≥15)
   - Replace each with <EmptyState> from components/EmptyState.tsx
   - Preserve copy and icon; only the wrapper changes

2. DataStatus integration
   - Add <DataStatus lastUpdated={...} stale={...} /> to FerryLiveBoard, tides page, WeatherTideWidget
   - "On Island Time" framing for stale per error-states.md
   - Define stale thresholds per surface (ferry: 5min, weather: 15min, tides: 30min — confirm in plan)

3. ESLint rule
   - Ban `red-*` Tailwind classes in className strings
   - Allow .badge-now exception in globals.css
   - Document in CONTRIBUTING.md
   - Run lint; expect zero violations

4. normalize() to lib/news.ts
   - Single source of truth; remove 4 duplicates

5. DateStrip extraction
   - components/DateStrip.tsx, prop-driven
   - Visual parity at 375×812

6. CLS guards
   - app/page.tsx events and news grids: min-h matching card render height
   - Lighthouse CLS < 0.05 on home

Group B — Listing-alert convergence (option 1: require auth)

7. ListingAlertSubscription requires auth
   - Migration: add `migrated_to_user_id` nullable column on listing_alerts
   - Component: when unauthenticated, render "Sign in to subscribe" CTA per error-states.md
   - When authenticated, submit creates a row in notification_preferences with event_type=new_listing_in_my_area and scope from category selection
   - Send one-time transition email to every existing listing_alerts row: "Sign in by [date+60d] to keep getting alerts" — use Resend directly, not notify() (these aren't users yet)
   - Update AGENTS.md: all listing notifications route through notify()
   - Do NOT drop listing_alerts table in this phase — that's a calendar-reminder cleanup 60 days post-deploy

Group C — Notification spine cleanup

8. Bell badge live updates
   - Preferred: Supabase Realtime subscription on notification_log filtered to current user + read_at IS NULL
   - Fallback if Realtime is too complex: 60-second poll on /api/notifications/unread-count
   - Document choice and reasoning in retro
   - No regression in bell badge accuracy

9. /api/notifications/test hardening
   - Export const KNOWN_EVENT_TYPES from lib/notifications.ts
   - Route validates event_type against this list; returns 400 with list on miss
   - Add "Debugging push notifications" section to CONTRIBUTING.md with curl example, valid event_types, admin auth note

Group D — Recommendation consent

10. Pre-submit name/town disclosure
    - Audit existing UI on recommendation submit flow
    - If display name + town are already visible above submit button: close as confirmed-adequate in retro
    - If not: add static inline note "This recommendation will be posted as [Name] from [Town]." Not a one-time prompt — appears every time
    - No flag stored, no friction

Constraints:
- No feature work in this phase
- No visual regressions — every refactor must look identical
- Lint rule allows only the documented .badge-now exception
- DateStrip extraction keeps EventsFilter functionally identical
- Listing-alert migration is auth-required going forward; deletion of old table is NOT in scope
- If item 8 needs Realtime, verify Supabase plan supports the connection count; if not, use poll

Plan output: 
- Empty-state enumeration list (sites to refactor)
- DataStatus stale thresholds confirmed per surface
- ESLint rule config (which package, which regex)
- listing_alerts → notification_preferences migration SQL
- Draft of the transition email body
- Bell badge mechanism chosen (Realtime vs poll) with reasoning
- KNOWN_EVENT_TYPES export plan
- Audit result for item 10: is current UI adequate, or does the inline note need to be added?
```

## Iteration Checklist

- [ ] Empty-state enumeration is complete (≥15 sites)
- [ ] DataStatus thresholds defined per surface
- [ ] ESLint rule allows only the documented exception (.badge-now)
- [ ] DateStrip extraction is mechanical — no behavior changes
- [ ] CLS guard heights match real card render heights
- [ ] Listing-alert migration preserves existing subscribers via transition email
- [ ] AGENTS.md updated to reflect single notification path
- [ ] Bell badge mechanism (Realtime or poll) chosen with stated reason
- [ ] KNOWN_EVENT_TYPES exported from lib/notifications.ts, not redefined in the route
- [ ] Item 10 audit result is explicit (closed-adequate OR inline note added)

## Definition of Done

Design system:
- [ ] `grep -rE "(No results|Nothing yet|No upcoming|Nothing to see)" app/ components/` returns only refs inside `<EmptyState>` props
- [ ] Ferry, tides, and weather all show a DataStatus indicator
- [ ] `npm run lint` flags any newly introduced `red-*` class
- [ ] `normalize()` exists once in lib/news.ts; no duplicates
- [ ] EventsFilter.tsx is shorter; DateStrip.tsx renders identically
- [ ] Lighthouse CLS on home < 0.05

Spine cleanup:
- [ ] Unauthenticated users on `/marketplace` see "Sign in to subscribe" instead of email input
- [ ] Authenticated subscribe creates notification_preferences row (verify via Supabase dashboard); listing_alerts no longer receives new inserts
- [ ] Transition email sent to all existing listing_alerts emails (verify count matches table row count)
- [ ] AGENTS.md notification-routing section reflects single path
- [ ] Bell badge updates within 60s (Realtime) or 60s (poll) of receiving a notification — document which
- [ ] POST `/api/notifications/test` with bogus event_type returns 400 + valid-types list
- [ ] CONTRIBUTING.md has "Debugging push notifications" section

Recommendation consent:
- [ ] Item 10 audit documented in retro; if note was added, screenshot included

Build:
- [ ] `npm run build` passes
- [ ] `npm run smoke` passes
- [ ] Retrospective written, including which 19a/b carries are now closed
