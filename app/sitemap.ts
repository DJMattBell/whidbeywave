import type { MetadataRoute } from 'next';
import { createServerClient, isConfigured } from '@/lib/supabase';

const BASE = 'https://whidbeywave.com';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE}/`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/events`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE}/news`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE}/guides`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE}/ferry`,          lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
  { url: `${BASE}/tides`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
  { url: `${BASE}/visit`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/marketplace`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
  { url: `${BASE}/recommendations`,lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE}/forum`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.6 },
  { url: `${BASE}/barter`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
  { url: `${BASE}/newsletter`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE}/about`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/contact`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/submit-event`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${BASE}/submit-listing`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${BASE}/search`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/how-it-works`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/visit/ferry-guide`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/visit/this-weekend`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
  { url: `${BASE}/visit/restaurants`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
  { url: `${BASE}/visit/farmers-markets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isConfigured) {
    return STATIC_PAGES;
  }

  const pages = [...STATIC_PAGES];

  try {
    const db = createServerClient();

    // Update events page lastModified from latest approved event
    const { data: events } = await db
      .from('event_submissions')
      .select('date, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (events && events.length > 0) {
      const lastEvent = events[0];
      const eventsPage = pages.find(p => p.url === `${BASE}/events`);
      if (eventsPage) {
        eventsPage.lastModified = new Date(lastEvent.updated_at ?? lastEvent.date);
      }
    }

    // Update forum page lastModified + add individual threads
    const { data: posts } = await db
      .from('forum_posts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (posts && posts.length > 0) {
      const forumPage = pages.find(p => p.url === `${BASE}/forum`);
      if (forumPage) forumPage.lastModified = new Date(posts[0].created_at);
    }

    const { data: allPosts } = await db
      .from('forum_posts')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (allPosts) {
      for (const post of allPosts) {
        pages.push({
          url:             `${BASE}/forum/${post.id}`,
          lastModified:    new Date(post.created_at),
          changeFrequency: 'weekly',
          priority:        0.5,
        });
      }
    }

    // Add published news articles
    const { data: newsArticles } = await db
      .from('news_posts')
      .select('slug, published_at, post_type')
      .eq('published', true)
      .eq('post_type', 'news')
      .order('published_at', { ascending: false })
      .limit(50);

    if (newsArticles) {
      const newsPage = pages.find(p => p.url === `${BASE}/news`);
      if (newsPage && newsArticles.length > 0) {
        newsPage.lastModified = new Date(newsArticles[0].published_at + 'T12:00:00Z');
      }
      for (const article of newsArticles) {
        pages.push({
          url:             `${BASE}/news#${article.slug}`,
          lastModified:    new Date(article.published_at + 'T12:00:00Z'),
          changeFrequency: 'monthly',
          priority:        0.7,
        });
      }
    }

    // Add published guides
    const { data: guides } = await db
      .from('news_posts')
      .select('slug, published_at, post_type')
      .eq('published', true)
      .eq('post_type', 'guide')
      .order('published_at', { ascending: false })
      .limit(50);

    if (guides) {
      const guidesPage = pages.find(p => p.url === `${BASE}/guides`);
      if (guidesPage && guides.length > 0) {
        guidesPage.lastModified = new Date(guides[0].published_at + 'T12:00:00Z');
      }
      for (const guide of guides) {
        pages.push({
          url:             `${BASE}/guides#${guide.slug}`,
          lastModified:    new Date(guide.published_at + 'T12:00:00Z'),
          changeFrequency: 'monthly',
          priority:        0.7,
        });
      }
    }

    // Add marketplace listings
    const { data: listings } = await db
      .from('listings')
      .select('id, created_at')
      .eq('status', 'approved')
      .eq('sold', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (listings) {
      const marketPage = pages.find(p => p.url === `${BASE}/marketplace`);
      if (marketPage && listings.length > 0) {
        marketPage.lastModified = new Date(listings[0].created_at);
      }
      for (const listing of listings) {
        pages.push({
          url:             `${BASE}/marketplace/${listing.id}`,
          lastModified:    new Date(listing.created_at),
          changeFrequency: 'weekly',
          priority:        0.5,
        });
      }
    }
  } catch {
    // Sitemap still works without live data
  }

  return pages;
}
