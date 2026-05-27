-- ============================================================
-- Phase 0.7 — One-time cleanup: duplicate event entries
-- EXECUTED 2026-05-26
-- ============================================================
-- Diagnosis revealed the duplicates were fuzzy-title variants from
-- different sources (not exact title+date matches), e.g.:
--   "Freeland Hall – Community Dinner" vs "Freeland Hall Community Dinner"
--   "Morning Bird Walk – Deception Pass" vs "Bird Walks at Deception Pass"
--
-- A generic dedup-by-exact-title would miss these. Targeted deletes
-- were used instead, keeping the earlier/more-descriptive entry.
-- ============================================================

-- Deleted rows (for audit trail):
-- c93e068b  "Freeland Hall Community Dinner"              2026-04-02  (dupe of "Freeland Hall – Community Dinner")
-- 47c3175e  "Bird Walks at Deception Pass"                2026-03-21  (dupe of "Morning Bird Walk – Deception Pass")
-- 84ddff12  "Welcome the Whales Parade & Festival"        2026-04-11  (dupe of "Welcome the Whales Festival & Parade")
-- 6c773cd9  "RossaConn @ Double Bluff Brewing Co."        2026-03-21  (dupe of "Double Bluff Brewing: Spring Equinox Dance with ROSSaCONN")
-- 4c7586b3  "The Dead Guise @ Greenbank Farm"             2026-03-28  (dupe of "The Dead Guise in Concert Honoring Bob Weir")

DELETE FROM event_submissions
WHERE id IN (
  'c93e068b-4d60-4e0a-b898-1521d789c140',
  '47c3175e-f044-43b7-8b58-48d3c4d85010',
  '84ddff12-d377-4210-a827-41bb38327789',
  '6c773cd9-3d51-4bfa-8912-dc4694623dfb',
  '4c7586b3-886f-4d36-ba09-f805ca7ccde3'
);
