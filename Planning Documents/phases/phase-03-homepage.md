# Phase 3 — Homepage & Landing

## Goal

Redesign the homepage to tell a story — what's happening *today*, what's *coming up*, what *neighbors are doing* — in a scannable, warm layout that uses Phase 1 tokens consistently.

## Files to Read

- `app/page.tsx`
- `components/TodayWidget.tsx`, `components/WeatherTideWidget.tsx`, `components/FerryAlerts.tsx`
- `components/PersonaSelector.tsx` (keep for now — restructuring proposed in Phase 18)
- `components/EventsFilter.tsx`
- `Planning Documents/design/DESIGN.md` (layout, card, type, spacing rhythm)
- `Planning Documents/design/empty-states.md`

## Planning Prompt

```
Phase 3 goal: home tells a story. Section, breath, section, breath. Phase 1 tokens throughout. Mobile-first.

Structure (top to bottom on mobile):

1. Hero band — logo, tagline, time-of-day greeting ("Good morning, Whidbey")
2. Persona row — keep PersonaSelector for now (Phase 18 may propose replacement)
3. Today block — TodayWidget + WeatherTideWidget + FerryAlerts as a unified visual block, but keep them as three components for now. They share a visual frame (card, parchment background, sound-blue accent for utility data).
4. Coming up on the island — next 3 events using the card pattern. Empty state per empty-states.md.
5. From around the island — next 2 news items. Empty state per empty-states.md.
6. Closing CTA — "This is your site as much as ours" with submit / post / forum links

Constraints:
- Do NOT decompose app/page.tsx into separate section components yet. That was a v5 idea; we can do it later if it helps. For this phase, just refactor the existing JSX to use Phase 1 tokens consistently.
- Do NOT change PersonaSelector behavior (Phase 18 will propose chip-filter replacement).
- Do NOT change BottomTabBar structure (Phase 2 settled it).
- Mock data: `lib/data.ts` still exports `events`, `newsPosts`, `listings` arrays. Add a clear comment marking them DEMO ONLY if not already done. Do not move them out of the file (caused churn previously).
- Use `.card`, `.section-title`, `.section-subtitle`, `.empty-state` classes from globals.css. No new ad-hoc styles.
- Section spacing: 48px mobile, 64px desktop, between major sections.
- One CLS rule: skeleton placeholders for async sections (events, news) must match final card dimensions so the page doesn't jump when data loads.

Plan output: list every section, the components it uses, and any visual changes from current state.
```

## Iteration Checklist

- [ ] Section rhythm is consistent (no cramped sections)
- [ ] Empty states use canonical patterns
- [ ] No new components — refactor existing JSX
- [ ] Mock data not moved (avoid churn)
- [ ] Skeleton placeholders match card dimensions
- [ ] PersonaSelector and BottomTabBar untouched

## Definition of Done

- 375×812: home reads as a calm, story-told sequence; no overlapping or crammed sections
- All sections use `.card` and `.section-title` consistently
- Skeleton placeholders prevent layout shift (CLS < 0.05)
- Empty state for events shows per empty-states.md when no upcoming events
- `npm run build` passes
- No regression in PersonaSelector behavior
