import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient, isConfigured } from '@/lib/supabase';
import { CATEGORY_EMOJI } from '@/lib/constants';
import AddToCalendar from '@/components/AddToCalendar';
import ShareButton from '@/components/ShareButton';
import RecurringSeries from '@/components/RecurringSeries';

export const revalidate = 300;

async function getEvent(id: string) {
  if (!isConfigured) return null;

  const supabase = createServerClient();
  const { data } = await supabase
    .from('event_submissions')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  return data ?? null;
}

async function getSiblingEvents(recurringEventId: string, currentEventId: string) {
  if (!isConfigured) return [];

  const supabase = createServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('event_submissions')
    .select('id, date')
    .eq('recurring_event_id', recurringEventId)
    .eq('status', 'approved')
    .gte('date', today)
    .neq('id', currentEventId)
    .order('date', { ascending: true })
    .limit(8);

  return data ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: 'Event Not Found — WhidbeyWave' };

  const title = `${event.title} — WhidbeyWave`;
  const description = event.description
    ? event.description.slice(0, 155)
    : `${event.title} on Whidbey Island. ${event.date} · ${event.location}`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: 'WhidbeyWave' },
    twitter: { card: 'summary', title, description },
  };
}

function formatLongDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const emoji = CATEGORY_EMOJI[event.category] ?? '📅';
  const tags: string[] = Array.isArray(event.tags) ? event.tags : [];

  const siblingEvents = event.recurring_event_id
    ? await getSiblingEvents(event.recurring_event_id, event.id)
    : [];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-800 to-sound-700 text-parchment-100 py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-parchment-300 hover:text-parchment-100 text-sm mb-6 transition-colors"
          >
            ← Back to Events
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl" aria-hidden="true">{emoji}</span>
            <span className="text-sm font-medium text-forest-300 uppercase tracking-wide">{event.category}</span>
            {event.recurring_event_id && (
              <span className="text-xs font-medium bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                Recurring Event
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-parchment-50 mb-4 leading-snug">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-parchment-300 text-[15px]">
            <span>📅 {formatLongDate(event.date)}</span>
            {event.time && <span>🕐 {event.time}</span>}
            <span>📍 {event.location || event.town}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {event.description && (
              <div>
                <h2 className="text-lg font-semibold text-stone-800 mb-2">
                  About This Event
                </h2>
                <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-forest-50 text-forest-700 border border-forest-200 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Recurring series dates */}
            {siblingEvents.length > 0 && (
              <RecurringSeries events={siblingEvents} currentDate={event.date} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-5 space-y-3 text-sm text-stone-600">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-0.5">Date</p>
                <p className="font-semibold text-stone-800">{formatLongDate(event.date)}</p>
              </div>
              {event.time && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-0.5">Time</p>
                  <p className="font-semibold text-stone-800">{event.time}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-0.5">Location</p>
                <p className="font-semibold text-stone-800">{event.location || event.town}</p>
                {event.town && event.location && event.location !== event.town && (
                  <p className="text-stone-500">{event.town}</p>
                )}
              </div>
              {event.submitter_name && event.submitter_name !== 'Recurring Event' && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-0.5">Submitted by</p>
                  <p className="text-stone-700">{event.submitter_name}</p>
                </div>
              )}
            </div>

            <AddToCalendar
              event={{
                title:       event.title,
                date:        event.date,
                time:        event.time,
                location:    event.location || event.town,
                description: event.description ?? '',
              }}
            />

            <ShareButton title={event.title} />

            <Link
              href="/submit-event"
              className="block text-center text-sm text-forest-600 hover:text-forest-800 transition-colors mt-2"
            >
              + Submit another event →
            </Link>
          </aside>
        </div>

        <div className="mt-10 pt-6 border-t border-parchment-200">
          <Link href="/events" className="text-sm text-forest-600 hover:text-forest-800 transition-colors">
            ← Back to all events
          </Link>
        </div>
      </div>
    </>
  );
}
