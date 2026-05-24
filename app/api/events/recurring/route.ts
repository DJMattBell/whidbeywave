import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { generateDates } from '@/lib/recurring';
import { ALLOWED_TOWNS, ALLOWED_EVENT_CATEGORIES, ALLOWED_EVENT_TAGS, Validator } from '@/lib/validate';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** GET — list all recurring event templates with generated event counts */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const supabase = getSupabase();

  const { data: templates, error } = await supabase
    .from('recurring_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }

  // Get counts of generated events per template
  const ids = (templates ?? []).map((t: { id: string }) => t.id);
  let eventCounts: Record<string, number> = {};

  if (ids.length > 0) {
    const { data: countData } = await supabase
      .from('event_submissions')
      .select('recurring_event_id')
      .in('recurring_event_id', ids);

    if (countData) {
      for (const row of countData) {
        const rid = row.recurring_event_id as string;
        eventCounts[rid] = (eventCounts[rid] || 0) + 1;
      }
    }
  }

  const result = (templates ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    generated_count: eventCounts[t.id as string] || 0,
  }));

  return NextResponse.json({ templates: result });
}

/** POST — create a new recurring event template and immediately generate events */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const body = await request.json();
  const {
    title, time, location, town, category, description, tags,
    recurrence_type, day_of_week, day_of_month, custom_interval_days,
    start_date, end_date,
  } = body;

  const v = new Validator();
  v.required(title, 'title')
    .required(time, 'time')
    .required(location, 'location')
    .required(town, 'town')
    .required(recurrence_type, 'recurrence_type')
    .required(start_date, 'start_date')
    .oneOf(town, ALLOWED_TOWNS, 'town')
    .oneOf(category, ALLOWED_EVENT_CATEGORIES, 'category')
    .eachOneOf(tags, ALLOWED_EVENT_TAGS, 'tags')
    .date(start_date, 'start_date');

  if (end_date) v.date(end_date, 'end_date');

  if (!v.ok()) {
    return NextResponse.json({ error: v.firstError() }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: template, error } = await supabase
    .from('recurring_events')
    .insert({
      title: title.trim(),
      time: time.trim(),
      location: location.trim(),
      town,
      category: category || 'Community & Social',
      description: description?.trim() || null,
      tags: tags || [],
      recurrence_type,
      day_of_week: day_of_week ?? null,
      day_of_month: day_of_month ?? null,
      custom_interval_days: custom_interval_days ?? null,
      start_date,
      end_date: end_date || null,
    })
    .select()
    .single();

  if (error || !template) {
    console.error('[recurring] insert error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }

  // Immediately generate events
  const generated = await generateEventsForTemplate(supabase, template);

  return NextResponse.json({ ok: true, template, generated });
}

/** PATCH — update a recurring event template; regenerate future events */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Whitelist allowed fields to prevent arbitrary column updates
  const allowedFields = [
    'title', 'time', 'location', 'town', 'category', 'description', 'tags',
    'recurrence_type', 'day_of_week', 'day_of_month', 'custom_interval_days',
    'start_date', 'end_date', 'is_active',
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  const supabase = getSupabase();

  const { data: template, error } = await supabase
    .from('recurring_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !template) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  // Delete future generated events and regenerate
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('event_submissions')
    .delete()
    .eq('recurring_event_id', id)
    .gte('date', today);

  let generated = 0;
  if (template.is_active) {
    generated = await generateEventsForTemplate(supabase, template);
  }

  return NextResponse.json({ ok: true, template, generated });
}

/** DELETE — delete a template and optionally its future generated events */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const { id, deleteFutureEvents } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Optionally delete future generated events
  if (deleteFutureEvents) {
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('event_submissions')
      .delete()
      .eq('recurring_event_id', id)
      .gte('date', today);
  }

  const { error } = await supabase
    .from('recurring_events')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Generate event_submissions rows for a single template, deduplicating by (recurring_event_id, date) */
async function generateEventsForTemplate(
  supabase: ReturnType<typeof getSupabase>,
  template: Record<string, unknown>,
): Promise<number> {
  const dates = generateDates(template as Parameters<typeof generateDates>[0]);

  if (dates.length === 0) return 0;

  // Fetch existing dates to dedup
  const { data: existing } = await supabase
    .from('event_submissions')
    .select('date')
    .eq('recurring_event_id', template.id);

  const existingDates = new Set((existing ?? []).map((e: { date: string }) => e.date));

  const newDates = dates.filter(d => !existingDates.has(d));
  if (newDates.length === 0) return 0;

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
    submitter_email: 'noreply@whidbeywave.com',
    source: 'recurring',
    status: 'approved',
    recurring_event_id: template.id,
  }));

  // Insert in batches of 100
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('event_submissions').insert(batch);
    if (error) {
      console.error('[recurring] batch insert error:', error);
    } else {
      inserted += batch.length;
    }
  }

  return inserted;
}
