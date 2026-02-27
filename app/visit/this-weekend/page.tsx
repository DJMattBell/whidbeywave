import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 1800; // 30 minutes

// ── Weekend window ────────────────────────────────────────────────────────────

function getWeekendWindow(): {
  fridayStr: string; sundayStr: string;
  fridayLabel: string; sundayLabel: string;
} {
  // Get today in Pacific time (avoids UTC drift)
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const today    = new Date(todayStr + 'T12:00:00'); // noon avoids DST edge
  const dow      = today.getDay(); // 0=Sun 1=Mon … 5=Fri 6=Sat

  // If Fri/Sat/Sun we're in the current weekend; otherwise find next Friday
  const daysToFriday =
    dow === 5 ? 0 : dow === 6 ? -1 : dow === 0 ? -2 : 5 - dow;

  const friday = new Date(today.getTime() + daysToFriday * 86_400_000);
  const sunday = new Date(friday.getTime() + 2 * 86_400_000);

  const toYMD     = (d: Date) => d.toLocaleDateString('en-CA');
  const toDisplay = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return {
    fridayStr:   toYMD(friday),
    sundayStr:   toYMD(sunday),
    fridayLabel: toDisplay(friday),
    sundayLabel: toDisplay(sunday),
  };
}

// ── Data fetch ────────────────────────────────────────────────────────────────

type EventRow = {
  id: string; title: string; date: string; time: string;
  location: string; town: string; category: string; description: string | null;
};

