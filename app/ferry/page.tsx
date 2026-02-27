import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { fetchFerryPageData } from '@/lib/ferry';
import type { RouteStatus, Departure } from '@/lib/ferry';
import ShareButton from '@/components/ShareButton';

export const revalidate = 300; // 5 minutes

const getCachedFerry = cache(fetchFerryPageData);

function statusLabel(s: RouteStatus) {
  return s === 'cancelled' ? 'Cancelled' : s === 'delays' ? 'Delays' : 'On Schedule';
}

export async function generateMetadata(): Promise<Metadata> {
  const ferry = await getCachedFerry();
  const parts: string[] = [];
  if (ferry.mukilteoCliton) parts.push(`Mukilteo/Clinton: ${statusLabel(ferry.mukilteoCliton.status)}`);
  if (ferry.ptCoupeville)   parts.push(`PT/Coupeville: ${statusLabel(ferry.ptCoupeville.status)}`);

  const description = parts.length > 0
    ? parts.join(' · ')
    : 'Live Mukilteo/Clinton and Port Townsend/Coupeville ferry status, departure times, and terminal cameras.';

  const title = 'Whidbey Island Ferry Status — Live Updates — WhidbeyWave';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'WhidbeyWave',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-default.png'] },
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RouteStatus }) {
  if (status === 'cancelled') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
        style={{ background: '#FEE2E2', color: '#991B1B' }}
      >
        <span>✕</span> CANCELLED
      </span>
    );
  }
  if (status === 'delays') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
        style={{ background: '#FEF3C7', color: '#B45309' }}
      >
        <span>⚠</span> DELAYS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-forest-100 text-forest-700">
      <span>✓</span> On Schedule
    </span>
  );
}

function DepartureList({
  label,
  departures,
}: {
  label: string;
  departures: Departure[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">{label}</p>
      {departures.length === 0 ? (
        <p className="text-sm text-stone-600 italic">No upcoming departures found</p>
      ) : (
        <ol className="space-y-1.5">
          {departures.map((dep, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-stone-800 tabular-nums w-20 shrink-0">{dep.time}</span>
              <span className="text-stone-500 truncate">{dep.vessel}</span>
              {dep.isCancelled && (
                <span className="text-xs font-semibold text-red-600 shrink-0">CANCELLED</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const CAMERAS = [
  {
    terminal: 'Clinton Terminal',
    side:     'Island Side',
    emoji:    '🌲',
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=3',
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
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=4',
  },
  {
    terminal: 'Port Townsend Terminal',
    side:     'Mainland Side',
    emoji:    '⛵',
    href:     'https://wsdot.com/ferries/vesselwatch/cameradetail.aspx?terminalid=17',
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

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
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ferry Status
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Live status for both Whidbey Island ferry routes — updated every 5 minutes.
          </p>
          {ferry.lastUpdated && (
            <p className="text-sound-400 text-sm mt-3">
              Last checked: {ferry.lastUpdated}
            </p>
          )}
          <div className="mt-5">
            <ShareButton title="Whidbey Island Ferry Status — WhidbeyWave" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── Section A: Live Status Cards ──────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Live Route Status
          </h2>

          {/* Not configured */}
          {!ferry.configured && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-3">🔑</p>
              <p className="font-semibold text-amber-800 mb-1">WSDOT API key not configured</p>
              <p className="text-amber-700 text-sm">
                Add your key from{' '}
                <span className="font-mono bg-amber-100 px-1 rounded">wsdot.wa.gov/traffic/api/</span>{' '}
                to <span className="font-mono bg-amber-100 px-1 rounded">.env.local</span> as{' '}
                <span className="font-mono bg-amber-100 px-1 rounded">WSDOT_API_KEY</span>.
              </p>
            </div>
          )}

          {/* Configured but API failed */}
          {ferry.configured && !ferry.mukilteoCliton && !ferry.ptCoupeville && (
            <div className="bg-parchment-100 border border-parchment-300 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-3">🌧️</p>
              <p className="font-semibold text-stone-700 mb-1">Live data temporarily unavailable</p>
              <p className="text-stone-500 text-sm">
                Could not reach the WSDOT API. Try refreshing, or check{' '}
                <a
                  href="https://www.wsdot.wa.gov/ferries/alerts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
                >
                  wsdot.wa.gov/ferries/alerts
                </a>{' '}
                directly.
              </p>
            </div>
          )}

          {/* Route cards */}
          {(ferry.mukilteoCliton || ferry.ptCoupeville) && (
            <div className="grid md:grid-cols-2 gap-6">

              {/* Mukilteo / Clinton */}
              {ferry.mukilteoCliton && (() => {
                const r = ferry.mukilteoCliton!;
                return (
                  <article className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm-md overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-sound-400 to-forest-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-0.5">Route</p>
                          <h3
                            className="text-xl font-semibold text-stone-900"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            🚢 Mukilteo / Clinton
                          </h3>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>

                      {r.alertText && r.status !== 'on-schedule' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800 leading-relaxed">
                          {r.alertText}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-5 border-t border-parchment-200 pt-5">
                        <DepartureList label="From Mukilteo →" departures={r.fromMainland} />
                        <DepartureList label="From Clinton →"   departures={r.fromWhidbey} />
                      </div>

                      <p className="text-xs text-stone-600 mt-4">
                        Updated {r.lastUpdated} ·{' '}
                        <a
                          href="https://www.wsdot.wa.gov/ferries/vesselwatch/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-600 hover:text-forest-800"
                        >
                          Track vessels →
                        </a>
                      </p>
                    </div>
                  </article>
                );
              })()}

              {/* Port Townsend / Coupeville */}
              {ferry.ptCoupeville && (() => {
                const r = ferry.ptCoupeville!;
                return (
                  <article className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm-md overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-terra-400 to-amber-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-0.5">Route</p>
                          <h3
                            className="text-xl font-semibold text-stone-900"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            ⛴ Port Townsend / Coupeville
                          </h3>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>

                      {r.alertText && r.status !== 'on-schedule' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800 leading-relaxed">
                          {r.alertText}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-5 border-t border-parchment-200 pt-5">
                        <DepartureList label="From Port Townsend →" departures={r.fromMainland} />
                        <DepartureList label="From Coupeville →"    departures={r.fromWhidbey} />
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-stone-600">
                          Updated {r.lastUpdated}
                        </p>
                        <a
                          href="https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/default.aspx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-forest-600 hover:text-forest-800 flex items-center gap-1 transition-colors"
                        >
                          🎫 Reserve a spot →
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })()}
            </div>
          )}

          {/* WSDOT alerts link */}
          <p className="text-sm text-stone-600 mt-4 text-center">
            Full alerts and sailing updates:{' '}
            <a
              href="https://www.wsdot.wa.gov/ferries/alerts/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
            >
              wsdot.wa.gov/ferries/alerts
            </a>
          </p>
        </section>

        {/* ── Section B: Terminal Cameras ───────────────────────────────── */}
        <section>
          <div className="mb-6">
            <h2
              className="text-2xl font-semibold text-stone-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
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

        {/* ── Section C: Vessel Watch ────────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Vessel Watch
          </h2>
          <a
            href="https://wsdot.com/ferries/vesselwatch/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gradient-to-br from-sound-800 to-forest-800 rounded-2xl p-8 hover:from-sound-700 hover:to-forest-700 transition-all shadow-warm-md"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-3xl mb-3" aria-hidden="true">🗺️</p>
                <h3
                  className="text-2xl font-bold text-parchment-50 mb-2 group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
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

        {/* ── Section D: Helpful Links Row ──────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
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
