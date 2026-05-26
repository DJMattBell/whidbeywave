import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Visiting Whidbey Island — Travel Guide & Local Tips',
  description:
    'Visiting Whidbey Island? Find things to do, restaurants, farmers markets, ferry info, and weekend events on Washington\'s longest island.',
  keywords:
    'whidbey island travel guide, visiting whidbey island, whidbey island things to do, ferry to whidbey island',
  openGraph: {
    title: 'Visiting Whidbey Island — Travel Guide & Local Tips',
    description: 'Visiting Whidbey Island? Find things to do, restaurants, farmers markets, ferry info, and weekend events.',
    siteName: 'WhidbeyWave',
    images: [{ url: `/api/og?title=${encodeURIComponent('Visit Whidbey Island')}&subtitle=${encodeURIComponent('Travel Guide & Local Tips')}`, width: 1200, height: 630 }],
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VisitPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-600 font-medium mb-2 tracking-wide uppercase text-sm">
            Whidbey Island, Washington
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Welcome to Whidbey Island
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            The longest island in the contiguous US — and one of the best kept secrets in the Pacific Northwest.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* ── Explore Whidbey hub cards ──────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-2">
            Explore Whidbey
          </h2>
          <p className="text-stone-500 text-sm mb-6">Quick links to everything you need to plan your visit.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href:    '/visit/this-weekend',
                emoji:   '📅',
                title:   'This Weekend on Whidbey',
                desc:    "Find out what's happening this Friday through Sunday — events, markets, and things to do.",
                bg:      'bg-forest-50 border-forest-200',
                accent:  'text-forest-600',
              },
              {
                href:    '/visit/restaurants',
                emoji:   '🍽️',
                title:   'Restaurants & Cafes',
                desc:    'Neighbor-recommended places to eat across the island — from Penn Cove mussels to the best slice of pie on Whidbey.',
                bg:      'bg-amber-50 border-amber-200',
                accent:  'text-amber-700',
              },
              {
                href:    '/visit/farmers-markets',
                emoji:   '🥕',
                title:   'Farmers Markets',
                desc:    'Fresh, local, and worth the drive. Full schedule of island markets by season.',
                bg:      'bg-terra-50 border-terra-200',
                accent:  'text-terra-700',
              },
              {
                href:    '/visit/ferry-guide',
                emoji:   '🚢',
                title:   'Getting Here',
                desc:    'Everything you need to know about the ferry — schedules, tips, and what to expect.',
                bg:      'bg-sound-50 border-sound-200',
                accent:  'text-sound-700',
              },
            ].map(({ href, emoji, title, desc, bg, accent }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-xl border p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200 shadow-warm-sm hover:shadow-warm ${bg}`}
              >
                <span className="text-3xl" aria-hidden="true">{emoji}</span>
                <div>
                  <p className="font-heading font-semibold text-stone-800 mb-1 leading-snug">
                    {title}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
                </div>
                <span className={`text-sm font-semibold mt-auto ${accent}`}>Explore →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Getting Here ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-5">Getting Here</h2>
          <p className="text-stone-600 mb-6 max-w-2xl leading-relaxed">
            There are two ways onto the island. Most visitors come by ferry — it&apos;s part of the experience.
          </p>

          <div className="grid md:grid-cols-2 gap-5">

            {/* Ferry card */}
            <div className="bg-sound-50 border border-sound-200 rounded-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-sound-400 to-forest-500" />
              <div className="p-6">
                <p className="text-2xl mb-3" aria-hidden="true">⛴️</p>
                <h3 className="text-lg font-bold text-stone-800 mb-1">
                  Ferry from Mukilteo
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-sound-600 mb-4">
                  Most common route · Clinton, South Whidbey
                </p>
                <ul className="space-y-2.5 text-sm text-stone-700">
                  <li className="flex gap-2">
                    <span className="text-sound-500 mt-0.5 shrink-0">→</span>
                    <span>20-minute crossing from Mukilteo — about 30 minutes south of Everett, 45 minutes from Seattle</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sound-500 mt-0.5 shrink-0">→</span>
                    <span>Runs frequently — roughly every 30–60 minutes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sound-500 mt-0.5 shrink-0">→</span>
                    <span>Walk-ons: no reservation needed, just show up</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sound-500 mt-0.5 shrink-0">→</span>
                    <span>Cars: arrive early, especially on summer weekends — lines can be long</span>
                  </li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/ferry"
                    className="text-sm font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2 transition-colors"
                  >
                    🚢 Live ferry status →
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

            {/* Bridge card */}
            <div className="bg-forest-50 border border-forest-200 rounded-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-forest-400 to-amber-400" />
              <div className="p-6">
                <p className="text-2xl mb-3" aria-hidden="true">🌉</p>
                <h3 className="text-lg font-bold text-stone-800 mb-1">
                  Deception Pass Bridge
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-forest-600 mb-4">
                  No ferry needed · North end of the island
                </p>
                <ul className="space-y-2.5 text-sm text-stone-700">
                  <li className="flex gap-2">
                    <span className="text-forest-500 mt-0.5 shrink-0">→</span>
                    <span>Drive via Highway 20 from Anacortes — no ferry, no wait</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest-500 mt-0.5 shrink-0">→</span>
                    <span>Best approach if coming from the north or east (Bellingham, eastern Washington)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest-500 mt-0.5 shrink-0">→</span>
                    <span>Dramatic bridge crossing over a narrow, churning channel — worth stopping to walk it</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-forest-500 mt-0.5 shrink-0">→</span>
                    <span>Adds driving time to reach the south end, but the scenery is the reward</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* ── Island at a Glance ────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-5">The Island at a Glance</h2>

          <div className="bg-parchment-50 border border-parchment-200 rounded-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 to-terra-400" />
            <div className="p-6 grid sm:grid-cols-2 gap-x-10 gap-y-4">
              {[
                { label: 'Length',      value: '55 miles — connected by one main road (Hwy 20/525)' },
                { label: 'Towns',       value: 'Oak Harbor (north), Coupeville (center), Langley (south)' },
                { label: 'Population', value: '~70,000 year-round residents' },
                { label: 'Fun fact',    value: 'Langley has no traffic lights — it\'s a matter of local pride' },
                { label: 'Famous for',  value: 'Penn Cove mussels, gray whale migration, historic farmland, art community' },
                { label: 'Climate',     value: 'Mild and moody — rain shadow keeps it drier than Seattle, fog is free' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="text-forest-400 mt-0.5 shrink-0">▸</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600">{label} </span>
                    <span className="text-sm text-stone-700 leading-snug">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Towns Guide ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-5">The Main Towns</h2>
          <p className="text-stone-600 mb-6 max-w-2xl leading-relaxed">
            Each town has its own personality. Here&apos;s the honest version of what makes each one worth visiting.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                emoji:   '🌊',
                name:    'Langley',
                where:   'South End',
                tagline: 'Artsy, walkable waterfront village.',
                body:    'Galleries, cafes, boutiques, and a proper community theater. Wander First Street, grab an espresso, and watch the ferries cross the sound from the bluff. Small enough to walk in an afternoon, interesting enough to stay a weekend.',
                knowFor: ['Mystery Weekend (February)', 'Gray whale watching from Seacliff Park', 'Best espresso on the island'],
                bg:      'bg-sound-50 border-sound-200',
                accent:  'text-sound-700',
              },
              {
                emoji:   '⚓',
                name:    'Coupeville',
                where:   'Center Island',
                tagline: 'Historic waterfront — one of Washington\'s oldest towns.',
                body:    'Penn Cove mussels come from right here. Walk the wharf, browse the Victorian storefronts, and drive out to Ebey\'s Landing for one of the most beautiful views in the state. Slow, quiet, and genuinely lovely.',
                knowFor: ['Penn Cove Mussels Festival (March)', 'Ebey\'s Landing National Reserve', 'The most photogenic main street on the island'],
                bg:      'bg-parchment-50 border-parchment-200',
                accent:  'text-stone-600',
              },
              {
                emoji:   '🛩️',
                name:    'Oak Harbor',
                where:   'North End',
                tagline: 'Largest town, practical and proud.',
                body:    'Home to Naval Air Station Whidbey Island. You\'ll find the most services here — grocery stores, hardware, chain restaurants — alongside a beautiful waterfront park and Dutch heritage that shows up every spring.',
                knowFor: ['Holland Happening Festival (April)', 'Windjammer Park on the waterfront', 'Deception Pass State Park is minutes away'],
                bg:      'bg-forest-50 border-forest-200',
                accent:  'text-forest-700',
              },
            ].map(({ emoji, name, where, tagline, body, knowFor, bg, accent }) => (
              <div key={name} className={`rounded-xl border overflow-hidden ${bg}`}>
                <div className="p-5">
                  <p className="text-3xl mb-2" aria-hidden="true">{emoji}</p>
                  <h3 className="text-lg font-bold text-stone-800 mb-0.5">
                    {name}
                  </h3>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${accent}`}>{where}</p>
                  <p className="text-sm font-semibold text-stone-700 mb-2">{tagline}</p>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">{body}</p>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Known for</p>
                    <ul className="space-y-1">
                      {knowFor.map(item => (
                        <li key={item} className="text-xs text-stone-600 flex gap-1.5">
                          <span className="text-stone-600 shrink-0">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Best Times to Visit ───────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-5">Best Times to Visit</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                season: 'Spring',
                months: 'Mar – May',
                emoji:  '🐋',
                color:  'bg-sound-50 border-sound-200',
                label:  'text-sound-700',
                items:  ['Gray whale migration along the west side', 'Wildflowers at Ebey\'s Landing', 'Uncrowded ferries and empty beaches', 'Penn Cove Mussels Festival (March)'],
              },
              {
                season: 'Summer',
                months: 'Jun – Aug',
                emoji:  '☀️',
                color:  'bg-amber-50 border-amber-200',
                label:  'text-amber-700',
                items:  ['Weekly farmers markets in every town', 'Warm evenings on the waterfront', 'Busiest ferry lines — plan ahead', 'Island festivals and outdoor events'],
              },
              {
                season: 'Fall',
                months: 'Sep – Nov',
                emoji:  '🍄',
                color:  'bg-terra-50 border-terra-200',
                label:  'text-terra-700',
                items:  ['Harvest festivals and farm stands', 'Mushroom foraging in the woods', 'Moody fog rolling off the sound', 'Cozy cafes with shorter waits'],
              },
              {
                season: 'Winter',
                months: 'Dec – Feb',
                emoji:  '🌧️',
                color:  'bg-forest-50 border-forest-200',
                label:  'text-forest-700',
                items:  ['Quiet, local, and peaceful', 'Storm watching from the beaches', 'Holiday markets and local craft fairs', 'Mystery Weekend (Langley, February)'],
              },
            ].map(({ season, months, emoji, color, label, items }) => (
              <div key={season} className={`rounded-xl border p-5 ${color}`}>
                <p className="text-2xl mb-1" aria-hidden="true">{emoji}</p>
                <p className="font-heading font-bold text-stone-800 mb-0.5">
                  {season}
                </p>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${label}`}>{months}</p>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="text-xs text-stone-600 flex gap-1.5">
                      <span className="text-stone-600 shrink-0 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Things Locals Love ────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-5">Things Locals Love</h2>
          <p className="text-stone-600 mb-6 max-w-2xl leading-relaxed">
            Not a generic tourist list. These are the things islanders actually do, recommend to friends, and genuinely miss when they leave.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                emoji: '🦪',
                title: 'Penn Cove Mussels',
                body: 'Eat them everywhere you can find them. The cold, nutrient-rich water of Penn Cove produces some of the best mussels in the world. Order them at every restaurant that serves them — they will not disappoint.',
              },
              {
                emoji: '🌅',
                title: 'Ebey\'s Landing at Sunset',
                body: 'Drive out to the trailhead at Ebey\'s Landing and walk the bluff trail as the sun goes down over the Olympics. One of the best free views in Washington state. Bring a jacket.',
              },
              {
                emoji: '🌊',
                title: 'Deception Pass at Low Tide',
                body: 'Most people just stop on the bridge. The real move is to get down to the beach and walk the shoreline when the tide is out. Starfish, sea anemones, and churning current through the narrows.',
              },
              {
                emoji: '🌫️',
                title: 'The Coupeville Wharf on a Foggy Morning',
                body: 'Fog rolls in off Penn Cove and turns the old wharf into something almost cinematic. Get there early with coffee before it burns off. It usually does by mid-morning.',
              },
              {
                emoji: '🥦',
                title: 'South Whidbey Tilth Farmers Market',
                body: 'Langley, Saturday mornings in season. Local farmers, baked goods, cut flowers, and the sense that you\'ve stumbled into a very good Saturday. Check the events page for current dates.',
              },
              {
                emoji: '🚗',
                title: 'Get Intentionally Lost on the Back Roads',
                body: 'The island is 55 miles long with plenty of side roads through farmland, forest, and coastline. Turn off the main highway and see what you find. You cannot really get that lost.',
              },
              {
                emoji: '📅',
                title: 'Check WhidbeyWave Before You Arrive',
                body: 'Seriously. Local events, farmers markets, music nights, and community happenings are worth planning around. The island has more going on than most visitors expect.',
              },
            ].map(({ emoji, title, body }) => (
              <div key={title} className="bg-parchment-50 border border-parchment-200 rounded-xl p-5 flex gap-4">
                <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{emoji}</span>
                <div>
                  <p className="font-heading font-semibold text-stone-800 mb-1">
                    {title}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Practical Tips ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-5">Practical Tips</h2>
          <p className="text-stone-600 mb-6 max-w-2xl leading-relaxed">
            The things the tourism brochures don&apos;t tell you.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                emoji: '🚢',
                tip: 'Check the ferry wait before you go',
                detail: 'Weekends fill up fast. Arriving at the Mukilteo terminal to a two-hour wait with a car is a rite of passage — but not a fun one.',
                link: { href: '/ferry', label: 'Live ferry status' },
              },
              {
                emoji: '📵',
                tip: 'Cell service is spotty in places',
                detail: 'Parts of the island, especially the west side and rural stretches, have patchy coverage. Download offline maps before you leave the mainland.',
                link: null,
              },
              {
                emoji: '🐋',
                tip: 'Spring means whale season',
                detail: 'Gray whales migrate through Puget Sound March through May. Binoculars are worth packing. Watch from Langley\'s Seacliff Park or Ebey\'s Landing.',
                link: null,
              },
              {
                emoji: '🌊',
                tip: 'Low tides are beachcombing gold',
                detail: 'Minus tides expose a whole different shoreline. Check the tide table before a beach day — timing it right makes all the difference.',
                link: { href: '/tides', label: 'This week\'s tides' },
              },
              {
                emoji: '☕',
                tip: 'Island time is real',
                detail: 'Nothing is open before 9am, most restaurants close early, and things move at a pace that will feel slow on day one and exactly right by day two.',
                link: null,
              },
              {
                emoji: '⛽',
                tip: 'Fill up your tank',
                detail: 'Gas stations exist, but so do long rural stretches between them. If you\'re driving the whole island, fill up when you see a station.',
                link: null,
              },
            ].map(({ emoji, tip, detail, link }) => (
              <div key={tip} className="bg-parchment-50 border border-parchment-200 rounded-xl p-5">
                <p className="text-2xl mb-2" aria-hidden="true">{emoji}</p>
                <p className="font-heading font-semibold text-stone-800 mb-1.5 leading-snug">
                  {tip}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{detail}</p>
                {link && (
                  <Link
                    href={link.href}
                    className="mt-2.5 inline-block text-sm font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2 transition-colors"
                  >
                    {link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Explore the Site CTA ──────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-forest-800 to-sound-800 text-parchment-100 rounded-2xl overflow-hidden">
          <div className="p-8 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-parchment-50 mb-3">
              Planning Your Visit?
            </h2>
            <p className="text-parchment-300 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Browse local events, check the ferry schedule, and find neighbor-recommended
              restaurants and services right here on WhidbeyWave.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: '/events',          label: '📅 Events' },
                { href: '/ferry',           label: '🚢 Ferry Status' },
                { href: '/recommendations', label: '🌿 Local Picks' },
                { href: '/tides',           label: '🌊 Tide Tables' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-5 py-2.5 rounded-xl bg-parchment-50/15 hover:bg-parchment-50/25 border border-parchment-50/20 text-parchment-100 text-sm font-semibold transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
