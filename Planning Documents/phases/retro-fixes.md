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

## Roadmap reconciliation — 2026-05-26

Between v5 planning (May 2026) and the current state, an earlier Claude Code session rewrote the `Planning Documents/` folder with a different 13-phase polish-oriented roadmap. Phase 1 (Design Foundation) was completed against that plan and shipped real, well-executed token work in `app/globals.css` and `tailwind.config.ts`. Phase 2 (Layout & Navigation) was started.

The current ROADMAP.md is a merged version: it keeps the polish track (Phases 1–13) and adds back the strategic track (Phases 14–18) that was dropped in the rewrite. The merge preserves all completed work, acknowledges the 5-tab BottomTabBar as a settled decision, and reframes the chip-filter persona idea as a proposal (Phase 18) requiring sign-off.

This entry is the record of that reconciliation. No code rollback was needed.

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
