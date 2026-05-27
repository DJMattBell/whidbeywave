-- Phase 20: Community Ferry Wait Reports
-- Beta scope: Clinton and Mukilteo terminals only.
-- To expand to Coupeville/Port Townsend, ALTER the CHECK constraint:
--   ALTER TABLE ferry_wait_reports DROP CONSTRAINT ferry_wait_reports_terminal_check;
--   ALTER TABLE ferry_wait_reports ADD CONSTRAINT ferry_wait_reports_terminal_check
--     CHECK (terminal IN ('Clinton', 'Mukilteo', 'Coupeville', 'Port Townsend'));

CREATE TABLE ferry_wait_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal text NOT NULL CHECK (terminal IN ('Clinton', 'Mukilteo')),
  direction text NOT NULL CHECK (direction IN ('departing', 'arriving')),
  wait_minutes int NOT NULL CHECK (wait_minutes IN (0, 15, 30, 45, 60, 90, 120)),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_zip text,
  is_local boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  flagged boolean DEFAULT false,
  flag_reason text
);

CREATE INDEX ferry_wait_reports_terminal_created
  ON ferry_wait_reports (terminal, created_at DESC);

-- RLS: anyone can read non-flagged reports; authenticated users can insert; service role can update (flag/unflag)
ALTER TABLE ferry_wait_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-flagged reports"
  ON ferry_wait_reports FOR SELECT
  USING (flagged = false);

CREATE POLICY "Authenticated users can insert reports"
  ON ferry_wait_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Service role can read all reports"
  ON ferry_wait_reports FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update reports"
  ON ferry_wait_reports FOR UPDATE
  TO service_role
  USING (true);

-- Down migration:
-- DROP TABLE ferry_wait_reports;
