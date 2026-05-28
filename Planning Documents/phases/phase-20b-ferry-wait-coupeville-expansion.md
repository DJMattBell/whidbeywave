# Phase 20b — Ferry Wait Coupeville/Port Townsend Expansion

**Status: queued. Evaluation date: Phase 20 deploy + 14 days.**

## Context

Phase 20 shipped community ferry wait reporting for the Clinton-Mukilteo run only. This phase expands coverage to Coupeville and Port Townsend if the beta succeeds.

## Evaluation Criterion

**Primary metric: 10+ reports/day sustained for 7 consecutive days.**

This is the most direct signal of feature usage. It means enough people are reporting that the data is useful to others — the network effect is working.

Secondary signals to monitor (not gating, but informative):
- 5+ repeat reporters in a week (habit formation)
- 30+ subscribers to high-wait notifications within a month (demand for alerts)

## Scope (when triggered)

1. Migration: ALTER CHECK constraint on `ferry_wait_reports.terminal` to add `'Coupeville'` and `'Port Townsend'`
2. Update `SUPPORTED_FERRY_TERMINALS` in `lib/ferry.ts` — one line change
3. Remove beta banner from `/ferry` and `/ferry/report`
4. Add `/admin/ferry-reports` page (deferred from Phase 20 as Phase 20a — may be merged here)
5. Test at 375px viewport with 4-terminal layout

## Files to Read

- `supabase/migrations/add_ferry_waits.sql` (CHECK constraint to alter)
- `lib/ferry.ts` (`SUPPORTED_FERRY_TERMINALS`)
- `app/ferry/report/page.tsx` (terminal buttons)
- `app/ferry/page.tsx` (beta banner)
- `components/FerryWaitReports.tsx`

## Definition of Done

- [ ] All four terminals available in `/ferry/report`
- [ ] Beta banner removed
- [ ] Admin flagged-reports view exists
- [ ] `npm run build` passes
- [ ] Retrospective written
