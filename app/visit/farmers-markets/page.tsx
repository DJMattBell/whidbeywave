import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Whidbey Island Farmers Markets — Schedule and Locations',
  description:
    'Complete guide to farmers markets on Whidbey Island, WA — locations, schedules, seasons, and what to expect at each market.',
  keywords:
    'whidbey island farmers market, coupeville farmers market, langley market, south whidbey tilth, oak harbor market',
  openGraph: {
    title: 'Whidbey Island Farmers Markets — Schedule and Locations',
    description: 'Complete guide to farmers markets on Whidbey Island — locations, schedules, and what to expect.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whidbey Island Farmers Markets — Schedule and Locations',
    description: 'Complete guide to farmers markets on Whidbey Island.',
    images: ['/og-default.png'],
  },
};

// Fully static — no database queries needed

const MARKETS = [
  {
    emoji:    '🥕',
    name:     'Coupeville Farmers Market',
    location: 'Coupeville Town Center parking lot, 8th & Alexander St',
    season:   'Saturdays, April through October',
    hours:    '10:00 AM – 2:00 PM',
    body:     'Fresh produce, flowers, baked goods, crafts, and local vendors. One of the most picturesque markets on the island — right in the heart of historic Coupeville, steps from the wharf and Victorian storefronts. A genuine small-town market with a long-running community feel.',
    tip:      'Get there by 10:30 — the good bread sells out fast.',
    bg:       'bg-amber-50 border-amber-200',
    accent:   'text-amber-700',
  },
  {
    emoji:    '🌿',
    name:     'South Whidbey Tilth Farmers Market',
    location: 'Tilth Farm Campus, Freeland',
    season:   'Saturdays, May through October',
    hours:    '10:00 AM – 2:00 PM',
    body:     'The most farm-focused market on the island. Produce grown steps from where you\'re standing, eggs, meat, cheese, preserves, and community. Operated by the South Whidbey Tilth — an agricultural nonprofit that\'s been farming the island for decades.',
    tip:      'Bring cash and a cooler.',
    bg:       'bg-forest-50 border-forest-200',
    accent:   'text-forest-700',
  },
  {
    emoji:    '🌾',
    name:     'Oak Harbor Farmers Market',
    location: 'Windjammer Park, Oak Harbor',
    season:   'Thursdays, June through September',
    hours:    '3:00 PM – 7:00 PM',
    body:     'An evening market with local produce, prepared food vendors, flowers, and a relaxed waterfront atmosphere. Thursday evenings in summer, right on the water at Windjammer Park — a good reason to be in Oak Harbor.',
    tip:      'Thursday evenings in summer — combine with a walk along the waterfront.',
    bg:       'bg-sound-50 border-sound-200',
    accent:   'text-sound-700',
  },
  {
    emoji:    '🍎',
    name:     'Greenbank Farm Market',
    location: 'Greenbank Farm, 765 Wonn Rd, Greenbank',
    season:   'Select Sundays, summer through fall — check local listings',
    hours:    'Varies by event',
    body:     'The historic Greenbank Farm hosts seasonal markets and events on its beautiful grounds at the narrow waist of the island. Part farm store, part gathering place — the loganberry products alone are worth the stop.',
    tip:      'The farm store is open year-round even when markets aren\'t running.',
    bg:       'bg-terra-50 border-terra-200',
    accent:   'text-terra-700',
  },
];

const SEASONS = [
  { season: 'Spring', icon: '🌱', note: 'Markets start reopening in April — asparagus and rhubarb season. A few pop-up markets may appear earlier.' },
  { season: 'Summer', icon: '☀️', note: 'Peak season. All markets running, berries and corn, strawberry shortcake at every booth.' },
  { season: 'Fall',   icon: '🍂', note: 'Last weeks of the season — winter squash, apples, late tomatoes, and the best dried flowers.' },
  { season: 'Winter', icon: '🌧️', note: 'Most markets closed. Check individual sites for pop-up winter markets and holiday events.' },
];

export default function FarmersMarketsPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-forest-800 via-forest-700 to-amber-800 text-parchment-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-forest-300">
              <li><Link href="/visit" className="hover:text-parchment-100 transition-colors">Visit Whidbey</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-parchment-100">Farmers Markets</li>
            </ol>
          </nav>
          <p className="text-forest-300 font-medium mb-2 tracking-wide uppercase text-sm">🥕 Fresh & Local</p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 text-parchment-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Farmers Markets on Whidbey Island
          </h1>
          <p className="text-parchment-300 text-base max-w-xl leading-relaxed">
            Fresh, local, and worth the drive. Whidbey Island has a surprisingly strong market culture for an island its size.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* ── Market cards ────────────────────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Island Markets
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {MARKETS.map(({ emoji, name, location, season, hours, body, tip, bg, accent }) => (
              <div key={name} className={`rounded-2xl border overflow-hidden ${bg}`}>
                <div className="p-6">
                  <p className="text-3xl mb-3" aria-hidden="true">{emoji}</p>
                  <h3
                    className="text-lg font-bold text-stone-800 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {name}
                  </h3>
                  <div className="space-y-1 mb-4">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>{season}</p>
                    <p className="text-xs text-stone-500">🕐 {hours}</p>
                    <p className="text-xs text-stone-500">📍 {location}</p>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed mb-4">{body}</p>
                  <div className="bg-white/60 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-stone-600">
                      <span className="font-semibold text-stone-700">Local tip: </span>
                      {tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Seasonal guide ───────────────────────────────────────────── */}
        <section>
          <h2
            className="text-2xl font-semibold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            What to Expect Each Season
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SEASONS.map(({ season, icon, note }) => (
              <div key={season} className="bg-parchment-50 border border-parchment-200 rounded-2xl p-5">
                <p className="text-2xl mb-2" aria-hidden="true">{icon}</p>
                <p
                  className="font-bold text-stone-800 mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {season}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What to bring ────────────────────────────────────────────── */}
        <section className="bg-parchment-50 rounded-2xl border border-parchment-200 p-6 sm:p-8">
          <h2
            className="text-xl font-semibold text-stone-800 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            What to Bring
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: '💵', item: 'Cash', note: 'Many vendors are card-only now too, but cash is always welcome and often faster' },
              { icon: '🛍️', item: 'Reusable bags', note: 'You will buy more than you planned — always' },
              { icon: '🧊', item: 'A cooler', note: 'Essential for eggs, meat, dairy, and anything you want to last the drive home' },
              { icon: '🍴', item: 'An appetite', note: 'Most markets have prepared food vendors — breakfast burritos, pastries, hot drinks' },
            ].map(({ icon, item, note }) => (
              <div key={item} className="flex gap-3">
                <span className="text-xl shrink-0" aria-hidden="true">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{item}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-forest-50 rounded-2xl border border-forest-200 px-6 py-5">
          <p className="text-sm text-stone-600">
            See what events are happening this weekend, including any market pop-ups.
          </p>
          <Link
            href="/visit/this-weekend"
            className="shrink-0 text-sm font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2 transition-colors"
          >
            This Weekend on Whidbey →
          </Link>
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
