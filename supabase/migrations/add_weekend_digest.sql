-- Run this in Supabase Dashboard → SQL Editor
-- Adds opt-in column for the Thursday "This Weekend on Whidbey" email

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS weekend_digest boolean DEFAULT false;
