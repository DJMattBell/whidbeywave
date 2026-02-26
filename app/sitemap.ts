import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE = 'https://whidbeywave.com';

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE}/`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/events`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE}/news`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
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
  { url: `${BASE}/submit-event`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${BASE}/submit-listing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return STATIC_PAGES;
  }

  const pages = [...STATIC_PAGES];

  try {
    const db = createClient(supabaseUrl, supabaseKey);

    // Pull approved upcoming events so the events page lastModified reflects real activity
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

    // Pull approved forum posts for the forum page lastModified
    const { data: posts } = await db
      .from('forum_posts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (posts && posts.length > 0) {
      const forumPage = pages.find(p => p.url === `${BASE}/forum`);
      if (forumPage) forumPage.lastModified = new Date(posts[0].created_at);
    }

    // Individual forum threads
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
  } catch {
    // Sitemap still works without live data
  }

  return pages;
}
