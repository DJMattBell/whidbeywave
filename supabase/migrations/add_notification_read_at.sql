-- Phase 19b: Add read_at column to notification_log for tracking unread notifications.
-- Rollback: DROP INDEX IF EXISTS idx_notification_log_unread;
--           ALTER TABLE notification_log DROP COLUMN IF EXISTS read_at;

ALTER TABLE notification_log ADD COLUMN IF NOT EXISTS read_at timestamptz DEFAULT null;

-- Partial index for efficient unread-count queries (only unread, successfully sent)
CREATE INDEX IF NOT EXISTS idx_notification_log_unread
  ON notification_log (user_id, sent_at DESC)
  WHERE read_at IS NULL AND status = 'sent';
