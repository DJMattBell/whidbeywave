import type { Metadata } from 'next';
import Link from 'next/link';
import WeatherTideWidget from '@/components/WeatherTideWidget';
import FerryAlerts from '@/components/FerryAlerts';
import TodayWidget from '@/components/TodayWidget';
import { createServerClient } from '@/lib/supabase';
import { formatShortDate, categoryColors } from '@/lib/data';
import AddToCalendar from '@/components/AddToCalendar';
import { CATEGORY_EMOJI } from '@/lib/constants';
import { Sun } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export const metadata: Metadata = {
  title: 'Quick View — Whidbey Island at a Glance',
  description:
    'A single-page snapshot of Whidbey Island: ferry status, weather, tides, and today\'s events.',
  openGraph: {
    title: 'Quick View — Whidbey Island at a Glance',
    description: 'A single-page snapshot of Whidbey Island: ferry status, weather, tides, and today\'s events.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick View — Whidbey Island at a Glance',
    description: 'Ferry status, weather, tides, and today\'s events on Whidbey Island.',
    images: ['/og-default.png'],
  },
};

export const revalidate = 300;

export default async function DashboardPage() {
  const supabase = createServerClient();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

  // Today's events
  const { data: todayEvents } = await supabase
    .from('event_submissions')
    .select('id, title, date, time, town, category, description')
    .eq('status', 'approved')
    .eq('date', today)
    .order('time', { ascending: true })
    .limit(10);

  // Weekend events (next 3 days)
  const weekendEnd = new Date();
  weekendEnd.setDate(weekendEnd.getDate() + 3);
  const weekendStr = weekendEnd.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

  const { data: weekendEvents } = await supabase
    .from('event_submissions')
    .select('id, title, date, time, town, category')
    .eq('status', 'approved')
    .gt('date', today)
    .lte('date', weekendStr)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(8);

  const todayList = todayEvents ?? [];
  const weekendList = weekendEvents ?? [];

  return (
    <>
      {/* Header */}
      <section className="bg-parchment-100 border-b border-parchment-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-2">
            Quick View
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            Everything you need, one page
          </p>
        </div>
        <svg className="w-full hidden sm:block" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 40L60 33C120 27 240 13 360 12C480 11 600 21 720 24C840 27 960 21 1080 17C1200 13 1320 11 1380 9L1440 8V40H0Z" fill="#fdfaf3" />
        </svg>
        <svg className="w-full sm:hidden" viewBox="0 0 1440 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 30L60 25C120 20 240 10 360 9C480 8 600 16 720 18C840 20 960 16 1080 13C1200 10 1320 8 1380 7L1440 6V30H0Z" fill="#fdfaf3" />
        </svg>
      </section>

      {/* At-a-Glance bar */}
      <TodayWidget />

      {/* Weather & Tides bar */}
      <WeatherTideWidget />

      {/* Ferry Alerts */}
      <FerryAlerts />

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '🚢', label: 'Full Ferry Status', href: '/ferry', color: 'bg-amber-50 border-amber-300 hover:bg-amber-100' },
            { emoji: '🌊', label: 'Tide Charts', href: '/tides', color: 'bg-sound-50 border-sound-300 hover:bg-sound-100' },
            { emoji: '📅', label: 'All Events', href: '/events', color: 'bg-forest-50 border-forest-300 hover:bg-forest-100' },
            { emoji: '🗺️', label: 'Visitor Guide', href: '/visit', color: 'bg-terra-50 border-terra-300 hover:bg-terra-100' },
          ].map(({ emoji, label, href, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 ${color} transition-all duration-200 hover:-translate-y-0.5`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs sm:text-sm font-semibold text-stone-700">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Events */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <h2
          className="text-xl font-semibold text-stone-800 mb-4"
        >
          Happening Today
        </h2>
        {todayList.length === 0 ? (
          <EmptyState
            icon={Sun}
            headline="Quiet day on the island"
            subtext="Enjoy the calm."
          />
        ) : (
          <div className="grid gap-3">
            {todayList.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card p-4 flex items-start gap-3 group"
              >
                <span className="text-2xl shrink-0">{CATEGORY_EMOJI[event.category] ?? '📅'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-xs ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-stone-400">{event.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-800 group-hover:text-forest-600 transition-colors truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">📍 {event.town}</p>
                </div>
                <AddToCalendar
                  event={{
                    title: event.title,
                    date: event.date,
                    time: event.time,
                    location: event.town,
                    description: event.description,
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Coming Up This Weekend */}
      {weekendList.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          <h2
            className="text-xl font-semibold text-stone-800 mb-4"
          >
            Coming Up This Week
          </h2>
          <div className="grid gap-3">
            {weekendList.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card p-4 flex items-start gap-3 group"
              >
                <span className="text-2xl shrink-0">{CATEGORY_EMOJI[event.category] ?? '📅'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-xs ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {event.category}
                    </span>
                    <span className="text-xs text-stone-400">
                      {formatShortDate(event.date)} · {event.time}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-800 group-hover:text-forest-600 transition-colors truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">📍 {event.town}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/events" className="text-sm text-forest-600 hover:text-forest-800 font-medium">
              See all events →
            </Link>
          </div>
        </section>
      )}

      {/* Back to full site */}
      <section className="bg-parchment-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-stone-500 text-sm mb-3">Want more?</p>
          <Link href="/" className="btn-primary">
            Explore the Full Site
          </Link>
        </div>
      </section>
    </>
  );
}