async function getWeekendEvents(fridayStr: string, sundayStr: string): Promise<EventRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder')) return [];

  const { data } = await createClient(url, key)
    .from('event_submissions')
    .select('id, title, date, time, location, town, category, description')
    .eq('status', 'approved')
    .gte('date', fridayStr)
    .lte('date', sundayStr)
    .order('date', { ascending: true });

  return (data ?? []) as EventRow[];
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const { fridayLabel, sundayLabel } = getWeekendWindow();
  const title = `This Weekend on Whidbey Island — WhidbeyWave`;
  const description = `What's happening on Whidbey Island ${fridayLabel} through ${sundayLabel} — events, things to do, and local picks.`;
  return {
    title,
    description,
    openGraph: { title, description, siteName: 'WhidbeyWave', images: ['/og-default.png'] },
    twitter:   { card: 'summary_large_image', title, description, images: ['/og-default.png'] },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  'Nature & Wildlife': '🌿', 'Arts & Culture': '🎨', 'Farmers Market': '🥕',
  'Music & Performance': '🎵', 'Outdoors & Recreation': '🌲', 'Film & Media': '🎬',
  'Community & Social': '🤝', 'Classes & Workshops': '📚', 'Food & Drink': '🍽️',
  'Sports & Fitness': '🏃', 'Other': '📅',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function ThisWeekendPage() {
  const { fridayStr, sundayStr, fridayLabel, sundayLabel } = getWeekendWindow();
  const events = await getWeekendEvents(fridayStr, sundayStr);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-forest-800 via-forest-700 to-sound-800 text-parchment-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-forest-300">
              <li><Link href="/visit" className="hover:text-parchment-100 transition-colors">Visit Whidbey</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-parchment-100">This Weekend</li>
            </ol>
          </nav>
          <p className="text-forest-300 font-medium mb-2 tracking-wide uppercase text-sm">📅 What&apos;s On</p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 text-parchment-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            This Weekend on Whidbey
          </h1>
          <p className="text-parchment-300 text-base">
            {fridayLabel} through {sundayLabel}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* ── Live Events ───────────────────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Happening This Weekend
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-14 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
              <p className="text-4xl mb-3" aria-hidden="true">🌾</p>
              <p
                className="text-lg font-semibold text-stone-700 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Nothing submitted yet for this weekend
              </p>
              <p className="text-stone-500 text-sm mb-5 max-w-xs mx-auto leading-relaxed">
                Check back closer to the weekend — events are usually posted a few days out.
              </p>
              <Link href="/events" className="btn-primary">Browse All Upcoming Events</Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {events.map(event => {
                const eventDate = new Date(event.date + 'T12:00:00');
                const dayName   = DAY_NAMES[eventDate.getDay()];
                const monthDay  = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                const emoji     = CATEGORY_EMOJI[event.category] ?? '📅';
                return (
                  <article
                    key={event.id}
                    className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm-sm flex flex-col md:flex-row overflow-hidden"
                  >
                    {/* Date column */}
                    <div className="md:w-32 bg-gradient-to-br from-forest-600 to-sound-600 text-parchment-100 flex flex-col items-center justify-center py-5 md:py-0 shrink-0">
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{dayName}</span>
                      <span className="text-4xl font-extrabold leading-none">{eventDate.getDate()}</span>
                      <span className="text-xs opacity-70 mt-1">
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-5">
                      <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                        {event.category} · {event.town}
                      </p>
                      <h3
                        className="text-lg font-bold text-stone-800 mb-2"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {emoji} {event.title}
                      </h3>
                      <p className="text-sm text-stone-500 mb-2">🕐 {event.time} · 📍 {event.location}</p>
                      {event.description && (
                        <p className="text-sm text-stone-600 leading-relaxed">{event.description}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Always Good Any Weekend ────────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Always Good Any Weekend
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Things that are reliably great regardless of what else is happening — no dates needed.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                emoji: '🌅',
                title: 'Walk Ebey\'s Landing at sunset',
                body:  'The bluff trail above Ebey\'s Landing is one of the best free views in Washington. Show up an hour before sunset.',
                link:  null,
              },
              {
                emoji: '🌊',
                title: 'Beachcomb at low tide',
                body:  'Minus tides expose miles of shoreline. Timing it right makes all the difference.',
                link:  { href: '/tides', label: 'Check the tide table' },
              },
              {
                emoji: '🎨',
                title: 'Browse the galleries in Langley',
                body:  'First Street has a concentration of genuine working artists. Walk in, ask questions, buy something small.',
                link:  null,
              },
              {
                emoji: '🦪',
                title: 'Penn Cove mussels at a waterfront restaurant',
                body:  'Grown right in the bay you can see from the table. Order them steamed and don\'t skip the bread for the broth.',
                link:  null,
              },
              {
                emoji: '🚗',
                title: 'Drive the back roads between Coupeville and Greenbank',
                body:  'Roll down the window, get off the highway, and take the farm roads through the middle of the island.',
                link:  null,
              },
              {
                emoji: '🌉',
                title: 'Visit Deception Pass State Park',
                body:  'Walk down to the beach, not just the bridge. The tide churning through the narrows is worth the short hike.',
                link:  null,
              },
              {
                emoji: '🚢',
                title: 'Check the ferry schedule and explore a new town',
                body:  'Ride the ferry back as a passenger, explore Clinton or Coupeville, and see the island from the water.',
                link:  { href: '/ferry', label: 'Ferry status' },
              },
            ].map(({ emoji, title, body, link }) => (
              <div key={title} className="bg-parchment-50 border border-parchment-200 rounded-2xl p-5 flex gap-4">
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{emoji}</span>
                <div>
                  <p
                    className="font-semibold text-stone-800 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {title}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
                  {link && (
                    <Link
                      href={link.href}
                      className="mt-1.5 inline-block text-sm font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2 transition-colors"
                    >
                      {link.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick links ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 border-t border-parchment-200 pt-8">
          {[
            { href: '/ferry',           label: '🚢 Ferry Status' },
            { href: '/tides',           label: '🌊 Tide Tables' },
            { href: '/recommendations', label: '🌿 Local Picks' },
            { href: '/submit-event',    label: '+ Submit an Event' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-5 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-stone-700 text-sm font-semibold hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Back to Visitor Guide */}
        <div className="text-center pb-2">
          <Link href="/visit" className="text-sm text-forest-600 hover:text-forest-800 font-medium underline underline-offset-2 transition-colors">
            ← Back to Visitor Guide
          </Link>
        </div>

      </div>
    </>
  );
}
