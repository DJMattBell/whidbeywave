# Scraper Pre-Insert Validation Proposal

## Problem

`stripHtml()` and title trimming run at write time (scrape route lines 172–185), but nothing validates data *quality* before it enters `event_submissions` with `status: 'pending'`. Bad data reaches the approval queue silently — HTML fragments, boilerplate-only descriptions, off-island locations, and malformed titles all require manual admin triage that could be automated.

## Where it hooks in

In `/app/api/events/scrape/route.ts`, between the cleaning step (lines 172–185) and the upsert (lines 187–196):

```
Scrapers → collect → dedup → clean → [VALIDATE HERE] → upsert → admin email
```

After `rows` is built (post-`stripHtml`, post-`trim`), split into two arrays:

```typescript
const { valid, flagged } = validateScrapedRows(rows);
// upsert only `valid`
// log `flagged` to scrape_log with needs_review status
```

## What it checks

| Check | Condition | Reason |
|-------|-----------|--------|
| Title too short | `title.length < 5` | Likely parsing artifact |
| Title too long | `title.length > 150` | Concatenated garbage or HTML leak |
| HTML remnants in title | `/<[a-z][\s\S]*>/i.test(title)` | `stripHtml` missed encoded entities |
| HTML remnants in description | Same regex on description | Backstop for double-encoded HTML |
| Boilerplate-only description | Matches known boilerplate patterns after stripping | Nothing useful for user |
| Off-island location | Location contains known off-island keywords (Mukilteo, Lynnwood, Edmonds, Mountlake Terrace, Camano, Marysville, Arlington, Stanwood) | Sno-Isle leak; duplicates existing scraper filter but catches any that slip through |
| Empty location | `location.trim() === ''` | Breaks unique constraint semantics |
| Invalid town | `!ALLOWED_TOWNS.includes(town)` | Scraper returned unexpected value |
| Invalid category | `!ALLOWED_EVENT_CATEGORIES.includes(category)` | Same |
| Date in past | `date < today` | Stale event from slow scraper |

## scrape_log schema change

Add a `needs_review` status and a `flagged_events` JSONB column:

```sql
-- Allow needs_review status
ALTER TABLE scrape_log
  DROP CONSTRAINT IF EXISTS scrape_log_status_check,
  ADD CONSTRAINT scrape_log_status_check
    CHECK (status IN ('success', 'partial', 'failed', 'needs_review'));

-- Store flagged event details for admin review
ALTER TABLE scrape_log
  ADD COLUMN IF NOT EXISTS flagged_events jsonb DEFAULT '[]'::jsonb;
```

Each flagged entry in `flagged_events`:

```json
{
  "title": "...",
  "date": "2026-11-15",
  "source": "Langley Library",
  "reasons": ["boilerplate_only_description", "off_island_location"]
}
```

## Admin visibility

The existing `/admin/scrapers` page reads from `scrape_log`. Rows with `status = 'needs_review'` would surface there with the flagged event details — no new page needed, just a filter addition.

## What this does NOT do

- Does not block or auto-reject. Flagged events are logged, not inserted. An admin can review the `flagged_events` JSON and manually submit valid ones.
- Does not replace the existing off-island filter in `sno-isle-common.ts`. That filter runs at scrape time; this is a second pass that catches leaks from any scraper.
- Does not require a migration on `event_submissions`. Only `scrape_log` changes.
