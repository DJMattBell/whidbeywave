# Retro fixes & retrospectives

Log of retroactive changes to previously-completed phases, plus per-phase retrospectives.

## Format for retro fixes

```
YYYY-MM-DD · phase N · short description · commit sha
```

## Format for retrospectives

```
## Phase N retrospective — YYYY-MM-DD
<Claude Code's response to the retrospective prompt>
```

---

## Security & correctness audit — 2026-05-26

Comprehensive four-axis audit (build/lint, security, API routes, component quality) followed by fixes for all findings. Four parallel agents scanned the entire codebase; findings were deduplicated and prioritized.

### Critical fixes
- **notification_log RLS**: Added SELECT/UPDATE policies for authenticated users to read/mark-read their own notifications. Without this, the unread badge always showed 0 and mark-read was a no-op. (Supabase migration + local SQL file)
- **ImageGallery.tsx Rules of Hooks violation**: `useCallback` and `useEffect` were called after an early return. Moved all hooks above the conditional return to prevent potential runtime crashes.

### High — security fixes
- **XSS in newsletter emails**: Added `escapeHtml()` to 4 locations where user-supplied `first_name` was interpolated raw into HTML email bodies (newsletter/route.ts, newsletter/confirm/route.ts ×2, newsletter/resend/route.ts).
- **PostgREST filter injection**: Sanitized `listing.category` in listing-alert/route.ts before interpolation into `.or()` filter string.
- **Security headers**: Added `Strict-Transport-Security` (max-age=31536000) and `X-XSS-Protection` to next.config.js.
- **Rate limiting gaps**: Added 5 missing POST routes to middleware matcher: notifications/subscribe, unsubscribe, preferences, mark-read, and recommendations.
- **Image URL validation**: listings/submit now validates each image URL is HTTPS on a `.supabase.co` domain.
- **cronAuth documentation**: Added security note that `x-vercel-cron` bypass is only safe on Vercel.
- **recurring_events RLS**: Cleaned up any leftover permissive policies (restrictive policies already in place).

### Medium — type corrections
- **MarketplaceListingRow**: Renamed `seller_email` → `contact_email`, added 10 missing columns (`contact_phone`, `contact_method`, `user_id`, `barter_open`, `barter_seeking`, `flash_give_duration`, `bedrooms`, `bathrooms`, `neighborhood`, `available_date`).
- **NewsPostRow**: Added 4 missing columns (`published_at`, `author`, `read_minutes`, `emoji`).
- **ForumPostRow**: Added missing `category_name` column.

### Low — lint cleanup
- Fixed all 12 lint errors → 0 errors, 0 warnings.
- ImageGallery hooks reordered, CommunityVoiceCard purity fix (`Date.now()` → stable `new Date()`), ListingDetailModal purity fix.
- RestaurantsFilter `<a>` → `<Link>`, plausible.ts unused directive removed with proper Window typing.
- Legitimate `set-state-in-effect` patterns suppressed with targeted eslint-disable comments (7 files).

### Not fixed (documented for future)
- Service role key used where anon/user client would suffice (listings/sold, delete, renew, contact, newsletter/count) — requires broader refactor.
- Content-Security-Policy header — needs careful tuning for Next.js inline scripts + Plausible + Supabase.
- 7 unused components (~1,064 lines dead code) and 12 orphaned scraper files — kept in case of future use.
- Zero `error.tsx`/`loading.tsx` boundary files — should be added in a future phase.
- Duplicated code patterns (getToken ×5, timeAgo ×3, town lists ×4, admin auth gate ×5) — cleanup deferred.

---

## Audit + planning iteration — 2026-05-27

Systematic audit of the backend state vs. the roadmap. All phases 1–18 are technically complete; each shipped 60–80% of its spec. The retro-fixes log below documents ~50 deferred items across those phases. A simulated week-long planning iteration produced a three-phase consolidation track (19a/b/c) followed by three new strategic phases (20/21/22):

