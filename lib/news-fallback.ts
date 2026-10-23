/**
 * News section fallback pool — fills empty news slots with forum threads,
 * marketplace listings, and local picks so the section is never empty.
 */

export type NewsItem = { type: 'news'; data: NewsPost }
  | { type: 'forum'; data: ForumThread }
  | { type: 'listing'; data: MarketplaceListing }
  | { type: 'pick'; data: Recommendation };

export type NewsPost = {
  id: string; title: string; excerpt: string; category: string;
  publishedAt: string; readMinutes: number; slug: string; emoji: string;
};
export type ForumThread = {
  id: string; title: string; body: string | null; reply_count: number;
  created_at: string; author_name: string;
};
export type MarketplaceListing = {
  id: string; title: string; price: number | null; is_free: boolean;
  category: string; location: string; emoji: string; images: string[];
};
export type Recommendation = {
  id: string; name: string; category: string; town: string | null; review_count: number;
};

/**
 * Build an array of up to `count` items, filling news → forum → listing → pick.
 */
export function buildNewsFallbackPool(
  news: NewsPost[],
  forum: ForumThread[],
  listings: MarketplaceListing[],
  picks: Recommendation[],
  count = 3,
): NewsItem[] {
  let items: NewsItem[] = news.map(n => ({ type: 'news', data: n }));

  if (items.length < count) {
    items = [...items, ...forum.slice(0, count - items.length).map(t => ({ type: 'forum' as const, data: t }))];
  }
  if (items.length < count) {
    items = [...items, ...listings.slice(0, count - items.length).map(l => ({ type: 'listing' as const, data: l }))];
  }
  if (items.length < count) {
    items = [...items, ...picks.slice(0, count - items.length).map(r => ({ type: 'pick' as const, data: r }))];
  }

  return items;
}

/**
 * Determine the best "Read more" link based on what's in the pool.
 */
export function getNewsSectionLink(items: NewsItem[]): string {
  if (items.length === 0) return '/news';
  const types = new Set(items.map(i => i.type));
  if (types.has('news')) return '/news';
  if (types.has('forum')) return '/forum';
  if (types.has('listing')) return '/marketplace';
  if (types.has('pick')) return '/recommendations';
  return '/news';
}
