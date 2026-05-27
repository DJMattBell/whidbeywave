-- Phase 19c: Add columns to listing_alerts for auth migration tracking.
-- migrated_to_user_id: links the anonymous row to the authenticated user who re-subscribed.
-- transition_email_sent_at: stamps when the transition email was sent (idempotency guard).

ALTER TABLE listing_alerts
  ADD COLUMN IF NOT EXISTS migrated_to_user_id uuid DEFAULT NULL
    REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE listing_alerts
  ADD COLUMN IF NOT EXISTS transition_email_sent_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_alerts_pending_migration
  ON listing_alerts (email)
  WHERE migrated_to_user_id IS NULL AND transition_email_sent_at IS NULL;
