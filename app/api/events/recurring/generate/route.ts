import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateDates } from '@/lib/recurring';

/** Cron endpoint — tops up generated events for all active recurring templates (90-day window) */
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: templates, error } = await supabase
    .from('recurring_events')
    .select('*')
    .eq('is_active', true);

  if (error || !templates) {
    console.error('[recurring/generate] fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }

  let totalInserted = 0;

  for (const template of templates) {
    const dates = generateDates(template);
    if (dates.length === 0) continue;

    // Fetch existing dates to dedup
    const { data: existing } = await supabase
      .from('event_submissions')
      .select('date')
      .eq('recurring_event_id', template.id);

    const existingDates = new Set((existing ?? []).map((e: { date: string }) => e.date));
    const newDates = dates.filter(d => !existingDates.has(d));

    if (newDates.length === 0) continue;

    const rows = newDates.map(date => ({
      title: template.title,
      date,
      time: template.time,
      location: template.location,
      town: template.town,
      category: template.category,
      description: template.description,
      tags: template.tags,
      submitter_name: 'Recurring Event',
      submitter_email: process.env.ADMIN_EMAIL ?? 'admin@whidbeywave.com',
      source: 'recurring',
      status: 'approved',
      recurring_event_id: template.id,
    }));

    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error: insertError } = await supabase.from('event_submissions').insert(batch);
      if (insertError) {
        console.error(`[recurring/generate] insert error for ${template.id}:`, insertError);
      } else {
        totalInserted += batch.length;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    templates_checked: templates.length,
    events_generated: totalInserted,
  });
}
