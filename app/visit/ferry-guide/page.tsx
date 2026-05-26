import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchFerryBarStatus } from '@/lib/ferry';
import type { RouteStatus } from '@/lib/ferry';

export const revalidate = 300; // 5 minutes — for live status widget

export const metadata: Metadata = {
  title: 'Ferry to Whidbey Island — Schedule, Tips & What to Expect',
  description:
    'How to get to Whidbey Island by ferry — Mukilteo to Clinton route, schedules, wait times, tips for avoiding lines, and what to do once you arrive.',
  keywords:
    'ferry to whidbey island, mukilteo clinton ferry, whidbey island ferry schedule, how to get to whidbey island',
  openGraph: {
    title: 'Ferry to Whidbey Island — Schedule, Tips & What to Expect',
    description: 'How to get to Whidbey Island by ferry — schedules, wait time tips, and what to expect.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferry to Whidbey Island — Schedule, Tips & What to Expect',
    description: 'How to get to Whidbey Island by ferry.',
    images: ['/og-default.png'],
  },
};

// ── Status helpers ────────────────────────────────────────────────────────────

function statusLabel(s: RouteStatus) {
  return s === 'cancelled' ? 'Cancelled' : s === 'delays' ? 'Delays reported' : 'On Schedule';
}
function statusColor(s: RouteStatus) {
  return s === 'cancelled' ? 'text-terra-600 font-semibold'
       : s === 'delays'    ? 'text-amber-600 font-semibold'
       :                     'text-forest-600';
}
function dotColor(s: RouteStatus) {
  return s === 'cancelled' ? 'bg-terra-500' : s === 'delays' ? 'bg-amber-500' : 'bg-forest-500';
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FerryGuidePage() {
  const ferry = await fetchFerryBarStatus();
  const hasMuk = ferry.mukilteoClinton != null;
  const hasPT  = ferry.ptCoupeville  != null;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-stone-500 justify-center">
              <li><Link href="/visit" className="hover:text-forest-600 transition-colors">Visit Whidbey</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-stone-700">Getting Here</li>
            </ol>
          </nav>
          <p className="text-sound-600 font-medium mb-2 tracking-wide uppercase text-sm">Getting Here</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Getting to Whidbey Island
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know about the ferry — from a local.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* ── Live status widget ─────────────────────────────────────── */}
        {(hasMuk || hasPT) && (
          <section>
            <h2 className="text-xl font-semibold text-stone-800 mb-4">
              Current Ferry Status
            </h2>
            <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-5 flex flex-col sm:flex-row gap-6 justify-between items-start">
              <div className="space-y-3">
                {hasMuk && (
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dotColor(ferry.mukilteoClinton!.status)}`} aria-hidden="true" />
                    <div>
                      <p className="text-xs text-stone-600 leading-tight">Mukilteo / Clinton</p>
                      <p className={`text-sm leading-tight ${statusColor(ferry.mukilteoClinton!.status)}`}>
                        {statusLabel(ferry.mukilteoClinton!.status)}
                      </p>
                    </div>
                  </div>
                )}
                {hasPT && (
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dotColor(ferry.ptCoupeville!.status)}`} aria-hidden="true" />
                    <div>
                      <p className="text-xs text-stone-600 leading-tight">Port Townsend / Coupeville</p>
                      <p className={`text-sm leading-tight ${statusColor(ferry.ptCoupeville!.status)}`}>
                        {statusLabel(ferry.ptCoupeville!.status)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/ferry"
                className="shrink-0 text-sm font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2 transition-colors"
              >
                Full schedule & departures →
              </Link>
            </div>
          </section>
        )}

        {/* ── Your two options ────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            Your Two Options
          </h2>
          <div className="grid md:grid-cols-2 gap-5">

            {/* Mukilteo ferry */}
            <div className="bg-sound-50 border border-sound-200 rounded-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-sound-400 to-forest-500" />
              <div className="p-6">
                <p className="text-2xl mb-3" aria-hidden="true">⛴️</p>
                <h3 className="text-lg font-bold text-stone-800 mb-0.5">
                  Mukilteo → Clinton
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-sound-600 mb-4">
                  Recommended · 20-minute crossing
                </p>
                <p className="text-sm text-stone-700 leading-relaxed mb-4">
                  The main ferry. Runs roughly every 30–60 minutes, all day. Mukilteo terminal is off
                  I-5 exit 182 — about 30 minutes south of Everett and 35 minutes north of Seattle.
                </p>
                <div className="space-y-2 mb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-600">Local tips</p>
                  {[
                    'Walk-on passengers never wait — park in Mukilteo and walk on if you\'re staying at the south end',
                    'Driving on weekends: arrive 30–60 min early in summer, especially Fridays',
                    'The WA Ferries app shows live wait times — use it before you leave home',
                    'Reservations available on WSDOT for vehicles during peak season',
                    '20 minutes on the water — worth getting out of your car for the view',
                  ].map(tip => (
                    <p key={tip} className="text-sm text-stone-600 flex gap-2">
                      <span className="text-sound-400 shrink-0 mt-0.5">→</span>
                      {tip}
                    </p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/ferry" className="text-sm font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2 transition-colors">
                    Live status →
                  </Link>
                  <a
                    href="https://wsdot.wa.gov/travel/washington-state-ferries/routes-schedule/mukilteo-clinton"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-sound-600 hover:text-sound-800 underline underline-offset-2 transition-colors"
                  >
                    WSDOT schedule →
                  </a>
                </div>
              </div>
            </div>

            {/* Deception Pass */}
            <div className="bg-forest-50 border border-forest-200 rounded-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-forest-400 to-amber-400" />
              <div className="p-6">
                <p className="text-2xl mb-3" aria-hidden="true">🌉</p>
                <h3 className="text-lg font-bold text-stone-800 mb-0.5">
                  Deception Pass Bridge
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-4">
                  No ferry · Drive over the north end
                </p>
                <p className="text-sm text-stone-700 leading-relaxed mb-4">
                  Drive via Highway 20 from Anacortes. No wait, no schedule — just a dramatic bridge crossing
                  over a narrow, churning channel at the north end of the island.
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Best if you&apos;re:</p>
                <ul className="space-y-1.5 mb-5">
                  {[
                    'Coming from north of Seattle, Bellingham, or Canada',
                    'Heading to eastern Washington and cutting through',
                    'Flexible and ferry waits are running long',
                    'A first-time visitor who wants the bridge experience',
                  ].map(item => (
                    <li key={item} className="text-sm text-stone-600 flex gap-2">
                      <span className="text-forest-400 shrink-0 mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-stone-600 italic">
                  Note: adds significant driving time from Seattle — the ferry is usually faster if coming from south.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Once you're on the island ──────────────────────────────── */}
        <section className="bg-parchment-50 border border-parchment-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-3">
            Once You&apos;re On the Island
          </h2>
          <p className="text-stone-600 leading-relaxed max-w-2xl">
            One main road runs the length of the island — SR-20 north to south. Langley is south end
            (20 minutes from Clinton ferry), Coupeville is center (45 minutes), Oak Harbor is north end
            (1 hour). There&apos;s no rush. That&apos;s the point.
          </p>
        </section>

        {/* ── Quick tips ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
            Quick Tips from Locals
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                emoji: '📱',
                tip:   'Check live status before you go',
                detail: 'The WA Ferries app and this site both show live wait times. Five minutes of checking can save an hour of waiting.',
              },
              {
                emoji: '📅',
                tip:   'Summer Fridays are the worst',
                detail: 'The Friday afternoon rush onto the island is real. Go Thursday evening or Saturday morning if you can.',
              },
              {
                emoji: '🚶',
                tip:   'Walk-ons always get on',
                detail: 'If waits are long, park your car in Mukilteo, walk onto the ferry, and rent or borrow a car on the island. Walk-on passengers never get turned away.',
              },
              {
                emoji: '🚲',
                tip:   'Bikes get priority boarding',
                detail: 'Bicycles board first and don\'t count against car capacity. A great option for a car-free island day.',
              },
            ].map(({ emoji, tip, detail }) => (
              <div key={tip} className="bg-parchment-50 border border-parchment-200 rounded-xl p-5">
                <p className="text-2xl mb-2" aria-hidden="true">{emoji}</p>
                <p className="font-heading font-semibold text-stone-800 mb-1.5 leading-snug">
                  {tip}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Links ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            Useful Links
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: '/ferry',    label: 'Live Ferry Status',          emoji: '🚢', external: false },
              { href: '/tides',    label: 'Full Tide Tables',           emoji: '🌊', external: false },
              {
                href:     'https://www.wsdot.wa.gov/ferries',
                label:    'WSDOT Official Schedule',
                emoji:    '📋',
                external: true,
              },
              {
                href:     'https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/default.aspx',
                label:    'WSF Reservations',
                emoji:    '🎫',
                external: true,
              },
            ].map(({ href, label, emoji, external }) => {
              const cls = 'card p-4 flex items-center gap-3 group hover:border-forest-200 transition-colors';
              const inner = (
                <>
                  <span className="text-xl shrink-0" aria-hidden="true">{emoji}</span>
                  <span className="text-sm font-semibold text-stone-700 group-hover:text-forest-700 transition-colors leading-snug">
                    {label}
                  </span>
                  <span className="ml-auto text-forest-400 group-hover:text-forest-600 transition-colors shrink-0 text-xs">→</span>
                </>
              );
              return external ? (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link key={href} href={href} className={cls}>{inner}</Link>
              );
            })}
          </div>
        </section>

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
