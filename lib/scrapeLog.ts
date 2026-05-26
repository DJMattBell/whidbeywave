import { createServiceClient } from '@/lib/supabase';

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
  try {
    const supabase = createServiceClient();
    await supabase.from('scrape_log').insert({
      source: opts.source,
      started_at: opts.startedAt.toISOString(),
      finished_at: new Date().toISOString(),
      event_count: opts.eventCount,
      status: opts.status,
      error: opts.error ?? null,
    });
  } catch {
    // Silently fail — scrape logging should never break the scraper
  }
}
