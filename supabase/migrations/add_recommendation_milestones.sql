-- Tracks which milestone notifications have been sent for a given business name.
-- Uses normalized_name (trim + lowercase + collapse whitespace) as identity
-- until a proper business_id is introduced in Phase 22.

CREATE TABLE IF NOT EXISTS recommendation_milestones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_name text NOT NULL,
  milestone     int  NOT NULL,  -- e.g. 5, 10, 25, 50
  notified_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (normalized_name, milestone)
);

-- RLS: service-role only (milestone writes happen server-side)
ALTER TABLE recommendation_milestones ENABLE ROW LEVEL SECURITY;
