# Future phases

Parked ideas, grouped by whether they were explicitly deferred from earlier phases or are net-new.

## Explicit deferrals from earlier phases

- **Section component decomposition of app/page.tsx** (Phase 3 deferred). The 530-line file is fine for now; only revisit if it becomes hard to maintain.
- **Community-reported ferry line wait time** (Phase 8 deferred). The killer feature Facebook can't compete with — locals reporting "30 min wait at Clinton" with timestamp.
- **Service worker offline cache** for ferry/weather/tide (Phase 8 deferred). Could pair with Phase 15's service worker if added later.
- **Admin UI for /visit "Don't miss" curated list** (Phase 9 hardcoded it in `lib/visit-highlights.ts`).
- **Spanish translation of visitor pages** (Phase 9 didn't add i18n; would need scaffolding first).
- **Tightening the local-verified rule** (Phase 17 used soft launch). Tighten if abuse appears.
- **Business claim and reply on recommendations** (Phase 17 placeholder `claim_status` field exists).
- **Photo upload on user-submitted guides** (Phase 5 / 9 deferred).
- **Today as own bottom-nav tab** with 5–9am default routing (rejected as over-engineering for current need).
- **4-tab vs 5-tab BottomTabBar** (5-tab kept; revisit only if data shows users confused).
- **Empty-state component as a full React component** (Phase 14 added it; if needs grow, expand).

## Net-new ideas

- Whidbey-only directory of homes for rent / for sale (high trust, no national listings)
- Yearly "Best of Whidbey" awards driven by recommendation data
- Newsroom syndication partnerships (South Whidbey Record, Whidbey News-Times)
- Native iOS/Android apps (only if PWA usage metrics justify)
- Forum DMs, mentions, threaded replies beyond one level
- Price negotiation on marketplace listings
- Saved searches in marketplace with notifications
- Event RSVPs surfaced in /profile as "Your upcoming"
- Verified business tier where businesses claim and reply
- Marketplace seller profiles with history (light reputation)
- Dark mode (especially for /ferry early-morning use)
- OpenDyslexic font option toggle
- Paper-texture overlay on parchment background (subtle tactile quality)

## Things explicitly rejected

These came up during planning and were rejected for specific reasons. Listed so they don't come back as "good ideas":

- Section-breaker photo strips between home sections (rejected: clutters utility surface)
- Auto-rotating carousels (rejected: poor accessibility, no proven value)
- Hero video on home (rejected: performance, battery)
- Anonymous reviews of any kind (rejected: trust model relies on identity)
- Star ratings on businesses (rejected: the recommendation is the rating)
- Modal popups for anything non-destructive (rejected per DESIGN.md)
- Persona switcher with 4+ doors (rejected: thin model of community)
- Per-reaction forum notifications (rejected: too noisy; weekly digest instead)
- "On Island Time" framing for our own bugs (rejected: dilutes the phrase; we own our bugs plainly)