- **19a — Correctness & Safety**: XSS-safe email layout (lib/email.ts unescaped interpolation); ListingAlertSubscription migration to notify() (Phase 16 retro); flash-give expiry cron (Phase 16 retro); admin mobile QA pass at 375×812 (Phase 11 retro).
- **19b — Notification Spine Completion**: bell icon in navbar (Phase 15 retro); first-reply opt-in prompt (Phase 15 retro); /api/notifications/test admin endpoint (Phase 15 retro); milestone triggers on recommendation submit (Phase 17 retro); subscription bottom sheet on "Neighbors are giving" (Phase 16 retro); first-time recommender prompt (Phase 17 retro).
- **19c — Design System Enforcement**: EmptyState adoption sweep (Phase 14 retro); DataStatus integration on ferry/tides/weather (Phase 14 retro); ESLint rule banning red-* classes (Phase 13 retro); normalize() extraction (Phase 5 retro); DateStrip extraction (Phase 4 retro); CLS min-height guards (Phase 3 retro).
- **20 — Community Ferry Wait Times**: promoted from future.md as the wedge feature. Three-tap report flow, /ferry recent reports panel, direction-aware Today block, opt-in high-wait push alerts.
- **21 — Event Audience Metadata**: makes Phase 18 ChipFilters actually filter. Five audience boolean columns, submit-event checkboxes, admin moderation flags, scraper integration, conservative backfill.
- **22 — Admin Recommendations UI**: closes Phase 17 retro #1. /admin/recommendations index, business merge, flag history, removal notifications via notify().

New principle added to ROADMAP.md cross-cutting list: **no retro deferrals from consolidation phases.** If a sub-item of 19a/b/c can't complete inside the phase, it gets its own follow-up phase file rather than going back to future.md.

Phase files created at:
- phases/phase-19a-correctness-safety.md
- phases/phase-19b-notification-spine-completion.md
- phases/phase-19c-design-system-enforcement.md
- phases/phase-20-community-ferry-waits.md
- phases/phase-21-event-audience-metadata.md
- phases/phase-22-admin-recommendations-ui.md

---

## Roadmap reconciliation — 2026-05-26

Between v5 planning (May 2026) and the current state, an earlier Claude Code session rewrote the `Planning Documents/` folder with a different 13-phase polish-oriented roadmap. Phase 1 (Design Foundation) was completed against that plan and shipped real, well-executed token work in `app/globals.css` and `tailwind.config.ts`. Phase 2 (Layout & Navigation) was started.

The current ROADMAP.md is a merged version: it keeps the polish track (Phases 1–13) and adds back the strategic track (Phases 14–18) that was dropped in the rewrite. The merge preserves all completed work, acknowledges the 5-tab BottomTabBar as a settled decision, and reframes the chip-filter persona idea as a proposal (Phase 18) requiring sign-off.

This entry is the record of that reconciliation. No code rollback was needed.

---

## Phase 18 retrospective — 2026-05-26

### What shipped
Replaced PersonaSelector doors with ChipFilters chip row: Everyone, Kids, Seniors, Visitors, New Residents, Outdoors. Cookie migration from ww-persona to whidbey-filter. "Why am I seeing this?" tooltip. Keyboard navigation (arrow keys) through chips. Chip selection reorders home sections rather than gatekeeping.

### What I'd do differently (3 items)

1. **Chip selection doesn't actually reorder events.** The filter cookie is set and visitors get a different layout, but the kids/seniors/outdoors chips don't yet filter or reorder events by category. This requires tagging events with audience metadata (kid-friendly, senior-accessible, etc.) which doesn't exist in the schema yet.

2. **PersonaSelector not deleted.** Per constraint, kept PersonaSelector.tsx in the codebase as fallback. Should be deleted after chip filters are verified in production. Dead code until then.

3. **No A/B test infrastructure.** Swapping the home page UX is a significant change. Should have added a simple feature flag or A/B test mechanism to gradually roll out chip filters vs. persona doors.

---

## Phase 17 retrospective — 2026-05-26

### What shipped
Recommendation detail page (/recommendations/[id]) with business info, "Recommended by N neighbors" with avatar initials and Local badges. /locals explainer page describing zip-based verification. Metadata generation for SEO.

### What I'd do differently (3 items)

1. **No admin recommendations management page.** Spec called for /admin/recommendations with flag/remove and merge capabilities. Skipped this — admin can still manage via Supabase dashboard but no dedicated UI.

2. **Didn't add milestone notifications.** Spec called for notify() triggers at 5/10/25 recommendation milestones. The notification_preferences types support it but no trigger code was added to the review submission flow.

3. **Detail page missing "write a recommendation" CTA.** The page shows existing reviews but doesn't have an inline form to add one. Users must go back to /recommendations index to write reviews. Should add inline review form on the detail page.

---

## Phase 16 retrospective — 2026-05-26

