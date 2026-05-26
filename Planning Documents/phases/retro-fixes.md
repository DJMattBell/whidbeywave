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
