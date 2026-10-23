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
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const { data } = await supabase
    .from('event_submissions')
    .select('*, recurring_events(recurrence_type, day_of_week, day_of_month, custom_interval_days)')
    .eq('status', 'approved')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(500);

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
  const upcoming = await getCachedEvents();

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
  const upcoming = await getCachedEvents();

  return (
    <>
      {/* Page header — slim, warm, functional */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-stone-900">
            What&apos;s Happening on Whidbey
          </h1>
          <p className="text-stone-500 text-sm md:text-base">
            Events submitted by neighbors
            {' · '}
            <Link
              href="/events/print"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 hover:text-forest-800 transition-colors"
            >
              Print this week&apos;s calendar →
            </Link>
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
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">
          Coming Up
        </h2>

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

        {/* Past events — link to archive page */}
        <div className="mt-12 md:mt-16 text-center">
          <Link
            href="/events/archive"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-parchment-100 text-stone-600 border border-parchment-200 hover:border-forest-300 hover:text-forest-700 transition-colors text-sm font-medium min-h-[44px]"
          >
            <span aria-hidden="true">📜</span>
            Browse past events →
          </Link>
        </div>

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
