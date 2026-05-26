import { createClient } from '@supabase/supabase-js';

type ScrapeStatus = 'success' | 'partial' | 'failed';

/**
 * Log a scrape run to the scrape_log table.
 * Uses service-role key — only call from API routes or cron jobs.
 */
export async function logScrapeRun(opts: {
  source: string;
  startedAt: Date;
  eventCount: number;
  status: ScrapeStatus;
  error?: string;
}): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const supabase = createClient(url, key);
  await supabase.from('scrape_log').insert({
    source: opts.source,
    started_at: opts.startedAt.toISOString(),
    finished_at: new Date().toISOString(),
    event_count: opts.eventCount,
    status: opts.status,
    error: opts.error ?? null,
  });
}
