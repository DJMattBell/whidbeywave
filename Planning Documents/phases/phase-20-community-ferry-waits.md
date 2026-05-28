# Phase 20 — Community Ferry Wait Times

**Status: queued. The wedge feature. The reason locals will switch from Facebook for commute info.**

Depends on Phase 19b (notify() spine complete).

## Why this matters

WSDOT publishes schedules and alerts. Neither WSDOT nor Facebook tells you the *actual* wait at the dock right now. Locals on Facebook ferry groups currently post "30 min at Clinton, just arrived" in scattered comments. WhidbeyWave can do this properly:

- One-tap report with terminal, direction, and an estimated wait
- Surfaces on /ferry as "Recently reported: 30 min wait at Clinton (4 min ago)"
- Surfaces on home Today block when the user's direction matches a recent report
- Push notification opt-in: "Tell me when waits at my terminal exceed 45 min"

This is the killer feature because Facebook structurally can't compete. Facebook has no commute UX, no terminal selector, no wait-time data model.

## Scope

### Data model

```sql
-- new migration: add_ferry_waits.sql
CREATE TABLE ferry_wait_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal text NOT NULL,           -- 'Clinton' | 'Mukilteo' | 'Coupeville' | 'Port Townsend'
  direction text NOT NULL,          -- 'departing' | 'arriving'
  wait_minutes int NOT NULL,        -- 0, 15, 30, 45, 60, 90, 120
  reporter_id uuid REFERENCES auth.users(id),
  reporter_zip text,                -- denormalized for is_local
  is_local boolean DEFAULT false,   -- computed at insert from whidbey-zips
  created_at timestamptz DEFAULT now(),
  flagged boolean DEFAULT false,
  flag_reason text
);
CREATE INDEX ferry_wait_reports_terminal_created ON ferry_wait_reports (terminal, created_at DESC);
-- RLS: anyone authenticated can insert; anyone can read; service role can update flagged
```

### Surfaces

1. **/ferry/report — One-tap report page**
   - Terminal: 4 large buttons (Clinton, Mukilteo, Coupeville, Port Townsend)
   - Direction: 2 buttons (Departing / Arriving)
   - Wait: 7 buttons (0 / 15 / 30 / 45 / 60 / 90 / 120 min)
   - Submit creates ferry_wait_reports row
   - Auth required; non-local can report but their report is flagged is_local=false in UI
   - Success: "Thanks. Other Whidbey commuters will see this." → return to /ferry

2. **/ferry — Recent reports panel**
   - New section above the schedule: "Recent wait reports"
   - Shows last 5 reports per terminal, newest first, with timestamps relative ("4 min ago")
   - Local-reported items get the Local badge
   - Reports older than 90 minutes hide automatically (no cron needed; query filter)
   - "Report a wait" CTA always visible

3. **Home Today block — direction-aware**
   - If user's stored direction-of-travel preference (new user metadata field) matches a report in the last 30 minutes, show: "Heads up: 45 min wait reported at Clinton (departing) 8 min ago"
   - Otherwise hide silently

4. **Notification opt-in: high-wait alerts**
   - New event_type `ferry_high_wait_at_my_terminal`
   - User configures: terminal(s), direction(s), threshold (default 45 min)
   - When a new report exceeds threshold, notify() fires push
   - Throttle: max one notification per terminal/direction per 30 minutes per user

### Anti-abuse

- Rate limit: one report per user per terminal per 10 minutes (DB constraint or middleware)
- Flag button on each report card; flagged reports hide pending admin review
- Admin sees flagged reports under /admin (new tab on existing admin layout)
- Auto-flag if wait_minutes drops by >60 min from another local report in the same 10-min window (likely griefing)

### Out of scope

- ETA prediction algorithms (just raw reports)
- Photo uploads of dock queue
- Crowdsourced parking lot status
- Other terminals (Anacortes etc.) — Phase 20 is Whidbey-relevant terminals only

## Files to Read

- `app/ferry/page.tsx`, `components/FerryLiveBoard.tsx`
- `app/page.tsx` Today block
- `lib/notifications.ts`, `lib/whidbey-zips.ts`
- `components/LocalBadge.tsx`
- `Planning Documents/design/DESIGN.md` (card patterns, time-relative formatting)
- `Planning Documents/design/error-states.md`

## Planning Prompt

```
Phase 20 goal: community ferry wait reporting end-to-end. The wedge feature.

Specs:

1. Migration add_ferry_waits.sql per spec above; RLS policies for insert/select
2. Page /ferry/report with three-step button flow (terminal, direction, wait)
3. /ferry recent-reports panel at top, above schedule
4. Home Today block direction-aware report (new user metadata: ferry_direction_preference)
5. Notification opt-in ferry_high_wait_at_my_terminal in /profile/notifications
6. Anti-abuse: rate limit, flag button, auto-flag heuristic, admin tab
7. notify() integration for high-wait alerts with 30-min throttle

Constraints:
- One-tap UX — terminal/direction/wait should be 3 taps max
- No ETA predictions or modeling — raw reports only
- No photo uploads
- Rate limit enforced server-side, not client-side
- Local badge surfaces on every report card
- 90-minute report visibility cutoff is a query filter, not a cron
- Stays Whidbey-relevant terminals only

Plan output: migration SQL, file list, the three-step button UX described in detail, the throttle logic for high-wait alerts.
```

## Iteration Checklist

- [ ] Migration RLS policies are correct (public read, auth insert, admin update)
- [ ] /ferry/report is 3 taps max
- [ ] Rate limiting is server-side
- [ ] Flag/auto-flag logic prevents drive-by griefing
- [ ] High-wait alerts throttled per user/terminal/direction
- [ ] Direction-aware Today block hides silently if no match
- [ ] All notifications via notify(), never direct Resend

## Definition of Done

End-to-end:
- [ ] Authenticated Whidbey-local user opens /ferry/report, taps 3 buttons, submits — report appears on /ferry within 5 seconds
- [ ] Second user with `ferry_high_wait_at_my_terminal` subscribed to Clinton departing >=30 receives push within 60s
- [ ] Same second user submitting another high-wait Clinton report 5 minutes later does NOT trigger a second push (throttle)
- [ ] Non-local user can report but UI shows their report without Local badge
- [ ] User submitting two Clinton reports in 5 minutes gets a rate-limit error on second submission
- [ ] Tapping flag on a report hides it pending admin review
- [ ] Home Today block shows "45 min wait at Clinton (departing) 8 min ago" only when user's direction preference matches

Codebase:
- [ ] Migration applies cleanly with reversible down migration
- [ ] `npm run build` passes
- [ ] `npm run smoke` passes
- [ ] Retrospective written
