-- ============================================================
-- Phase 0.7 — One-time cleanup: duplicated time strings
-- EXECUTED 2026-05-26
-- ============================================================
-- Fixed 23 event_submissions rows where the `time` column contained
-- a duplicated time range, e.g. "10:30am–11:30am10:30am to 11:30am".
--
-- Root cause: BiblioCommons SPA renders times in two adjacent HTML
-- elements (en-dash format + "to" format). Cheerio .text() concatenated
-- them without a separator. All affected rows had empty `source` field
-- (from a bulk import that used BiblioCommons data).
--
-- Also fixed one duplicated title from the same concatenation issue:
--   "Mechanical Puzzles: Brainteasers from the Slocum Puzzle Collection
--    Featured Event. Mechanical Puzzles: ..." → cleaned to single title
-- ============================================================

-- Fix times: keep only the first time range (start–end or just start)
UPDATE event_submissions
SET time = (
  SELECT (regexp_matches(time, '(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)(?:\s*[–—\-]\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))?)'))[1]
)
WHERE time ~ '\d{1,2}:\d{2}\s*(am|pm|AM|PM).*\d{1,2}:\d{2}\s*(am|pm|AM|PM).*\d{1,2}:\d{2}\s*(am|pm|AM|PM)';

-- Fix duplicated title
UPDATE event_submissions
SET title = 'Mechanical Puzzles: Brainteasers from the Slocum Puzzle Collection'
WHERE id = 'a61ee23a-f091-448a-8932-ded8d1d794cd';
