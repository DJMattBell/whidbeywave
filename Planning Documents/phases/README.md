# Phase files

One file per phase. Each follows the same structure:

1. **Goal** — what this phase achieves
2. **Files to read** — explicit list for Claude Code
3. **Planning prompt** — paste into Claude Code; produces a written plan
4. **Iteration checklist** — sanity-check the resulting plan
5. **Definition of done** — measurable verification

Every session starts with the **session preamble** (`_preamble.md`).

## Index

### Polish track — complete
- `phase-01-design-foundation.md` — ✓
- `phase-02-layout-navigation.md` — ✓
- `phase-03-homepage.md` — ✓
- `phase-04-events.md` — ✓
- `phase-05-news-guides.md` — ✓
- `phase-06-marketplace.md` — ✓
- `phase-07-forum.md` — ✓
- `phase-08-ferry-tides-weather.md` — ✓
- `phase-09-visitor-experience.md` — ✓
- `phase-10-forms.md` — ✓
- `phase-11-admin.md` — ✓
- `phase-12-newsletter-email.md` — ✓
- `phase-13-performance.md` — ✓

### Strategic track — complete
- `phase-14-observability.md` — ✓
- `phase-15-notifications.md` — ✓
- `phase-16-buy-nothing.md` — ✓
- `phase-17-trusted-services.md` — ✓
- `phase-18-chip-filter-persona.md` — ✓

### Consolidation track — next (added 2026-05-27)
- `phase-19a-correctness-safety.md` — XSS-safe email, ListingAlert→notify(), flash-give expiry, admin mobile QA
- `phase-19b-notification-spine-completion.md` — bell icon, first-reply prompt, /api/notifications/test, milestone triggers, subscription sheet, first-recommendation prompt
- `phase-19c-design-system-enforcement.md` — EmptyState/DataStatus adoption, red-* lint rule, normalize() dedup, DateStrip extraction, CLS guards

### Strategic track resumed (added 2026-05-27)
- `phase-20-community-ferry-waits.md` — the wedge feature; community wait time reports
- `phase-21-event-audience-metadata.md` — make ChipFilters actually filter
- `phase-22-admin-recommendations-ui.md` — proper admin surface for /recommendations

### Other
- `_preamble.md` — session preamble (paste at start of every session)
- `future.md` — parked ideas
- `retro-fixes.md` — log of retroactive changes and per-phase retrospectives
