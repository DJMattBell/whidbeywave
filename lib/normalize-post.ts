/** Shared normalizer for news_posts rows (news + guides). */

export function normalizePost(p: Record<string, unknown>, defaultEmoji = '📰') {
  return {
    ...p,
    id:          p.id as string,
    title:       p.title as string,
    category:    (p.category ?? '') as string,
    excerpt:     (p.excerpt ?? '') as string | null,
    publishedAt: (p.published_at ?? p.publishedAt ?? '') as string,
    readMinutes: (p.read_minutes ?? p.readMinutes ?? 3) as number,
    author:      (p.author ?? 'WhidbeyWave') as string,
    emoji:       (p.emoji ?? defaultEmoji) as string,
    slug:        (p.slug ?? String(p.id)) as string,
    imageUrl:    (p.image_url ?? p.imageUrl ?? null) as string | null,
  };
}

export function normalizePostFull(p: Record<string, unknown>, defaultEmoji = '📰') {
  return {
    ...normalizePost(p, defaultEmoji),
    body:     (p.body ?? '') as string,
    postType: (p.post_type ?? p.postType ?? 'news') as string,
    tags:     (p.tags ?? []) as string[],
  };
}
