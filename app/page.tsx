import Link from 'next/link';
import { events, newsPosts, listings, formatShortDate, categoryColors } from '@/lib/data';
import WeatherTideWidget from '@/components/WeatherTideWidget';
import FerryAlerts from '@/components/FerryAlerts';
import TodayWidget from '@/components/TodayWidget';

export default function HomePage() {
  const upcomingEvents  = events.slice(0, 3);
  const latestNews      = newsPosts.slice(0, 2);
  const featuredListings = listings.slice(0, 3);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-forest-900 via-forest-800 to-sound-800 text-parchment-100 overflow-hidden">
        {/* Soft atmospheric blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-forest-600 opacity-20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sound-700 opacity-20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-800 opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-40 text-center">
          <div className="inline-flex items-center gap-2 bg-parchment-50/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium mb-8 border border-parchment-50/20">
            <span>🌊</span>
            <span className="text-parchment-200">Whidbey Island, Washington</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 text-parchment-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            WhidbeyWave
          </h1>

          <p className="text-xl md:text-2xl text-parchment-50 font-light max-w-lg mx-auto mb-5 tracking-wide">
            What&apos;s Happening &nbsp;·&nbsp; From the Island &nbsp;·&nbsp; Things for Sale
          </p>

          <p className="text-base md:text-lg text-parchment-200 max-w-xl mx-auto mb-12 leading-relaxed">
            Everything you need to know about what&apos;s going on around Whidbey —
            written for neighbors, by neighbors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/events" className="btn-primary bg-parchment-50 text-forest-800 hover:bg-parchment-100 shadow-warm-lg">
              See What&apos;s On
            </Link>
            <Link href="/marketplace" className="btn-secondary bg-parchment-100 text-forest-800 border-parchment-300/60 hover:bg-parchment-50">
              Browse Listings
            </Link>
          </div>
        </div>

        {/* Warm parchment wave transition */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 60L60 50C120 40 240 20 360 18C480 16 600 32 720 36C840 40 960 32 1080 26C1200 20 1320 16 1380 14L1440 12V60H0Z" fill="#fdfaf3" />
        </svg>
      </section>

      {/* ── Quick-links strip ────────────────────────────────────────────── */}
      <section className="bg-parchment-50 border-b border-parchment-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '📅', label: "What's Going On", href: '/events',      color: 'bg-forest-50 text-forest-700 hover:bg-forest-100' },
            { emoji: '📰', label: 'Island News',      href: '/news',        color: 'bg-sound-50 text-sound-700 hover:bg-sound-100' },
            { emoji: '🛒', label: 'Buy & Sell',       href: '/marketplace', color: 'bg-amber-50 text-amber-800 hover:bg-amber-100' },
            { emoji: '🤝', label: 'Barter & Trade',   href: '/barter',      color: 'bg-terra-50 text-terra-800 hover:bg-terra-100' },
          ].map(({ emoji, label, href, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-2 py-5 rounded-2xl font-semibold text-sm ${color} shadow-warm-sm hover:shadow-warm transition-all duration-200 hover:-translate-y-0.5 border border-parchment-200`}
            >
              <span className="text-3xl">{emoji}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Today at a Glance ───────────────────────────────────────────── */}
      <TodayWidget />

      {/* ── Weather & Tide ──────────────────────────────────────────────── */}
      <WeatherTideWidget />

      {/* ── Ferry Alerts ────────────────────────────────────────────────── */}
      <FerryAlerts />

      {/* ── Coming Up ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Coming Up on the Island</h2>
            <p className="section-subtitle mb-0">A few things worth putting on the calendar</p>
          </div>
          <Link href="/events" className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
            See all →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="card group">
              <div className="h-1.5 bg-gradient-to-r from-forest-400 to-sound-500" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                    {event.category}
                  </span>
                  <span className="text-2xl">{event.emoji}</span>
                </div>
                <h3
                  className="text-lg text-stone-900 mb-2 group-hover:text-forest-600 transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
                >
                  {event.title}
                </h3>
                <p className="text-[15px] text-stone-500 mb-1">📅 <time dateTime={event.date}>{formatShortDate(event.date)}</time> · {event.time}</p>
                <p className="text-[15px] text-stone-500 mb-4">📍 {event.town}</p>
                <p className="text-base text-stone-600 line-clamp-2">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/events" className="btn-secondary">See all events</Link>
        </div>
      </section>

      {/* ── From Around the Island (News) ───────────────────────────────── */}
      <section className="bg-parchment-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">From Around the Island</h2>
              <p className="section-subtitle mb-0">What your neighbors are talking about</p>
            </div>
            <Link href="/news" className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
              Read more →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {latestNews.map((post) => (
              <Link key={post.id} href={`/news#${post.slug}`} className="card p-6 block group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">{post.emoji}</div>
                  <div>
                    <span className={`badge ${categoryColors[post.category] ?? 'bg-parchment-200 text-stone-700'} mb-2`}>
                      {post.category}
                    </span>
                    <h3
                      className="text-stone-900 mb-1 group-hover:text-forest-600 transition-colors leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-[15px] text-stone-400 mb-2">
                      {formatShortDate(post.publishedAt)} · {post.readMinutes} min read
                    </p>
                    <p className="text-base text-stone-600">{post.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Things for Sale ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Things for Sale</h2>
            <p className="section-subtitle mb-0">Your neighbors are letting some things go</p>
          </div>
          <Link href="/marketplace" className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
            See everything →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <div key={listing.id} className="card group cursor-pointer">
              <div className="bg-gradient-to-br from-parchment-200 to-amber-100 h-32 flex items-center justify-center text-5xl">
                {listing.emoji}
              </div>
              <div className="p-5">
                <span className={`badge ${categoryColors[listing.category] ?? 'bg-parchment-200 text-stone-700'} mb-2`}>
                  {listing.category}
                </span>
                <h3
                  className="text-stone-900 mb-1 group-hover:text-forest-600 transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
                >
                  {listing.title}
                </h3>
                <p className="text-forest-600 font-bold text-lg mb-1">{listing.price}</p>
                <p className="text-[15px] text-stone-500">📍 {listing.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-forest-800 to-sound-800 text-parchment-100 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-parchment-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Keep up with the island
          </h2>
          <p className="text-parchment-300 text-lg mb-8 leading-relaxed">
            Got an event, a story, or something to sell? We&apos;d love to hear from you.
            This is your site as much as ours.
          </p>
          <Link href="/contact" className="btn-primary bg-parchment-50 text-forest-800 hover:bg-parchment-100">
            Say Hello
          </Link>
        </div>
      </section>
    </>
  );
}
