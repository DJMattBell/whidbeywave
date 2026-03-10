import Link from 'next/link';
import { formatShortDate, categoryColors } from '@/lib/data';
import { formatPrice } from '@/lib/marketplace';
import { createServerClient } from '@/lib/supabase';
import WeatherTideWidget from '@/components/WeatherTideWidget';
import FerryAlerts from '@/components/FerryAlerts';
import TodayWidget from '@/components/TodayWidget';
import AddToCalendar from '@/components/AddToCalendar';

export const revalidate = 300; // 5 minutes

const CATEGORY_EMOJI: Record<string, string> = {
  'Nature & Wildlife':     '🌿',
  'Arts & Culture':        '🎨',
  'Farmers Market':        '🥕',
  'Music & Performance':   '🎵',
  'Outdoors & Recreation': '🌲',
  'Film & Media':          '🎬',
  'Community & Social':    '🤝',
  'Classes & Workshops':   '📚',
  'Food & Drink':          '🍽️',
  'Sports & Fitness':      '🏃',
};

export default async function HomePage() {
  const supabase = createServerClient();

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

  const { data: eventsData } = await supabase
    .from('event_submissions')
    .select('id, title, date, time, town, category, description, tags')
    .eq('status', 'approved')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(3);

  const upcomingEvents = eventsData ?? [];

  const { data: newsData } = await supabase
    .from('news_posts')
    .select('id, title, excerpt, category, published_at, read_minutes, slug, emoji')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(2);

  const latestNews = (newsData ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    publishedAt: p.published_at,
    readMinutes: p.read_minutes,
    slug: p.slug,
    emoji: p.emoji ?? '📰',
  }));

  const now = new Date().toISOString();
  const { data: featuredListingsData } = await supabase
    .from('listings')
    .select('id, title, price, is_free, category, location, emoji, images')
    .eq('status', 'approved')
    .eq('sold', false)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(3);
  const featuredListings = (featuredListingsData ?? []) as {
    id: string; title: string; price: number | null; is_free: boolean;
    category: string; location: string; emoji: string; images: string[];
  }[];

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-forest-900 via-forest-800 to-sound-800 text-parchment-100 overflow-hidden">
        {/* Soft atmospheric blobs */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-forest-600 opacity-20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sound-700 opacity-20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-800 opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-32 text-center">
          <div className="hidden sm:inline-flex items-center gap-2 bg-parchment-50/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium mb-8 border border-parchment-50/20">
            <span>🌊</span>
            <span className="text-parchment-200">Whidbey Island, Washington</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-3 md:mb-6 text-parchment-50"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            WhidbeyWave
          </h1>

          <p className="text-lg md:text-2xl text-parchment-50 font-light max-w-lg mx-auto mb-2 md:mb-3 tracking-wide">
            The easiest way to see what&apos;s happening on Whidbey Island
          </p>

          <p className="hidden sm:block text-base md:text-lg text-parchment-200 max-w-xl mx-auto mb-12 leading-relaxed">
            Everything you need to know about what&apos;s going on around Whidbey —
            written for neighbors, by neighbors.
          </p>

          <div className="flex flex-col items-center gap-3 mb-4 md:mb-12">
            <Link href="/events" className="btn-primary bg-parchment-50 text-forest-800 hover:bg-parchment-100 shadow-warm-lg">
              See What&apos;s On
            </Link>
            <Link href="/marketplace" className="min-h-[44px] flex items-center text-sm text-parchment-200 hover:text-parchment-50 transition-colors">
              or browse the marketplace →
            </Link>
          </div>
        </div>

        {/* Wave transition — shorter on mobile */}
        <svg className="absolute bottom-0 left-0 w-full hidden sm:block" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 60L60 50C120 40 240 20 360 18C480 16 600 32 720 36C840 40 960 32 1080 26C1200 20 1320 16 1380 14L1440 12V60H0Z" fill="#fdfaf3" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full sm:hidden" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 40L60 33C120 26 240 13 360 12C480 11 600 21 720 24C840 27 960 21 1080 17C1200 13 1320 11 1380 9L1440 8V40H0Z" fill="#fdfaf3" />
        </svg>
      </section>

      {/* ── Mobile quick-access strip (phones only) ─────────────────────── */}
      <section className="md:hidden bg-parchment-50 border-b border-parchment-200">
        <div className="flex overflow-x-auto gap-3 px-4 py-4 scrollbar-none">
          {[
            { emoji: '📅', label: "What's On",   href: '/events'      },
            { emoji: '📰', label: 'Island News',  href: '/news'        },
            { emoji: '🛒', label: 'Buy & Sell',   href: '/marketplace' },
            { emoji: '🚢', label: 'Ferry',         href: '/ferry'       },
            { emoji: '🌊', label: 'Tides',         href: '/tides'       },
          ].map(({ emoji, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 shrink-0 px-4 py-3 rounded-2xl bg-parchment-100 border border-parchment-200 hover:bg-forest-50 hover:border-forest-300 transition-colors min-w-[80px] text-center"
            >
              <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
              <span className="text-xs font-semibold text-stone-700 whitespace-nowrap">{label}</span>
            </Link>
          ))}
          <Link
            href="/submit-event"
            className="flex flex-col items-center gap-1.5 shrink-0 px-4 py-3 rounded-2xl bg-forest-500 border border-forest-600 hover:bg-forest-600 transition-colors min-w-[80px] text-center"
          >
            <span className="text-2xl leading-none" aria-hidden="true">➕</span>
            <span className="text-xs font-semibold text-parchment-50 whitespace-nowrap">Submit</span>
          </Link>
        </div>
      </section>

      {/* ── Quick-links strip (desktop only) ────────────────────────────── */}
      <section className="hidden md:block bg-parchment-50 border-b border-parchment-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '📅', label: "What's Going On", href: '/events',      color: 'bg-forest-50 text-forest-700 hover:bg-forest-100' },
            { emoji: '📰', label: 'Island News',      href: '/news',        color: 'bg-sound-50 text-sound-700 hover:bg-sound-100' },
            { emoji: '🛒', label: 'Buy & Sell',       href: '/marketplace', color: 'bg-amber-50 text-amber-800 hover:bg-amber-100' },
            { emoji: '💬', label: 'Ask the Island',   href: '/forum',       color: 'bg-terra-50 text-terra-800 hover:bg-terra-100' },
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Coming Up on the Island</h2>
            <p className="section-subtitle mb-0">A few things worth putting on the calendar</p>
          </div>
          <Link href="/events" className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
            See all →
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-stone-600 text-lg mb-4">Nothing on the calendar yet — check back soon or submit an event!</p>
            <Link href="/submit-event" className="btn-secondary">Submit an Event →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="card group flex flex-col block">
                <div className="h-1.5 bg-gradient-to-r from-forest-400 to-sound-500" />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`badge ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {event.category}
                    </span>
                    <span className="text-2xl">{CATEGORY_EMOJI[event.category] ?? '📅'}</span>
                  </div>
                  <h3
                    className="text-lg text-stone-900 mb-2 group-hover:text-forest-600 transition-colors"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
                  >
                    {event.title}
                  </h3>
                  <p className="text-[15px] text-stone-600 mb-1">📅 <time dateTime={event.date}>{formatShortDate(event.date)}</time> · {event.time}</p>
                  <p className="text-[15px] text-stone-600 mb-4">📍 {event.town}</p>
                  <p className="text-base text-stone-600 line-clamp-2 mb-4">{event.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-parchment-200">
                    <AddToCalendar
                      event={{
                        title:       event.title,
                        date:        event.date,
                        time:        event.time,
                        location:    event.town,
                        description: event.description,
                      }}
                    />
                    <span className="text-sm text-forest-600 group-hover:text-forest-800 transition-colors shrink-0">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link href="/events" className="text-forest-600 hover:text-forest-800 font-medium text-sm">
            See all events →
          </Link>
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

          {latestNews.length === 0 ? (
            <div className="card p-8 text-center col-span-2">
              <p className="text-stone-600 mb-3">Nothing published yet — check back soon.</p>
              <Link href="/contact" className="text-forest-600 hover:text-forest-800 font-medium text-sm">
                Got a story? Share it →
              </Link>
            </div>
          ) : (
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
                      <p className="text-[15px] text-stone-600 mb-2">
                        {formatShortDate(post.publishedAt)} · {post.readMinutes} min read
                      </p>
                      <p className="text-base text-stone-600">{post.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Things for Sale ─────────────────────────────────────────────── */}
      {featuredListings.length > 0 && (
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
              <Link key={listing.id} href={`/marketplace/${listing.id}`} className="card group block">
                <div className="bg-gradient-to-br from-parchment-200 to-amber-100 h-32 flex items-center justify-center overflow-hidden">
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    : <span className="text-5xl">{listing.emoji}</span>
                  }
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
                  <p className="text-forest-600 font-bold text-lg mb-1">{formatPrice(listing.price, listing.is_free)}</p>
                  <p className="text-[15px] text-stone-600 mb-3">📍 {listing.location}</p>
                  <p className="text-sm text-forest-600">View listing →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
            Got an event or something to sell? Add it here — this is your site as much as ours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <Link
              href="/submit-event"
              className="btn-primary bg-parchment-50 text-forest-800 hover:bg-parchment-100 min-h-[48px]"
            >
              📅 Submit an Event
            </Link>
            <Link
              href="/submit-listing"
              className="btn-primary bg-transparent border-2 border-parchment-300 text-parchment-100 hover:bg-parchment-50/10 min-h-[48px]"
            >
              🏷️ Post a Listing
            </Link>
          </div>
          <Link href="/contact" className="text-parchment-400 hover:text-parchment-200 text-sm transition-colors">
            Or just say hello →
          </Link>
        </div>
      </section>
    </>
  );
}
