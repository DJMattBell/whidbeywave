# Phase 4 — Events & Calendar

## Goal

Polish the events page: better cards, date grouping, filter UX, empty/error states. Use Phase 1 tokens.

## Files to Read

- `app/events/page.tsx` and any sub-routes under `app/events/`
- `components/EventsFilter.tsx`
- `components/AddToCalendar.tsx`
- `components/RecurringSeries.tsx`
- `Planning Documents/design/DESIGN.md` (card pattern, type, layout grid)
- `Planning Documents/design/empty-states.md`

## Planning Prompt

```
Phase 4 goal: events page polish — cards, date grouping, filter UX.

Specs:
1. Event cards use the canonical card pattern (rounded-xl, parchment-100 bg, parchment-200 border, shadow-warm, hover lift). Full card is tappable to /events/[id].
2. Add-to-calendar button stops event propagation so it doesn't trigger the card link.
3. Date grouping: events list groups by date with a sticky-ish date heading on mobile (use a small Playfair h3 above each day's group).
4. Filter UX: chips (not a select) for category. Keep TimeWindowFilter as-is.
5. Empty states:
   - No upcoming events at all → empty-states.md "Events — No upcoming events"
   - Filter returns nothing → empty-states.md "Events — Filter returns nothing"
6. Recurring series: ensure the existing RecurringSeries surface uses card pattern consistently.
7. Performance: paginate or lazy-load if the event list is long.

Constraints:
- Keep filter state in URL (query params) so the page is shareable.
- Mobile-first: filter chips horizontally scroll if they overflow.
- No new components beyond what's in /components today.

Plan output: list every change file, the visual diff at a high level, and any places where existing CSS conflicts with Phase 1 tokens.
```

## Iteration Checklist

- [ ] Card pattern applied uniformly (no one-off styles)
- [ ] Date grouping heading legible at 375px
- [ ] Filter state in URL
- [ ] Empty states use canonical patterns
- [ ] No regression on RecurringSeries

## Definition of Done

- 375×812: events page scannable, date groups clear, cards tappable
- Filter chips legible and scrollable horizontally if needed
- Empty filter result shows correct empty state
- AddToCalendar doesn't navigate
- `npm run build` passes
