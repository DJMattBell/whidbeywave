-- Phase 16: Barter and flash give enhancements
-- Rollback: ALTER TABLE listings DROP COLUMN IF EXISTS barter_open, DROP COLUMN IF EXISTS barter_seeking, DROP COLUMN IF EXISTS flash_give_duration;

-- Add barter fields to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS barter_open boolean NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS barter_seeking text;

-- Add flash give duration tracking
ALTER TABLE listings ADD COLUMN IF NOT EXISTS flash_give_duration text CHECK (flash_give_duration IN ('24h', '48h', 'week'));
