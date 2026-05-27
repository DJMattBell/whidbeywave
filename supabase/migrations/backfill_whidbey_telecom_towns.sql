-- Backfill town for existing Whidbey Telecom events that were hardcoded as 'Other'.
-- Infers town from the location column using case-insensitive matching.
-- Order matters: more specific matches first to handle compound locations.

UPDATE event_submissions
SET town = 'Oak Harbor'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND location ILIKE '%oak harbor%';

UPDATE event_submissions
SET town = 'Coupeville'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND location ILIKE '%coupeville%';

UPDATE event_submissions
SET town = 'Langley'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND location ILIKE '%langley%';

UPDATE event_submissions
SET town = 'Freeland'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND location ILIKE '%freeland%';

UPDATE event_submissions
SET town = 'Greenbank'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND location ILIKE '%greenbank%';

UPDATE event_submissions
SET town = 'Clinton'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND location ILIKE '%clinton%';

-- Also try matching from the title for events with no location or a generic location
UPDATE event_submissions
SET town = 'Oak Harbor'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND title ILIKE '%oak harbor%';

UPDATE event_submissions
SET town = 'Coupeville'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND title ILIKE '%coupeville%';

UPDATE event_submissions
SET town = 'Langley'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND title ILIKE '%langley%';

UPDATE event_submissions
SET town = 'Freeland'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND title ILIKE '%freeland%';

UPDATE event_submissions
SET town = 'Greenbank'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND title ILIKE '%greenbank%';

UPDATE event_submissions
SET town = 'Clinton'
WHERE source = 'Whidbey Telecom Events'
  AND town = 'Other'
  AND title ILIKE '%clinton%';
