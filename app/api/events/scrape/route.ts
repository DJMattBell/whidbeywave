import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeWica } from '@/lib/scrapers/wica';
import { scrapeOakHarbor } from '@/lib/scrapers/oakharbor';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Auth: Vercel cron header OR CRON_SECRET bearer token
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const cronSecret   = process.env.CRON_SECRET;
  const hasValidSecret =
    cronSecret &&
    request.headers.get('authorization') === `Bearer ${cronSecret}`;

  if (!isVercelCron && !hasValidSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase service role key not configured' },
      { status: 500 }
    );
  }

  // Run scrapers in parallel — each has its own 6s timeout; failures return []
  const [wicaEvents, oakHarborEvents] = await Promise.all([
    scrapeWica(),
    scrapeOakHarbor(),
  ]);

  const candidates = [...wicaEvents, ...oakHarborEvents];
  console.log(`[scrape] found ${candidates.length} candidate events (WICA: ${wicaEvents.length}, OakHarbor: ${oakHarborEvents.length})`);

  const supabase = createClient(supabaseUrl, serviceKey);

  // Dedup: fetch existing submissions from the last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: existing } = await supabase
    .from('event_submissions')
    .select('title, date')
    .gte('date', cutoff);

  const existingKeys = new Set(
    (existing ?? []).map((e: { title: string; date: string }) => `${e.title}|${e.date}`)
  );

  const newEvents = candidates.filter(
    e => !existingKeys.has(`${e.title}|${e.date}`)
  );

  if (newEvents.length > 0) {
    const rows = newEvents.map(e => ({
      title:           e.title,
      date:            e.date,
      time:            e.time ?? '',
      location:        e.location ?? '',
      town:            e.town,
      category:        e.category,
      description:     e.description,
      tags:            [] as string[],
      submitter_name:  'Event Scraper',
      submitter_email: process.env.ADMIN_EMAIL ?? 'admin@whidbeywave.com',
      status:          'pending',
    }));

    const { error } = await supabase.from('event_submissions').insert(rows);
    if (error) {
      console.error('[scrape] insert error:', error);
      return NextResponse.json(
        { error: 'DB insert failed', detail: error.message },
        { status: 500 }
      );
    }
  }

  console.log(`[scrape] added ${newEvents.length} new events (${candidates.length - newEvents.length} dupes skipped)`);
  return NextResponse.json({
    ok:    true,
    found: candidates.length,
    added: newEvents.length,
  });
}