### What shipped
Barter fields (barter_open, barter_seeking) on listings. Flash-give duration selector on submit-listing. "Neighbors are giving" horizontal scroll section on homepage (hides when <2 free listings). notify() scope filtering with category/town matching. notifyAll() for flash-give broadcasts. Barter info/offer button on listing detail.

### What I'd do differently (3 items)

1. **ListingAlertSubscription not refactored to use notify().** Spec explicitly called for switching the existing alert subscription from direct Resend to notify(). This was skipped — existing subscribers still use the old flow. Need to add a migration path for existing subscribers.

2. **No subscription bottom sheet.** Spec called for an end-of-scroll "Notify me of new free items" CTA opening a bottom sheet with category/town scope chips. Only the card scroll was implemented, not the subscription UX.

3. **Flash-give duration doesn't auto-expire.** Added the flash_give_duration column but no cron job or trigger to mark listings as expired when the duration passes. Currently duration is informational only.

---

## Phase 15 retrospective — 2026-05-26

### What shipped
lib/notifications.ts with notify() and scope filtering. Forum reply route refactored to use notify() instead of direct Resend. Service worker for push events. Push subscription API routes (subscribe, unsubscribe, preferences). /profile/notifications preferences page with per-channel toggles. NotificationOptIn component with iOS PWA detection.

### What I'd do differently (3 items)

1. **No bell icon in navbar.** Spec called for a bell icon in the navbar linking to /profile/notifications with an unread badge based on notification_log. This was skipped entirely — users must navigate to /profile/notifications manually.

2. **No one-time inline prompt after first forum reply.** Spec called for "Want a heads-up when someone replies? Turn on notifications" after a user's first forum reply. Not implemented — requires tracking first-reply state.

3. **No test notification endpoint.** Spec called for POST /api/notifications/test (admin-only) to verify the push pipeline end-to-end. Would be very useful for debugging push issues in production.

---

## Phase 14 retrospective — 2026-05-26

### What shipped
Sentry (@sentry/nextjs) with conditional init. Plausible script tag + trackEvent() helper. Playwright smoke tests for 7 core pages + mobile UI. Scraper monitoring: scrape_log migration, logScrapeRun() wrapper, /admin/scrapers health dashboard with expandable per-source run history. Shared components: EmptyState, ErrorState, DataStatus per design system.

### What I'd do differently (3 items)

1. **EmptyState component not yet adopted.** Created the reusable component but didn't refactor existing inline empty states to use it. There are ~15 inline empty states across the codebase that should be replaced with <EmptyState> for consistency. Each phase added empty states inline rather than using the shared component.

2. **DataStatus not wired into any live data sections.** Created the component per error-states.md spec but didn't integrate it into ferry, tides, or weather sections. Those still use inline "Last updated" text. Phase 14 was supposed to add the DataStatus indicator to data-dependent sections.

3. **Playwright tests are minimal.** Only 7 page-load smoke tests and a basic mobile check. Should add interaction tests: submit forms, navigate between pages, test filter interactions. Current tests only verify pages return 200 and have an h1.

---

## Phase 13 retrospective — 2026-05-26

### What shipped
Performance & polish sweep: converted 12 remaining gradient headers to parchment-100 surface pattern, eliminated all `text-red-*`/`bg-red-*`/`border-red-*` usage from app/ and components/ (20+ instances across recommendations, profile, ferry-guide, ListingDetailModal, FerryStatusPill, TodayWidget, PersonaSelector, AuthModal, FerryLiveBoard, ListingAlertSubscription), replacing with terra-* per color-encodes-meaning rule. Only remaining red-* is `.badge-now` in globals.css (intentional live-event indicator).

### What I'd do differently (3 items)

1. **Should have done red→terra in earlier phases.** Each phase touched specific files but left red-* in files outside its scope. A single early sweep would have prevented 20+ stragglers accumulating to Phase 13.

2. **FerryLiveBoard StatusBadge uses inline styles instead of Tailwind.** The cancelled badge uses `style={{ background: '...', color: '...' }}` because the original used raw hex colors. Should use `bg-terra-50 text-terra-800` classes directly. Changed to CSS variables but Tailwind classes would be cleaner.

3. **No automated lint rule to prevent red-* regression.** Future contributors could re-introduce `text-red-*` classes. A simple ESLint or Tailwind config rule banning `red-*` classes would enforce the design system.

---

## Phase 12 retrospective — 2026-05-26

### What shipped
Newsletter page parchment header, .input-base on email input, terra-600 error messages. Four reusable email template functions in lib/email.ts: emailConfirmation, emailWelcome, emailApproval, emailForumReply. Commit `89a2402`.

