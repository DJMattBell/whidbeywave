import Link from 'next/link';
import Image from 'next/image';
import { formatShortDate, categoryColors } from '@/lib/data';
import { CATEGORY_EMOJI } from '@/lib/constants';
import { formatPrice } from '@/lib/marketplace';
import { createServerClient } from '@/lib/supabase';
import TodayWidget from '@/components/TodayWidget';
import AddToCalendar from '@/components/AddToCalendar';
import FerryAlerts from '@/components/FerryAlerts';
import HeroSection from '@/components/home/HeroSection';
import { Suspense } from 'react';
import { JsonLd } from '@/components/JsonLd';
import {
  Calendar, Gift, Newspaper, ShoppingBag, BookOpen,
  MessageCircle, Ship, Waves,
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export const revalidate = 300; // 5 minutes

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

  // ── Section builders ──────────────────────────────────────────────────────

  // Tier 1 — live/dynamic data (sound-50 accent)
  const todayBlock = (
    <section key="today" id="today-panel" className="bg-sound-50 border-b border-sound-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Suspense fallback={
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-sound-100 rounded w-40" />
            <div className="h-20 bg-sound-100 rounded-xl" />
          </div>
        }>
          <TodayWidget />
        </Suspense>
        <Suspense fallback={null}>
          <FerryAlerts />
        </Suspense>
      </div>
    </section>
  );

  // Tier 2 — browse/navigate action cards (parchment-100)
  const actionCards = (
    <section key="actions" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex overflow-x-auto gap-3 scrollbar-none">
        {([
          { Icon: Calendar,      label: "What's On",   href: '/events' },
          { Icon: Newspaper,     label: 'News',         href: '/news' },
          { Icon: BookOpen,      label: 'Guides',       href: '/guides' },
          { Icon: ShoppingBag,   label: 'Buy & Sell',  href: '/marketplace' },
          { Icon: Ship,          label: 'Ferry',        href: '/ferry' },
          { Icon: Waves,         label: 'Tides',        href: '/tides' },
        ] as const).map(({ Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1.5 shrink-0 px-4 py-3 rounded-xl bg-parchment-100 border border-parchment-200 hover:bg-parchment-200 transition-colors min-w-[80px] text-center"
          >
            <Icon size={24} className="text-forest-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-stone-700 whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {([
          { Icon: Calendar,      label: "What's Going On", href: '/events' },
          { Icon: Newspaper,     label: 'Island News',      href: '/news' },
          { Icon: BookOpen,      label: 'Guides',           href: '/guides' },
          { Icon: ShoppingBag,   label: 'Buy & Sell',      href: '/marketplace' },
          { Icon: MessageCircle, label: 'Ask the Island',  href: '/forum' },
        ] as const).map(({ Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 py-5 rounded-xl font-semibold text-sm bg-parchment-100 text-stone-700 hover:bg-parchment-200 shadow-warm-sm hover:shadow-warm transition-all duration-200 hover:-translate-y-0.5 border border-parchment-200"
          >
            <Icon size={28} className="text-forest-600" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
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
        <EmptyState
          icon={Calendar}
          headline="The calendar's looking quiet"
          subtext="Check back soon or submit your own community event."
          action={{ label: 'Submit an event', href: '/submit-event' }}
        />
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
                <p className="text-sm text-stone-600 mb-1">
                  <Calendar size={14} className="inline -mt-0.5 mr-1" aria-hidden="true" />
                  <time dateTime={event.date}>{formatShortDate(event.date)}</time> · {event.time}
                </p>
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
          <EmptyState
            icon={Newspaper}
            headline="The newsroom is between stories"
            subtext="Stories from the island will appear here."
          />
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
            <h2 className="text-xl font-semibold text-stone-800 mb-1">
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

  // ── One unified layout ──────────────────────────────────────────────────
  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection />
      {todayBlock}
      {actionCards}
      {eventsSection}
      {flashGivesSection}
      {newsSection}
      {listingsSection}
      {visitorCta}
      {closingCta}
    </>
  );
}
