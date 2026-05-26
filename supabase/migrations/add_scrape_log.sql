-- Scraper monitoring table — tracks every scrape run for /admin/scrapers health dashboard
CREATE TABLE IF NOT EXISTS scrape_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source      text NOT NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  event_count integer NOT NULL DEFAULT 0,
  status      text NOT NULL CHECK (status IN ('success', 'partial', 'failed')) DEFAULT 'success',
  error       text
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_scrape_log_source_started ON scrape_log (source, started_at DESC);

-- RLS: service-role only (no public access)
ALTER TABLE scrape_log ENABLE ROW LEVEL SECURITY;

-- No public policies — only service_role can insert/read
