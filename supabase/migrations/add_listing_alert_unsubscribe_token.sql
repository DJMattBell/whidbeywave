-- Run this in Supabase Dashboard → SQL Editor
-- Adds a unique unsubscribe token to every listing_alerts row

ALTER TABLE listing_alerts
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid DEFAULT gen_random_uuid();

-- Back-fill any existing rows that ended up with NULL
UPDATE listing_alerts
  SET unsubscribe_token = gen_random_uuid()
  WHERE unsubscribe_token IS NULL;

ALTER TABLE listing_alerts
  ALTER COLUMN unsubscribe_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS listing_alerts_unsubscribe_token_idx
  ON listing_alerts (unsubscribe_token);