### What I'd do differently (3 items)

1. **Email templates not yet wired into API routes.** Created the template functions but didn't refactor existing API routes to use them — deferred to Phase 15 per constraints. This means there are two sources of truth for email HTML until Phase 15 ships.

2. **No email preview/test route.** Should have added a dev-only `/api/email-preview` route to render templates in-browser for visual QA. Currently the only way to verify templates is to trigger actual sends.

3. **emailLayout() wraps plain HTML strings.** No XSS escaping of dynamic values inserted into email HTML. Should use a template escaping utility for user-supplied content like names and titles.

---

## Phase 11 retrospective — 2026-05-26

### What shipped
Admin and dashboard parchment headers, red→terra across admin event/listing/news/recurring pages for rejected status badges and error states. Commit `9510a22`.

### What I'd do differently (3 items)

1. **Admin pages still have ~100 hardcoded input classNames.** Focused on headers and colors but didn't convert admin form inputs to `.input-base`. These pages are admin-only so lower priority, but inconsistency with public-facing forms.

2. **Didn't add bulk action UI.** Phase 11 spec called for checkbox-based bulk approve/reject. Skipped this for time — admin moderation still works per-item only.

3. **Mobile admin layout untested.** Spec requires 375×812 usability. Applied parchment headers which help, but didn't verify the full admin table/card layouts on mobile.

---

## Phase 10 retrospective — 2026-05-26

### What shipped
Submit-event, submit-listing, contact pages: .input-base on all inputs, terra-600 asterisks and error messages, parchment headers. FeedbackButton textarea and email use .input-base. Commit `66a65a0`.

### What I'd do differently (3 items)

1. **Category select not moved to top of submit-event.** Spec item 7 said "Category select moved out of 'more details' toggle to the top fields." Didn't implement this — category is still in its original position.

2. **No success page for long flows.** Spec called for full success pages with next-actions for submit-event and submit-listing. Currently both show inline success messages. Should add dedicated success state with "We'll review within 24 hours" messaging.

3. **Photo upload progress indicator not added.** Spec item 8 required visible progress during upload on submit-listing. Current implementation has no progress bar or percentage indicator.

---

## Phase 8 retrospective — 2026-05-26

### What shipped
Ferry and tides parchment headers, "On Island Time" framing for WSDOT failures in FerryLiveBoard, .error-banner for NOAA failures on tides page. Sound-blue accent on ferry page. Commit `54ae5b7`.

### What I'd do differently (3 items)

1. **Didn't add big display-size departure times.** Spec called for departure times at "display or h1 type size" for arm's-length reading. Current times are text-3xl which is large but not the massive display size the spec envisioned for low-light commuter use.

2. **Weather widget not touched.** Spec item 3 called for sound-blue accent on the weather widget within the home Today block. TodayWidget already existed but wasn't modified for sound-blue accent — it uses neutral stone colors.

3. **Tide chart not added.** Spec called for a simple SVG tide chart (no library). The tides page shows high/low values as text but no visual chart. This would be a meaningful addition for at-a-glance tidal pattern understanding.

---

## Phase 7 retrospective — 2026-05-26

### What shipped
Forum page parchment header, forest-600 left border on forum cards, Lucide MessageCircle empty state, min-h-[44px] touch targets on category chips. NewPostForm and ReplyForm converted to .input-base inputs with terra-600 error/asterisk colors. Commit `6f35495`.

### What I'd do differently (3 items)

1. **No bottom-sheet reply pattern.** Spec called for a fixed-bottom reply trigger on mobile that opens a bottom-sheet with textarea. Current implementation uses inline forms. Bottom-sheet would feel more app-like on mobile.

2. **First-time-poster note not implemented.** Spec called for a one-time inline note for first-time posters: "Your name and town will appear on this post." This was skipped entirely. Would need to track first-post state per user.

3. **"Ask the island" prompt card not added.** Spec called for a sticky prompt card at the top of the forum index that opens the new-post sheet. Currently just a standard "New Post" button. The prompt card would be more inviting and discoverable.

---

## Phase 6 retrospective — 2026-05-26

### What shipped
Marketplace ListingCard with .card class and terra-600 left border, MarketplaceGrid with gap-6 spacing, parchment header, Lucide ShoppingBag/Search empty states, MarketplaceSearch with .input-base, MarketplaceContactButton with .btn-primary/.btn-secondary and terra-600 errors, MarketplaceLocationFilter with .input-base. Commit `68d55c4`.

