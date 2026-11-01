-- Widen the unique constraint to include location so same-named events
-- at different venues on the same day (e.g. "Family Storytime" at
-- Langley Library vs Coupeville Library) are both allowed.
-- Applied manually via Supabase MCP on 2026-11-01.

ALTER TABLE event_submissions DROP CONSTRAINT IF EXISTS unique_event_title_date;
ALTER TABLE event_submissions ADD CONSTRAINT unique_event_title_date_location UNIQUE (title, date, location);
