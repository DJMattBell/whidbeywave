# Phase 21 — Event Audience Metadata

**Status: queued. Makes Phase 18's ChipFilters finally do something.**

Depends on Phase 19a (migration discipline) and Phase 18 (chips exist but don't filter).

## Why this matters

Phase 18 shipped chip filters but they only set a cookie. Selecting "Kids" doesn't actually change what events show. The Phase 18 retro flagged this honestly: it requires audience metadata on events that doesn't exist in the schema. Phase 21 adds the metadata and wires the filtering. After this, the chips earn their place.

## Scope

### Data model extension

```sql
-- migration: add_event_audience_metadata.sql
ALTER TABLE event_submissions
  ADD COLUMN audience_kid_friendly boolean DEFAULT false,
  ADD COLUMN audience_senior_accessible boolean DEFAULT false,
  ADD COLUMN audience_outdoors boolean DEFAULT false,
  ADD COLUMN audience_new_residents boolean DEFAULT false,
  ADD COLUMN audience_visitors boolean DEFAULT false;
-- New residents and visitors are intentionally separate from kid/senior/outdoors
-- because they're context (who is this for) vs content (what kind of event)
```

### Surfaces

1. **submit-event form: audience checkboxes**
   - New "Who is this for?" section with 5 checkboxes
   - Optional — events without flags still appear in "Everyone" view
   - Brief copy explaining "Help us show this to the right neighbors"

2. **/admin/events moderation: audience flags surfaced**
   - Display flags as small badges on the moderation card
   - Admin can edit flags during moderation (the submitter may not always self-identify accurately)
   - Save flags on approval

3. **Backfill existing events**
   - Migration includes a backfill pass using heuristics on title and description:
     - "Kids" / "children" / "youth" / "family" → kid_friendly
     - "Senior" / "55+" / "accessible" → senior_accessible
     - "Hike" / "trail" / "outdoor" / "park" → outdoors
   - Heuristics are conservative — false negatives preferred over false positives
   - Backfill is run once via supabase migration script

4. **Scraper integration**
   - Each scraper's `guessCategory()` already exists
   - Add a parallel `guessAudience()` function in `lib/scrapers/types.ts` returning the boolean object
   - Each scraper calls it; scraped events ship with audience flags

5. **ChipFilters actually filter**
   - Update lib/chipFilters.ts (or equivalent) to return a SQL filter based on selected chip
   - Selecting "Kids" → `WHERE audience_kid_friendly = true` plus everyone-no-flag events
   - Selecting "Outdoors" → `WHERE audience_outdoors = true` plus everyone-no-flag events
   - "Everyone" (default) → no filter
   - Apply on /events and on the home "Coming up" preview
   - Decision: events with zero audience flags are visible under every chip (default-inclusive)

6. **"Why am I seeing this?" tooltip update**
   - Phase 18 added the affordance but it currently only describes the cookie
   - Update copy: "We're showing events flagged as good for kids. Tap a different chip to change."

### Out of scope

- Notification filtering by audience (separate phase if useful)
- Listings/recommendations audience flags (events only for this phase)
- Audience flags affecting search ranking
- User self-identification ("I am a parent") — chips remain situational, not identity

## Files to Read

- `app/submit-event/page.tsx`, `app/api/events/submit/route.ts`
- `app/admin/events/page.tsx`, `app/api/events/moderate/route.ts`
- `lib/chipFilters.ts`
- `components/ChipFilters.tsx`
- All scrapers under `lib/scrapers/`
- `lib/scrapers/types.ts`
- `Planning Documents/design/DESIGN.md`

## Planning Prompt

```
Phase 21 goal: ChipFilters earn their place by actually filtering.

Specs:

1. Migration add_event_audience_metadata.sql with the 5 boolean columns
2. submit-event form audience checkboxes in a "Who is this for?" section
3. /admin/events: display + edit audience flags
4. Backfill via SQL update with heuristic patterns on title/description
5. Scraper integration: new guessAudience() in lib/scrapers/types.ts, called by each scraper
6. lib/chipFilters.ts: returns filter clauses based on selected chip
7. /events and home "Coming up" honor the filter
8. Default-inclusive rule: events with no flags appear under every chip
9. Tooltip copy update reflecting actual filtering behavior

Constraints:
- Conservative backfill heuristics (false negatives preferred)
- Events with zero flags are inclusive (visible under every chip)
- No notification filtering by audience in this phase
- No user self-identification — chips are situational
- Listings unchanged (audience flags are events-only for now)

Plan output: migration SQL with backfill, heuristic patterns documented, file list, tooltip copy.
```

## Iteration Checklist

- [ ] Backfill heuristics are conservative
- [ ] Default-inclusive rule is documented
- [ ] All scrapers updated to call guessAudience()
- [ ] Tooltip copy reflects actual behavior
- [ ] Admin can edit flags during moderation

## Definition of Done

End-to-end:
- [ ] Submit an event with "Kids" checked → appears in event_submissions with audience_kid_friendly=true
- [ ] Approve via /admin/events → event lives with flag intact
- [ ] On /events with Kids chip selected, see this event + all unflagged events
- [ ] On /events with Outdoors chip selected, do NOT see this event (unless also flagged outdoors)
- [ ] Scrape a new source → scraped events arrive with audience flags populated
- [ ] Backfill historical events shows reasonable flag distribution (spot check 20 events)
- [ ] Tooltip text matches actual filtering

Codebase:
- [ ] Migration with backfill applies cleanly
- [ ] All scrapers compile
- [ ] `npm run build` passes
- [ ] `npm run smoke` passes
- [ ] Retrospective written