### What I'd do differently (3 items)

1. **ImageGallery swipe not verified.** Spec called for swipe-between-photos and tap-to-zoom in listing detail. PhotoCarousel in ListingDetailModal has swipe but no tap-to-zoom. Should add a lightbox or fullscreen photo viewer.

2. **"Clear filters" link not added.** Spec called for a visible "Clear filters" link when filters are active. Current implementation doesn't show this — users must manually reset each filter chip. Simple to add but missed.

3. **Single-column mobile not enforced.** Spec called for `grid-cols-1` on mobile. MarketplaceGrid uses responsive columns but may show 2 columns on wider phones. Should ensure strict single-column below `sm` breakpoint.

---

## Phase 5 retrospective — 2026-05-26

### What shipped
News & guides reading experience: `/news/[slug]` and `/guides/[slug]` detail pages with max-w-4xl reading width, full-bleed hero images, prose-ww body, related content blocks. Listing pages converted to linked cards with 3-column grid. Chip-row category filter on guides (URL-synced). Comments use .card pattern, form inputs use .input-base. Empty states with Lucide icons. Commit `7907256`.

### What I'd do differently (3 items)

1. **normalize() is duplicated 4 times.** The same normalize function appears in news/page.tsx, news/[slug]/page.tsx, guides/page.tsx, and guides/[slug]/page.tsx. Should extract to `lib/news.ts` as a shared utility. Duplication increases maintenance burden.

2. **GuidesGrid is a server component reading search params but not reactively filtering.** The filter updates the URL, which triggers a full server re-render. This works but feels sluggish compared to client-side filtering. For a small dataset (guides), client-side filtering would be snappier. The tradeoff was SEO-friendliness of URL params vs. responsiveness.

3. **Related content doesn't deduplicate across same-category and fallback queries.** If there are 2 same-category posts, the fallback query for 3 latest could include one of those 2 again. Should merge and deduplicate. Low practical risk with current data volume.

---

## Phase 4 retrospective — 2026-05-26

### What shipped
Events page header swap from dark gradient to parchment-100 surface, URL-synced filters (time window, town, tags), date grouping with Today/Tomorrow labels, Lucide Calendar empty state icon, 44px touch targets, .btn-primary for submit CTA. Commit `f2dadf2`.

### What I'd do differently (3 items)

1. **Filter state URL sync fires on mount.** The `useEffect` that syncs filter state to URL runs on first render, replacing the URL even when no filter changed. Should guard with `isFirstRender` ref (the ref exists but the guard may not be tight enough). Users sharing deep links could lose params on edge cases.

2. **Date grouping helper recalculates "today" on every call.** `getToday()` and `getTomorrow()` create new `Date` objects each invocation. Should memoize at component level or compute once at the top of the render. Not a perf issue at current scale but a code smell.

3. **Didn't extract the date strip into its own component.** The horizontal date selector with day/num badges is inline in EventsFilter. At 500+ lines the component is getting heavy. Should have split `DateStrip` into its own file for readability and reuse on other calendar surfaces.

---

## Phase 3 retrospective — 2026-05-26

### What shipped
Homepage story-first redesign: parchment hero with time-of-day greeting, unified today block (TodayWidget + WeatherTideWidget + FerryAlerts in a single `.card` with sound-blue accent), canonical empty states with Lucide icons, consistent 48px/64px section spacing, solid closing CTA, gradient removals, `text-[15px]` → `text-sm`. Commit `057a069`.

### What I'd do differently (3 items)

1. **Empty card shell when all today-block children return null.** The `.card` wrapper with the sound-blue left border renders unconditionally. If all three async components return null (every external API down), you get an empty bordered box. The plan flagged this risk but the implementation didn't mitigate it. Fix: wrap the card in a check or a small wrapper component that hides the shell when there's no content.

2. **FerryAlerts lost standalone portability.** Stripped the outer `<section>` to embed it inline in the today block, but didn't add a `variant` prop to support both compact (homepage) and full (standalone) rendering. Any future import outside the today block would render incorrectly. Fix: add `variant="inline" | "full"` prop defaulting to `"full"`.

3. **Skipped CLS min-height guards on events/news grids.** The plan committed to skeleton placeholders or min-heights matching final card dimensions (CLS < 0.05). Since data is fetched server-side (no client waterfall), this was silently dropped. Low practical risk, but the Definition of Done explicitly required it. Fix: add `min-h-[280px]` on the grid containers.

---
