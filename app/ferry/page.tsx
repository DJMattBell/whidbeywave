import type { Metadata } from 'next';
import { cache } from 'react';
import { fetchFerryPageData } from '@/lib/ferry';
import type { RouteStatus } from '@/lib/ferry';
import ShareButton from '@/components/ShareButton';
import FerryLiveBoard from '@/components/FerryLiveBoard';

export const revalidate = 60;

const getCachedFerry = cache(fetchFerryPageData);

function statusLabel(s: RouteStatus) {
  return s === 'cancelled' ? 'Cancelled' : s === 'delays' ? 'Delays' : 'On Schedule';
}

export async function generateMetadata(): Promise<Metadata> {
  const ferry = await getCachedFerry();
  const parts: string[] = [];
  if (ferry.mukilteoClinton) parts.push(`Mukilteo/Clinton: ${statusLabel(ferry.mukilteoClinton.status)}`);
  if (ferry.ptCoupeville)   parts.push(`PT/Coupeville: ${statusLabel(ferry.ptCoupeville.status)}`);

  const description = parts.length > 0
    ? `Live Whidbey Island ferry status — ${parts.join(' · ')}. Schedules, alerts, and real-time updates from WSDOT.`
    : 'Live Whidbey Island ferry status — Mukilteo/Clinton and Port Townsend/Coupeville routes. Schedules, alerts, and real-time updates from WSDOT.';

  const title = 'Whidbey Island Ferry Status — Live Updates — WhidbeyWave';
  const ogImage = `/api/og?title=${encodeURIComponent('Ferry Status')}&subtitle=${encodeURIComponent('Live Whidbey Island Updates')}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'WhidbeyWave',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

// ── Static data ──────────────────────────────────────────────────────────────

const CAMERAS = [
  {
    terminal: 'Clinton Terminal',
    side:     'Island Side',
    emoji:    '🌲',
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=5',
  },
  {
    terminal: 'Mukilteo Terminal',
    side:     'Mainland Side',
    emoji:    '🏙️',
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=14',
  },
  {
    terminal: 'Coupeville Terminal',
    side:     'Island Side',
    emoji:    '🌲',
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=11',
  },
  {
    terminal: 'Port Townsend Terminal',
    side:     'Mainland Side',
    emoji:    '⛵',
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=17',
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function FerryPage() {
  const ferry = await getCachedFerry();

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-sound-800 to-forest-800 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sound-300 font-medium mb-2 tracking-wide uppercase text-sm">🚢 Getting On and Off the Island</p>
          <h1
            className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50"
          >
            Ferry Status
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Live status for both Whidbey Island ferry routes — updates every minute.
          </p>
          <div className="mt-4">
            <ShareButton title="Whidbey Island Ferry Status — WhidbeyWave" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── Section A: Live Status (client component) ───────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
          >
            Live Route Status
          </h2>
          <FerryLiveBoard initial={ferry} />
        </section>

        {/* ── Section B: Terminal Cameras ─────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2
              className="text-2xl font-semibold text-stone-800"
              >
              Terminal Cameras
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Opens on WSDOT&apos;s site in a new tab — cameras block embedding.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAMERAS.map(cam => (
              <a
                key={cam.href}
                href={cam.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 flex flex-col gap-3 group hover:border-forest-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl" aria-hidden="true">🎥</span>
                  <span className="text-xl" aria-hidden="true">{cam.emoji}</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors leading-snug text-sm">
                    {cam.terminal}
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">{cam.side}</p>
                </div>
                <span className="text-xs font-semibold text-forest-600 group-hover:text-forest-800 transition-colors mt-auto">
                  View Live Camera →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Section C: Vessel Watch ─────────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
          >
            Vessel Watch
          </h2>
          <a
            href="https://wsdot.com/ferries/vesselwatch/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gradient-to-br from-sound-800 to-forest-800 rounded-xl p-8 hover:from-sound-700 hover:to-forest-700 transition-all shadow-warm-md"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-3xl mb-3" aria-hidden="true">🗺️</p>
                <h3
                  className="text-2xl font-bold text-parchment-50 mb-2 group-hover:text-white transition-colors"
                      >
                  See Where Your Ferry Is Right Now
                </h3>
                <p className="text-parchment-300 text-base leading-relaxed max-w-xl">
                  Is it close? Is it loaded? Check the live map before you head to the dock.
                </p>
              </div>
              <span className="shrink-0 mt-1 text-sound-300 group-hover:text-parchment-100 transition-colors text-lg font-semibold hidden sm:block">
                Open Map →
              </span>
            </div>
            <p className="text-sound-400 text-xs mt-5 group-hover:text-sound-300 transition-colors">
              wsdot.com/ferries/vesselwatch
            </p>
          </a>
        </section>

        {/* ── Section D: Helpful Links Row ────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
          >
            Helpful Links
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                label: 'Mukilteo Schedule',
                href:  'https://www.wsdot.wa.gov/ferries/schedule/ScheduleDetail.aspx?departingterm=14&arrivingterm=3',
                emoji: '🚢',
              },
              {
                label: 'PT / Coupeville Schedule',
                href:  'https://www.wsdot.wa.gov/ferries/schedule/ScheduleDetail.aspx?departingterm=17&arrivingterm=4',
                emoji: '⛴',
              },
              {
                label: 'Make a Reservation',
                href:  'https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/default.aspx',
                emoji: '🎫',
              },
              {
                label: 'Sign Up for Alerts',
                href:  'https://public.govdelivery.com/accounts/WADOT/subscriber/new',
                emoji: '🔔',
              },
              {
                label: 'All Ferry Alerts',
                href:  'https://wsdot.com/ferries/schedule/bulletin.aspx',
                emoji: '⚠️',
              },
            ].map(({ label, href, emoji }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 flex items-center gap-3 group hover:border-forest-200 transition-colors"
              >
                <span className="text-xl shrink-0" aria-hidden="true">{emoji}</span>
                <span className="text-sm font-semibold text-stone-700 group-hover:text-forest-700 transition-colors leading-snug">
                  {label}
                </span>
                <span className="ml-auto text-forest-400 group-hover:text-forest-600 transition-colors shrink-0 text-xs">→</span>
              </a>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
