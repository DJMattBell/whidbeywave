-- Phase 15: Notification engine tables
-- Rollback: DROP TABLE IF EXISTS notification_log, push_subscriptions, notification_preferences CASCADE;

-- User notification preferences per channel per event type
CREATE TABLE IF NOT EXISTS notification_preferences (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL,
  channel     text NOT NULL CHECK (channel IN ('email', 'push')),
  event_type  text NOT NULL,
  enabled     boolean NOT NULL DEFAULT false,
  scope       jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel, event_type)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Web push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notification delivery log (service-role only)
CREATE TABLE IF NOT EXISTS notification_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL,
  event_type  text NOT NULL,
  channel     text NOT NULL,
  status      text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error       text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- No public policies — service_role only

-- Index for user notification history
CREATE INDEX IF NOT EXISTS idx_notification_log_user ON notification_log (user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences (user_id);
