-- Phase 19a: Add 'expired' to the listings status check constraint.
-- This allows flash-give listings to be marked expired by the hourly cron.
-- Rollback: ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
--           ALTER TABLE listings ADD CONSTRAINT listings_status_check
--             CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'expired'));
