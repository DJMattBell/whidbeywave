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
import LeadStoryCard from '@/components/home/LeadStoryCard';
import CommunityVoiceCard from '@/components/home/CommunityVoiceCard';
import { getLeadStory } from '@/lib/lead-story';
import { Suspense } from 'react';
import { JsonLd } from '@/components/JsonLd';
import {
  Calendar, Newspaper, ShoppingBag,
  MessageCircle, Tag, Star, MapPinned, MapPin,
} from 'lucide-react';

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const supabase = createServerClient();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

  // Lead story — fetched early so downstream sections can exclude it
  const leadStory = await getLeadStory();

  // "Coming Up on the Island" — excludes lead event (occurrence-only, not series),
  // expands window 7 → 14 → 30 days if fewer than 3 events qualify.
  let upcomingEvents: {
    id: string; title: string; date: string; time: string;
    town: string; category: string; description: string | null; tags: string[];
  }[] = [];

  for (const days of [7, 14, 30]) {
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() + days);
    const windowEndStr = windowEnd.toLocaleDateString('en-CA');

    let query = supabase
      .from('event_submissions')
      .select('id, title, date, time, town, category, description, tags')
      .eq('status', 'approved')
      .gte('date', today)
      .lte('date', windowEndStr)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(leadStory?.leadEventId ? 4 : 3);

    if (leadStory?.leadEventId) {
      query = query.neq('id', leadStory.leadEventId);
    }

    const { data } = await query;
    const results = (data ?? []).slice(0, 3);
    if (results.length >= 3) {
      upcomingEvents = results;
      break;
    }
    // Keep best result so far in case we never reach 3
    if (results.length > upcomingEvents.length) {
      upcomingEvents = results;
    }
  }

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

  // Combined marketplace listings (free + for-sale, mixed naturally)
  const now = new Date().toISOString();
  const { data: marketplaceData } = await supabase
    .from('listings')
    .select('id, title, price, is_free, category, location, emoji, images')
    .eq('status', 'approved')
    .eq('sold', false)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(4);
  const marketplaceListings = (marketplaceData ?? []) as {
    id: string; title: string; price: number | null; is_free: boolean;
    category: string; location: string; emoji: string; images: string[];
  }[];

  // Forum threads for news section fallback (Issue 1)
  const { data: forumThreadsData } = await supabase
    .from('forum_posts')
    .select('id, title, body, reply_count, created_at, author_name')
    .eq('is_pinned', false)
    .order('created_at', { ascending: false })
    .limit(3);
  const forumThreads = (forumThreadsData ?? []) as {
    id: string; title: string; body: string | null; reply_count: number;
    created_at: string; author_name: string;
  }[];

  // Recommendations for news section fallback (Issue 1)
  const { data: recommendationsData } = await supabase
    .from('recommendations')
    .select('id, name, category, town, review_count')
    .order('review_count', { ascending: false })
    .limit(3);
  const recommendations = (recommendationsData ?? []) as {
    id: string; name: string; category: string; town: string | null; review_count: number;
  }[];

  // ── News section fallback pool ──────────────────────────────────────────
  // When news has fewer than 3 stories, fill with forum → listings → picks
  type FallbackItem =
    | { type: 'news'; data: typeof latestNews[number] }
    | { type: 'forum'; data: typeof forumThreads[number] }
    | { type: 'listing'; data: typeof marketplaceListings[number] }
    | { type: 'pick'; data: typeof recommendations[number] };

  let newsSectionItems: FallbackItem[] = latestNews.map(n => ({ type: 'news' as const, data: n }));

  if (newsSectionItems.length < 3) {
    const remaining = 3 - newsSectionItems.length;
    newsSectionItems = [...newsSectionItems, ...forumThreads.slice(0, remaining).map(t => ({ type: 'forum' as const, data: t }))];
  }
  if (newsSectionItems.length < 3) {
    const remaining = 3 - newsSectionItems.length;
    newsSectionItems = [...newsSectionItems, ...marketplaceListings.slice(0, remaining).map(l => ({ type: 'listing' as const, data: l }))];
  }
  if (newsSectionItems.length < 3) {
    const remaining = 3 - newsSectionItems.length;
    newsSectionItems = [...newsSectionItems, ...recommendations.slice(0, remaining).map(r => ({ type: 'pick' as const, data: r }))];
  }

  // Determine heading based on content mix
  const newsTypes = new Set(newsSectionItems.map(i => i.type));
  let newsHeading = 'From Around the Island';
  let newsSubtitle = 'What your neighbors are talking about';
  let newsLink = '/news';

  if (newsSectionItems.length > 0 && !newsTypes.has('news')) {
    if (newsTypes.size === 1 && newsTypes.has('forum')) {
      newsHeading = "What the Island's Talking About";
      newsSubtitle = 'Active conversations from Ask the Island';
      newsLink = '/forum';
    } else if (newsTypes.size === 1 && newsTypes.has('listing')) {
      newsHeading = 'On the Island Marketplace';
      newsSubtitle = 'Recently listed by neighbors';
      newsLink = '/marketplace';
    } else if (newsTypes.size === 1 && newsTypes.has('pick')) {
      newsHeading = 'What People Are Recommending';
      newsSubtitle = "From your neighbors' Local Picks";
      newsLink = '/recommendations';
    }
  }

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

  // Utility shelf — compact strip at altitude 4
  const todayBlock = (
    <section key="today" id="today-panel" className="bg-sound-50 border-y border-sound-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <Suspense fallback={
          <div className="animate-pulse h-5 bg-sound-100 rounded w-60" />
        }>
          <TodayWidget />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <FerryAlerts />
      </Suspense>
    </section>
  );

  // Tier 2 — section navigation (4 cards, no live data)
  const actionCards = (
    <section key="actions" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {([
          { Icon: Calendar,      label: "What's On",      subtitle: 'Events and what\u2019s on the calendar',    href: '/events' },
          { Icon: Newspaper,     label: 'Island News',    subtitle: 'Stories from across the island',            href: '/news' },
          { Icon: MessageCircle, label: 'Ask the Island', subtitle: 'Questions, advice, recommendations',        href: '/forum' },
          { Icon: ShoppingBag,   label: 'Buy & Sell',     subtitle: 'Listings from your neighbors',              href: '/marketplace' },
        ] as const).map(({ Icon, label, subtitle, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-sm bg-parchment-100 text-stone-700 hover:bg-parchment-200 shadow-warm-sm hover:shadow-warm transition-all duration-200 hover:-translate-y-0.5 border border-parchment-200 text-center min-h-[88px] justify-center"
          >
            <Icon size={24} className="text-forest-600" aria-hidden="true" />
            <span className="font-semibold text-xs md:text-sm">{label}</span>
            <span className="text-[10px] md:text-xs text-stone-500 font-normal leading-snug">{subtitle}</span>
          </Link>
        ))}
      </div>
    </section>
  );

  // Hidden entirely when no events qualify within 30 days — empty beats stale
  const eventsSection = upcomingEvents.length === 0 ? null : (
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
      {(
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
                <p className="text-sm text-stone-600 mb-4"><MapPin size={14} className="inline -mt-0.5 mr-0.5 text-stone-400" aria-hidden="true" />{event.town}</p>
                <p className="text-base text-stone-600 line-clamp-2 mb-4">{event.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-parchment-200">
                  <AddToCalendar
                    event={{
                      title:       event.title,
                      date:        event.date,
                      time:        event.time,
                      location:    event.town,
                      description: event.description ?? undefined,
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
          See all events  →
        </Link>
      </div>
    </section>
  );

  const newsSection = newsSectionItems.length === 0 ? null : (
    <section key="news" className="bg-parchment-100 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">{newsHeading}</h2>
            <p className="section-subtitle mb-0">{newsSubtitle}</p>
          </div>
          <Link href={newsLink} className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
            Read more →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsSectionItems.map((item) => {
            if (item.type === 'news') {
              const post = item.data;
              return (
                <Link key={`news-${post.id}`} href={`/news#${post.slug}`} className="card-pressable p-6 group">
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
                      <p className="text-base text-stone-600 line-clamp-2">{post.excerpt}</p>
                    </div>
                  </div>
                </Link>
              );
            }
            if (item.type === 'forum') {
              const thread = item.data;
              return (
                <Link key={`forum-${thread.id}`} href={`/forum/${thread.id}`} className="card-pressable p-6 group">
                  <div className="flex items-start gap-4">
                    <MessageCircle size={32} className="text-forest-600 shrink-0 mt-1" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-forest-600 transition-colors leading-snug">
                        {thread.title}
                      </h3>
                      {thread.body && (
                        <p className="text-sm text-stone-600 mb-2 line-clamp-2">{thread.body}</p>
                      )}
                      <p className="text-xs text-stone-500">
                        {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'} · {formatShortDate(thread.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            }
            if (item.type === 'listing') {
              const listing = item.data;
              return (
                <Link key={`listing-${listing.id}`} href={`/marketplace/${listing.id}`} className="card-pressable p-6 group">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl shrink-0">{listing.emoji}</span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-forest-600 transition-colors leading-snug">
                        {listing.title}
                      </h3>
                      <p className="text-forest-600 font-bold mb-1">{formatPrice(listing.price, listing.is_free)}</p>
                      <p className="text-xs text-stone-500">{listing.location}</p>
                    </div>
                  </div>
                </Link>
              );
            }
            // type === 'pick'
            const pick = item.data;
            return (
              <Link key={`pick-${pick.id}`} href={`/recommendations/${pick.id}`} className="card-pressable p-6 group">
                <div className="flex items-start gap-4">
                  <Star size={32} className="text-amber-500 shrink-0 mt-1" aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-forest-600 transition-colors leading-snug">
                      {pick.name}
                    </h3>
                    <span className={`badge ${categoryColors[pick.category] ?? 'bg-parchment-200 text-stone-700'} mb-2`}>
                      {pick.category}
                    </span>
                    <p className="text-xs text-stone-500">
                      {pick.review_count} {pick.review_count === 1 ? 'review' : 'reviews'}{pick.town ? ` · ${pick.town}` : ''}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );

  // Combined Neighborhood Marketplace — free + for-sale in one classifieds section
  const marketplaceSection = marketplaceListings.length > 0 ? (
    <section key="marketplace" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="section-title">Neighborhood Marketplace</h2>
          <p className="section-subtitle mb-0">From your neighbors</p>
        </div>
        <Link href="/marketplace" className="text-forest-600 hover:text-forest-800 font-medium text-sm hidden sm:block">
          Browse the marketplace →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketplaceListings.map((listing) => (
          <Link key={listing.id} href={`/marketplace/${listing.id}`} className="card-pressable group">
            <div className="relative bg-parchment-100 h-28 flex items-center justify-center overflow-hidden rounded-t-xl">
              {listing.images?.[0]
                ? <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                : <span className="text-4xl">{listing.emoji}</span>
              }
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-stone-800 line-clamp-1 group-hover:text-forest-600 transition-colors mb-1">
                {listing.title}
              </h3>
              <p className={`text-sm font-bold mb-0.5 ${listing.is_free ? 'text-forest-600' : 'text-stone-800'}`}>
                {formatPrice(listing.price, listing.is_free)}
              </p>
              <p className="text-xs text-stone-500 truncate">{listing.location}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-6 sm:hidden">
        <Link href="/marketplace" className="text-forest-600 hover:text-forest-800 font-medium text-sm">
          Browse the marketplace →
        </Link>
      </div>
    </section>
  ) : null;

  const visitorCta = (
    <section key="visitor-cta" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="card p-6 sm:p-8 bg-sound-50 border-sound-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <MapPinned size={32} className="text-sound-600 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-stone-800 mb-1">
              Got friends visiting Whidbey?
            </h2>
            <p className="text-stone-600 text-sm">
              Send them the visitor guide — ferry tips, restaurants, farmers markets, everything they need.
            </p>
          </div>
          <Link href="/visit" className="btn-primary shrink-0">
            Open Visitor Guide →
          </Link>
        </div>
      </div>
    </section>
  );

  const closingCta = (
    <section key="closing" className="bg-gradient-to-br from-forest-700 via-forest-600 to-sound-600 text-parchment-50 py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-parchment-50">
          This is your site as much as ours
        </h2>
        <p className="text-parchment-200 text-lg mb-8 leading-relaxed">
          Got an event or something to sell? Add it here. This place works because neighbors use it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
          <Link
            href="/submit-event"
            className="btn-primary bg-parchment-50 text-forest-800 hover:bg-parchment-100 min-h-[48px] inline-flex items-center gap-2"
          >
            <Calendar size={18} aria-hidden="true" /> Submit an Event
          </Link>
          <Link
            href="/submit-listing"
            className="btn-primary bg-transparent border border-parchment-300 text-parchment-100 hover:bg-parchment-50/10 min-h-[48px] inline-flex items-center gap-2"
          >
            <Tag size={18} aria-hidden="true" /> Post a Listing
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/contact" className="text-parchment-200 hover:text-parchment-100 text-sm transition-colors">
            Or just say hello →
          </Link>
          <span className="text-parchment-400 hidden sm:inline">·</span>
          <Link href="/newsletter" className="text-parchment-200 hover:text-parchment-100 text-sm transition-colors">
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
      <Suspense fallback={null}>
        <LeadStoryCard />
      </Suspense>
      {actionCards}
      {eventsSection}
      <Suspense fallback={null}>
        <CommunityVoiceCard excludeThreadId={leadStory?.leadForumThreadId} />
      </Suspense>
      {todayBlock}
      {newsSection}
      {marketplaceSection}
      {closingCta}
      {visitorCta}
    </>
  );
}
