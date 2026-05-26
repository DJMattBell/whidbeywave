import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { formatShortDate, categoryColors } from '@/lib/data';
import { CATEGORY_EMOJI } from '@/lib/constants';
import { formatPrice } from '@/lib/marketplace';
import { createServerClient } from '@/lib/supabase';
import WeatherTideWidget from '@/components/WeatherTideWidget';
import FerryAlerts from '@/components/FerryAlerts';
import TodayWidget from '@/components/TodayWidget';
import AddToCalendar from '@/components/AddToCalendar';
import PersonaSelector, { PersonaBar } from '@/components/PersonaSelector';
import type { Persona } from '@/components/PersonaSelector';
import FerryStatusPill from '@/components/FerryStatusPill';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Suspense } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { Calendar, Gift, Newspaper } from 'lucide-react';

export const revalidate = 300; // 5 minutes

const VALID_PERSONAS = new Set(['local', 'visitor', 'ferry', 'dashboard']);

function getGreeting(): string {
  const hour = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'America/Los_Angeles',
  });
  const h = parseInt(hour, 10);
  if (h < 12) return 'Good morning, Whidbey';
  if (h < 17) return 'Good afternoon, Whidbey';
  return 'Good evening, Whidbey';
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const personaRaw = cookieStore.get('ww-persona')?.value;
  const persona: Persona | null = personaRaw && VALID_PERSONAS.has(personaRaw)
    ? (personaRaw as Persona)
    : null;

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

  // Free listings for "Neighbors are giving" section
  const { data: freeListingsData } = await supabase
    .from('listings')
    .select('id, title, location, images, emoji, created_at')
    .eq('status', 'approved')
    .eq('sold', false)
    .eq('is_free', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(8);
  const freeListings = (freeListingsData ?? []) as {
    id: string; title: string; location: string; images: string[]; emoji: string; created_at: string;
  }[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'WhidbeyWave',
        url: 'https://www.whidbeywave.com',
        description: 'Community hub for Whidbey Island, WA — events, news, marketplace, ferry info, and more.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.whidbeywave.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        name: 'WhidbeyWave',
        url: 'https://www.whidbeywave.com',
        logo: 'https://www.whidbeywave.com/logo.png',
        areaServed: {
          '@type': 'Place',
          name: 'Whidbey Island, Washington, USA',
        },
        serviceType: 'Community News and Events Platform',
      },
    ],
  };

  const greeting = getGreeting();

  // ── Section builders ──────────────────────────────────────────────────────

  const heroSection = (
    <section key="hero" className="bg-parchment-100 border-b border-parchment-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 text-center">
        <p className="text-sm text-stone-500 mb-2">{greeting}</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2 md:mb-3 text-stone-900">
          WhidbeyWave
        </h1>
        <p className="text-base md:text-lg text-stone-600 max-w-lg mx-auto mb-4 md:mb-6">
          {persona === 'visitor'
            ? 'Your guide to the best of Whidbey Island'
            : 'The easiest way to see what\u2019s happening on Whidbey Island'}
        </p>
        <Link href="/events" className="btn-primary">
          See What&apos;s On
        </Link>
      </div>
    </section>
  );

  const mobileQuickAccess = (
    <section key="mobile-quick" className="md:hidden bg-parchment-50 border-b border-parchment-200">
      {/* Ferry status pill */}
      <div className="px-4 pt-3">
        <Suspense fallback={null}>
          <FerryStatusPill />
        </Suspense>
      </div>
      <div className="flex overflow-x-auto gap-3 px-4 py-4 scrollbar-none">
        {[
          { emoji: '📅', label: "What's On",   href: '/events'      },
          { emoji: '📰', label: 'Island News',  href: '/news'        },
          { emoji: '📖', label: 'Guides',        href: '/guides'      },
          { emoji: '🛒', label: 'Buy & Sell',   href: '/marketplace' },
          { emoji: '🚢', label: 'Ferry',         href: '/ferry'       },
          { emoji: '🌊', label: 'Tides',         href: '/tides'       },
        ].map(({ emoji, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1.5 shrink-0 px-4 py-3 rounded-xl bg-parchment-100 border border-parchment-200 hover:bg-forest-50 hover:border-forest-300 transition-colors min-w-[80px] text-center"
          >
            <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
            <span className="text-xs font-semibold text-stone-700 whitespace-nowrap">{label}</span>
          </Link>
        ))}
        <Link
          href="/submit-event"
          className="flex flex-col items-center gap-1.5 shrink-0 px-4 py-3 rounded-xl bg-forest-600 border border-forest-700 hover:bg-forest-700 transition-colors min-w-[80px] text-center"
        >
          <span className="text-2xl leading-none" aria-hidden="true">➕</span>
          <span className="text-xs font-semibold text-parchment-50 whitespace-nowrap">Submit</span>
        </Link>
      </div>
    </section>
  );

  const desktopQuickLinks = (
    <section key="desktop-quick" className="hidden md:block bg-parchment-50 border-b border-parchment-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { emoji: '📅', label: "What's Going On", href: '/events',      color: 'bg-forest-50 text-forest-700 hover:bg-forest-100' },
          { emoji: '📰', label: 'Island News',      href: '/news',        color: 'bg-sound-50 text-sound-700 hover:bg-sound-100' },
          { emoji: '📖', label: 'Guides',           href: '/guides',      color: 'bg-forest-50 text-forest-700 hover:bg-forest-100' },
          { emoji: '🛒', label: 'Buy & Sell',       href: '/marketplace', color: 'bg-amber-50 text-amber-800 hover:bg-amber-100' },
          { emoji: '💬', label: 'Ask the Island',   href: '/forum',       color: 'bg-terra-50 text-terra-800 hover:bg-terra-100' },
        ].map(({ emoji, label, href, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-2 py-5 rounded-xl font-semibold text-sm ${color} shadow-warm-sm hover:shadow-warm transition-all duration-200 hover:-translate-y-0.5 border border-parchment-200`}
          >
            <span className="text-3xl">{emoji}</span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );

  const todayBlock = (
    <section key="today" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="card border-l-[3px] border-l-sound-600 p-5">
        <Suspense fallback={
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-parchment-200 rounded w-40" />
            <div className="h-20 bg-parchment-200 rounded-xl" />
          </div>
        }>
          <TodayWidget />
        </Suspense>
        <Suspense fallback={null}>
          <WeatherTideWidget />
        </Suspense>
        <Suspense fallback={null}>
          <FerryAlerts />
        </Suspense>
      </div>
    </section>
  );

  const eventsSection = (
    <section key="events" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
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
        <div className="empty-state">
          <Calendar size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">The calendar&apos;s looking quiet</h3>
          <p className="empty-state-text">Check back soon or submit your own community event.</p>
          <Link href="/submit-event" className="btn-primary">Submit an event</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="card-pressable group flex flex-col">
              <div className="h-1 bg-forest-600" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                    {event.category}
                  </span>
                  <span className="text-2xl">{CATEGORY_EMOJI[event.category] ?? '📅'}</span>
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-forest-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-stone-600 mb-1">📅 <time dateTime={event.date}>{formatShortDate(event.date)}</time> · {event.time}</p>
                <p className="text-sm text-stone-600 mb-4">📍 {event.town}</p>
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
  );

  const newsSection = (
    <section key="news" className="bg-parchment-100 py-12 md:py-16">
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
          <div className="empty-state">
            <Newspaper size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">The newsroom is between stories</h3>
            <p className="empty-state-text">Stories from the island will appear here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {latestNews.map((post) => (
              <Link key={post.id} href={`/news#${post.slug}`} className="card-pressable p-6 group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">{post.emoji}</div>
                  <div>
                    <span className={`badge ${categoryColors[post.category] ?? 'bg-parchment-200 text-stone-700'} mb-2`}>
                      {post.category}
                    </span>
                    <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-forest-600 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-stone-600 mb-2">
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
  );

  // "Neighbors are giving" section — only shows with ≥2 free listings
  const flashGivesSection = freeListings.length >= 2 ? (
    <section key="flash-gives" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift size={20} className="text-forest-600" />
            <h2 className="text-xl font-bold text-stone-900">Neighbors are giving</h2>
          </div>
          <p className="text-stone-500 text-sm">Free items from around the island</p>
        </div>
        <Link href="/marketplace?cat=Free+Stuff" className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
          See all free →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none md:grid md:grid-cols-4 md:overflow-visible motion-reduce:overflow-visible">
        {freeListings.map(listing => (
          <Link
            key={listing.id}
            href={`/marketplace/${listing.id}`}
            className="card-pressable group shrink-0 w-[200px] md:w-auto snap-start"
          >
            <div className="h-1 bg-gradient-to-r from-forest-500 to-forest-300" />
            <div className="relative bg-parchment-100 h-28 flex items-center justify-center overflow-hidden">
              {listing.images?.[0]
                ? <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="200px" />
                : <span className="text-4xl">{listing.emoji}</span>
              }
            </div>
            <div className="p-3">
              <span className="badge-free text-xs mb-1">Free</span>
              <h3 className="text-sm font-semibold text-stone-800 line-clamp-1 group-hover:text-forest-600 transition-colors">
                {listing.title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">📍 {listing.location}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-4 sm:hidden">
        <Link href="/marketplace?cat=Free+Stuff" className="text-forest-600 hover:text-forest-800 font-medium text-sm">
          See all free items →
        </Link>
      </div>
    </section>
  ) : null;

  const listingsSection = featuredListings.length > 0 ? (
    <section key="listings" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
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
          <Link key={listing.id} href={`/marketplace/${listing.id}`} className="card-pressable group">
            <div className="relative bg-gradient-to-br from-parchment-200 to-amber-100 h-32 flex items-center justify-center overflow-hidden">
              {listing.images?.[0]
                ? <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />
                : <span className="text-5xl">{listing.emoji}</span>
              }
            </div>
            <div className="p-5">
              <span className={`badge ${categoryColors[listing.category] ?? 'bg-parchment-200 text-stone-700'} mb-2`}>
                {listing.category}
              </span>
              <h3 className="text-stone-900 font-semibold mb-1 group-hover:text-forest-600 transition-colors">
                {listing.title}
              </h3>
              <p className="text-forest-600 font-bold text-lg mb-1">{formatPrice(listing.price, listing.is_free)}</p>
              <p className="text-sm text-stone-600 mb-3">📍 {listing.location}</p>
              <p className="text-sm text-forest-600">View listing →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  ) : null;

  const visitorCta = (
    <section key="visitor-cta" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="card p-6 sm:p-8 bg-sound-50 border-sound-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-4xl">🗺️</span>
          <div className="flex-1">
            <h2
              className="text-xl font-semibold text-stone-800 mb-1"
            >
              Planning your visit?
            </h2>
            <p className="text-stone-600 text-sm">
              Ferry tips, restaurants, farmers markets, and everything you need for a great trip.
            </p>
          </div>
          <Link href="/visit" className="btn-primary shrink-0">
            Visitor Guide →
          </Link>
        </div>
      </div>
    </section>
  );

  const closingCta = (
    <section key="closing" className="bg-forest-700 text-parchment-50 py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-parchment-50">
          This is your site as much as ours
        </h2>
        <p className="text-parchment-200 text-lg mb-8 leading-relaxed">
          Got an event or something to sell? Add it here. This place works because neighbors use it.
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
            className="btn-primary bg-transparent border border-parchment-300 text-parchment-100 hover:bg-parchment-50/10 min-h-[48px]"
          >
            🏷️ Post a Listing
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/contact" className="text-parchment-300 hover:text-parchment-100 text-sm transition-colors">
            Or just say hello →
          </Link>
          <span className="text-parchment-400 hidden sm:inline">·</span>
          <Link href="/newsletter" className="text-parchment-300 hover:text-parchment-100 text-sm transition-colors">
            Sign up for the weekly newsletter →
          </Link>
        </div>
      </div>
    </section>
  );

  // ── Assemble page based on persona ────────────────────────────────────────

  // No persona yet → show the full persona selector hero
  if (!persona) {
    return (
      <>
        <JsonLd data={jsonLd} />
        <PersonaSelector />
        {mobileQuickAccess}
        {desktopQuickLinks}
        {todayBlock}
        {eventsSection}
        {flashGivesSection}
        {newsSection}
        {listingsSection}
        {closingCta}
      </>
    );
  }

  // Visitor: events & visitor guide first, then ferry/weather, then news
  if (persona === 'visitor') {
    return (
      <>
        <JsonLd data={jsonLd} />
        <PersonaBar persona={persona} />
        {heroSection}
        {mobileQuickAccess}
        {desktopQuickLinks}
        {todayBlock}
        {visitorCta}
        {eventsSection}
        {newsSection}
        {closingCta}
      </>
    );
  }

  // Local: news, marketplace, and forum elevated; no visitor CTA
  // (persona === 'local' or 'ferry' or 'dashboard' that somehow landed here)
  return (
    <>
      <JsonLd data={jsonLd} />
      <PersonaBar persona={persona} />
      {heroSection}
      {mobileQuickAccess}
      {desktopQuickLinks}
      {todayBlock}
      {eventsSection}
      {flashGivesSection}
      {newsSection}
      {listingsSection}
      {closingCta}
    </>
  );
}
