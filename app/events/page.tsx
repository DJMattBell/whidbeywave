import type { Metadata } from 'next';
import Link from 'next/link';
import { cache, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { events as fallbackEvents, categoryColors } from '@/lib/data';
import type { Event } from '@/lib/data';
import EventsFilter from '@/components/EventsFilter';
import ShareButton from '@/components/ShareButton';

export const revalidate = 300; // re-fetch every 5 minutes

const CATEGORY_EMOJI: Record<string, string> = {
  'Nature & Wildlife':    '🌿',
  'Arts & Culture':       '🎨',
  'Farmers Market':       '🥕',
  'Music & Performance':  '🎵',
  'Outdoors & Recreation':'🌲',
  'Film & Media':         '🎬',
  'Community & Social':   '🤝',
  'Classes & Workshops':  '📚',
  'Food & Drink':         '🍽️',
  'Sports & Fitness':     '🏃',
  'Other':                '📅',
  // legacy
  'Nature': '🌿', 'Arts': '🎨', 'Market': '🥕', 'Film': '🎬', 'Outdoors': '🌲',
};

async function getApprovedEvents(): Promise<Event[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder')) return fallbackEvents;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('event_submissions')
    .select('*')
    .eq('status', 'approved')
    .order('date', { ascending: true });

  if (!data || data.length === 0) return fallbackEvents;

  return data.map((row: any): Event => ({
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
  }));
}

// Cache deduplicates between generateMetadata and the page component
const getCachedEvents = cache(getApprovedEvents);

export async function generateMetadata(): Promise<Metadata> {
  const allEvents = await getCachedEvents();
  const upcoming  = allEvents.filter(e => new Date(e.date + 'T23:59:59') >= new Date());

  let description =
    "Find out what's happening on Whidbey Island — festivals, markets, outdoor adventures, arts, live music, and more.";
  if (upcoming.length > 0) {
    const count    = upcoming.length;
    const nameList = upcoming.slice(0, 2).map(e => e.title).join(' and ');
    description    = `${count} upcoming event${count !== 1 ? 's' : ''} on Whidbey Island — including ${nameList}.`;
  }

  const title = "What's On Whidbey Island This Weekend — WhidbeyWave";
  return {
    title,
    description,
    keywords: ['Whidbey Island events', 'Oak Harbor events', 'Langley WA events', 'Coupeville events calendar'],
    openGraph: {
      title,
      description,
      siteName: 'WhidbeyWave',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-default.png'] },
  };
}

export default async function EventsPage() {
  const events   = await getCachedEvents();
  const upcoming = events.filter(e => new Date(e.date + 'T23:59:59') >= new Date());
  const past     = events.filter(e => new Date(e.date + 'T23:59:59') <  new Date());

  return (
    <>
      {/* Page header */}
      <div className="bg-gradient-to-br from-forest-800 to-sound-700 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-300 font-medium mb-2 tracking-wide uppercase text-sm">📅 What&apos;s On</p>
          <h1
            className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            What&apos;s Happening on Whidbey
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Community-submitted events, reviewed and approved by neighbors.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link href="/submit-event" className="inline-block bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-warm text-sm">
              + Submit Your Event
            </Link>
            <ShareButton title="What's On Whidbey Island — WhidbeyWave" />
            <Link
              href="/events/print"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-parchment-50/10 hover:bg-parchment-50/20 text-parchment-200 hover:text-parchment-50 border border-parchment-50/20 transition-colors text-sm font-medium"
            >
              🖨️ Print This Week
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Upcoming events */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            Coming Up
          </h2>
          <Link href="/submit-event" className="text-sm text-forest-600 hover:text-forest-800 font-medium transition-colors">
            + Submit an event →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300 mb-12">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg text-stone-700 mb-1"
               style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
              Nothing scheduled yet
            </p>
            <p className="text-stone-600 text-sm mb-5">Be the first to add something happening on the island.</p>
            <Link href="/submit-event" className="btn-primary">Submit an Event</Link>
          </div>
        ) : (
          <Suspense fallback={null}>
            <EventsFilter events={upcoming} />
          </Suspense>
        )}

        {/* Past events (collapsible) */}
        {past.length > 0 && (
          <details className="mt-14 group">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-stone-600 hover:text-stone-800 text-base font-medium transition-colors select-none mb-4 min-h-[44px]">
              <span className="group-open:rotate-90 transition-transform inline-block" aria-hidden="true">▶</span>
              Past events ({past.length})
            </summary>
            <div className="space-y-4 mt-2 opacity-60">
              {past.map(event => (
                <article key={event.id} className="flex gap-4 bg-parchment-50 rounded-xl border border-parchment-200 p-4">
                  <div className="shrink-0 w-14 h-14 bg-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-500" aria-hidden="true">
                    <span className="text-xs font-semibold uppercase">
                      {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-extrabold leading-none">
                      {new Date(event.date + 'T12:00:00').getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-700 text-base">{event.emoji} {event.title}</p>
                    <p className="text-sm text-stone-600">
                      <time dateTime={event.date}>
                        {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                      {' '}· {event.time} · {event.town}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </details>
        )}

        {/* CTA */}
        <div className="mt-16 bg-forest-50 rounded-2xl p-8 text-center border border-forest-100">
          <h3 className="text-2xl text-forest-800 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
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
