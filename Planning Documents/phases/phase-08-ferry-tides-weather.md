# Phase 8 — Ferry, Tides & Weather

## Goal

Polish the utility pages: ferry live board, tide charts, weather widget. Make them feel cohesive and informative. Use sound-blue accents per DESIGN.md color-by-meaning rule.

## Files to Read

- `app/ferry/page.tsx`, `app/tides/page.tsx`
- `lib/ferry.ts`
- `components/FerryLiveBoard.tsx`, `components/FerryAutoRefresh.tsx`, `components/FerryStatusPill.tsx`
- `components/FerryAlerts.tsx`, `components/WeatherTideWidget.tsx`, `components/TodayWidget.tsx`
- `app/api/ferry-status/`
- `Planning Documents/design/DESIGN.md` (sound-blue for utility, type scale for large numbers)
- `Planning Documents/design/error-states.md` (DataStatus pattern, On Island Time framing)

## Planning Prompt

```
Phase 8 goal: ferry, tides, weather cohesive and informative. Designed for low-light early-morning commuter use.

Specs:

1. /ferry page:
   - Each route gets a card with: current status pill, next sailing each direction (large times), departure list
   - Departure times use display or h1 type size (big numbers — designed for arm's-length reading)
   - Sound-blue accent throughout
   - WSDOT cam embed if WSDOT exposes embeddable iframes; otherwise clear "View dock cam ↗" link-out button
   - Phase 14 will add DataStatus indicator; for this phase, use inline "Last updated HH:MM" timestamp text

2. /tides page:
   - Today's high/low at large size at top
   - Simple SVG tide chart (no animation, no library)
   - Tomorrow's tides below in smaller type

3. Weather widget (on home):
   - Compact form, fits within the home Today block
   - Sound-blue accent
   - Temp at large size, conditions in body, "Last updated" muted

4. FerryAlerts:
   - Use .error-banner or .info-banner from globals.css based on severity
   - Empty when no active alerts (don't show "no alerts" message — just nothing)

5. Error states:
   - When WSDOT returns nothing → use the "On Island Time" framing from error-states.md inline within the card
   - When user is offline → "You're offline. Showing cached data" banner
   - Never show raw error messages

Constraints:
- Do NOT add community-reported ferry line wait time (future phase)
- Do NOT add real-time websocket updates
- Do NOT add a service worker for offline cache (Phase 14 or later)
- Do NOT consolidate the three home widgets yet — leave that for later if needed

Plan output: list files, visual changes per surface, where error states are wired in.
```

## Iteration Checklist

- [ ] Big numbers actually big (designed for low-light, arm's-length reading)
- [ ] Sound-blue accent consistent across all three utility surfaces
- [ ] On Island Time framing used for upstream failures
- [ ] No service worker or offline cache work (those come later)
- [ ] FerryAlerts uses banner classes correctly

## Definition of Done

- 375×812 in dim light: ferry times legible at arm's length
- Tide chart readable on mobile
- Weather widget fits cleanly within home Today block
- Mock a WSDOT failure → see "On Island Time" inline
- `npm run build` passes
