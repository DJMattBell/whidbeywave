import type { Metadata } from 'next';
import Link from 'next/link';
import { cache, Suspense } from 'react';
import { createServerClient, isConfigured } from '@/lib/supabase';
import { events as fallbackEvents } from '@/lib/data';
import { CATEGORY_EMOJI } from '@/lib/constants';
import type { Event } from '@/lib/data';
import { recurrenceSummary } from '@/lib/recurring';
import EventsFilter from '@/components/EventsFilter';
import { Calendar } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export const revalidate = 300; // re-fetch every 5 minutes

async function getApprovedEvents(): Promise<Event[]> {
  if (!isConfigured) return fallbackEvents;

  const supabase = createServerClient();
  const { data } = await supabase
    .from('event_submissions')
    .select('*, recurring_events(recurrence_type, day_of_week, day_of_month, custom_interval_days)')
    .eq('status', 'approved')
    .order('date', { ascending: true });

  if (!data || data.length === 0) return fallbackEvents;

  return data.map((row): Event => {
    const rec = row.recurring_events;
    return {
      id:          row.id,
      title:       row.title,
      date:        row.date,
      time:        row.time,
      location:    row.location,
      town:        row.town,
      category:    row.category,
      description: row.description ?? '',
      emoji:       CATEGORY_EMOJI[row.category] ?? '📅',
      tags:        (row.tags ?? []) as Event['tags'],
      recurring_event_id: row.recurring_event_id ?? null,
      recurrence_summary: rec ? recurrenceSummary(rec) : null,
    };
  });
}

// Cache deduplicates between generateMetadata and the page component
const getCachedEvents = cache(getApprovedEvents);

export async function generateMetadata(): Promise<Metadata> {
  const allEvents = await getCachedEvents();
  const upcoming  = allEvents.filter(e => new Date(e.date + 'T23:59:59') >= new Date());

  let description =
    'Find events happening this week on Whidbey Island — Oak Harbor, Langley, Coupeville, Freeland & Greenbank. Concerts, markets, classes, and community gatherings.';
  if (upcoming.length > 0) {
    const count    = upcoming.length;
    const nameList = upcoming.slice(0, 2).map(e => e.title).join(' and ');
    description    = `${count} upcoming event${count !== 1 ? 's' : ''} on Whidbey Island — including ${nameList}.`;
  }

  const title = "What's On Whidbey Island This Weekend — WhidbeyWave";
  const ogImage = `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Whidbey Island Events')}`;
  return {
    title,
    description,
    keywords: ['Whidbey Island events', 'Oak Harbor events', 'Langley WA events', 'Coupeville events calendar'],
    openGraph: {
      title,
      description,
      siteName: 'WhidbeyWave',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function EventsPage() {
  const events   = await getCachedEvents();
  const upcoming = events.filter(e => new Date(e.date + 'T23:59:59') >= new Date());
  const past     = events.filter(e => new Date(e.date + 'T23:59:59') <  new Date());

  return (
    <>
      {/* Page header — slim, warm, functional */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-stone-900 font-heading">
            What&apos;s Happening on Whidbey
          </h1>
          <p className="text-stone-500 text-sm md:text-base">
            Events submitted by neighbors{' '}
            <span className="hidden sm:inline">
              ·{' '}
              <Link
                href="/events/print"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-600 hover:text-forest-800 transition-colors"
              >
                Print this week&apos;s calendar →
              </Link>
            </span>
          </p>
          <div className="mt-4">
            <Link href="/submit-event" className="btn-primary">
              + Submit Your Event
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2 md:hidden">
        <Link
          href="/search?q="
          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-parchment-200 bg-white text-stone-400 text-sm shadow-warm-sm min-h-[44px]"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search events, news, forum...
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">

        {/* Upcoming events */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-stone-900">
            Coming Up
          </h2>
          <Link href="/submit-event" className="text-sm text-forest-600 hover:text-forest-800 font-medium transition-colors">
            + Submit an event →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="mb-12">
            <EmptyState
              icon={Calendar}
              headline="The calendar's looking quiet"
              subtext="Check back soon or submit your own community event."
              action={{ label: 'Submit an Event', href: '/submit-event' }}
            />
          </div>
        ) : (
          <Suspense fallback={null}>
            <EventsFilter events={upcoming} />
          </Suspense>
        )}

        {/* Past events (collapsible) — flagged for post-launch review:
            as event data grows, consider /events/past as a paginated route
            or limit this disclosure to the last 30 days */}
        {past.length > 0 && (
          <details className="mt-12 md:mt-16 group">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-stone-600 hover:text-stone-800 text-base font-medium transition-colors select-none mb-4 min-h-[44px]">
              <span className="group-open:rotate-90 transition-transform inline-block" aria-hidden="true">▶</span>
              Past events ({past.length})
            </summary>
            <div className="space-y-3 mt-2 opacity-60">
              {past.map(event => (
                <Link key={event.id} href={`/events/${event.id}`} className="flex gap-3 bg-parchment-50 rounded-xl border border-parchment-200 p-3 hover:border-parchment-300 transition-colors">
                  <div className="shrink-0 w-12 h-12 bg-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-500" aria-hidden="true">
                    <span className="text-[10px] font-semibold uppercase">
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-extrabold leading-none">
                      {new Date(event.date + 'T12:00:00').getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-700 text-sm truncate">{event.title}</p>
                    <p className="text-xs text-stone-500 truncate">
                      {event.time} · {event.town}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </details>
        )}

        {/* CTA */}
        <div className="mt-12 md:mt-16 bg-forest-50 rounded-xl p-8 text-center border border-forest-100">
          <h3 className="text-2xl font-semibold text-forest-800 mb-2">
            Got something happening?
          </h3>
          <p className="text-forest-600 mb-6 leading-relaxed">
            Submit your event and it&apos;ll appear on this calendar once reviewed — usually within 48 hours.
          </p>
          <Link href="/submit-event" className="btn-primary">
            + Submit an Event
          </Link>
        </div>

      </div>
    </>
  );
}
