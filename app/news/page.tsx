import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { cache } from 'react';
import { createServerClient } from '@/lib/supabase';
import type { NewsPostRow } from '@/lib/db-types';
import { formatDate, formatShortDate, categoryColors } from '@/lib/data';
import NewsCommentSection from '@/components/NewsCommentSection';
import ShareButton from '@/components/ShareButton';
import MarkdownBody from '@/components/MarkdownBody';
import { JsonLd } from '@/components/JsonLd';

export const revalidate = 300;

// ── Data fetching ─────────────────────────────────────────────

function normalize(p: Record<string, unknown>) {
  return {
    ...p,
    id:          p.id as string,
    title:       p.title as string,
    category:    (p.category ?? '') as string,
    excerpt:     (p.excerpt ?? '') as string | null,
    publishedAt: (p.published_at ?? p.publishedAt ?? '') as string,
    readMinutes: (p.read_minutes ?? p.readMinutes ?? 3) as number,
    author:      (p.author ?? 'WhidbeyWave') as string,
    body:        (p.body ?? '') as string,
    emoji:       (p.emoji ?? '📰') as string,
    slug:        (p.slug ?? String(p.id)) as string,
    postType:    (p.post_type ?? p.postType ?? 'news') as string,
    imageUrl:    (p.image_url ?? p.imageUrl ?? null) as string | null,
    tags:        (p.tags ?? []) as string[],
  };
}

const getCachedPosts = cache(async () => {
  const supabase = createServerClient();
  const { data: postsData } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'news')
    .order('published_at', { ascending: false });

  const raw = postsData ?? [];
  return raw.map(normalize);
});

// ── Metadata ──────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const posts  = await getCachedPosts();
  const latest = posts[0];

  const title       = 'Whidbey Island News — WhidbeyWave';
  const description = latest
    ? `${latest.title} — ${latest.excerpt?.slice(0, 120) ?? ''}…`
    : 'Local news and community stories from Whidbey Island, WA — covering Oak Harbor, Langley, Coupeville, Freeland, and all island towns.';
  const ogDesc = latest?.excerpt ?? 'Local stories from Whidbey Island.';
  const ogImage = latest?.imageUrl
    ?? `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Island News')}`;

  return {
    title,
    description,
    keywords: ['Whidbey Island news', 'Oak Harbor news', 'Langley news', 'Coupeville WA news', 'Whidbey community'],
    openGraph: {
      title,
      description: ogDesc,
      siteName: 'WhidbeyWave',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description: ogDesc,
      images:      [ogImage],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────

export default async function NewsPage() {
  const posts              = await getCachedPosts();
  const [featured, ...rest] = posts;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Whidbey Island News',
    description: 'Local news and community stories from Whidbey Island, WA.',
    url: 'https://whidbeywave.com/news',
    publisher: {
      '@type': 'Organization',
      name: 'WhidbeyWave',
      url: 'https://whidbeywave.com',
    },
    mainEntity: posts.slice(0, 5).map((post) => ({
      '@type': 'NewsArticle',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      author: { '@type': 'Person', name: post.author },
      publisher: { '@type': 'Organization', name: 'WhidbeyWave' },
      url: `https://whidbeywave.com/news#${post.slug}`,
      ...(post.imageUrl ? { image: post.imageUrl } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Header */}
      <div className="bg-gradient-to-br from-sound-800 to-forest-700 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sound-300 font-medium mb-2 tracking-wide uppercase text-sm">📰 From the Island</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50">
            Island News
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Local stories, community updates, and a little of what&apos;s worth knowing around Whidbey.
          </p>
          <div className="mt-4">
            <Link href="/guides" className="text-parchment-400 hover:text-parchment-200 text-sm font-medium transition-colors">
              Looking for community guides? →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {!featured ? (
          <div className="empty-state mb-12">
            <div className="empty-state-icon text-5xl">📰</div>
            <p className="empty-state-title">Nothing published yet</p>
            <p className="empty-state-text">Check back soon — there&apos;s always something happening on the island.</p>
            <Link href="/contact" className="text-forest-600 hover:text-forest-800 font-medium text-sm transition-colors">
              Got a story? Share it →
            </Link>
          </div>
        ) : (
          <>
            {/* Featured post */}
            <article id={featured.slug} className="card mb-12 group scroll-mt-24">
              {featured.imageUrl ? (
                <div className="relative w-full h-48 md:h-72 overflow-hidden">
                  <Image
                    src={featured.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              ) : (
                <div className="md:hidden bg-gradient-to-br from-parchment-200 to-sound-100 flex items-center justify-center text-8xl py-10" aria-hidden="true">
                  {featured.emoji}
                </div>
              )}
              <div className="md:flex">
                {!featured.imageUrl && (
                  <div
                    className="hidden md:flex md:w-72 bg-gradient-to-br from-parchment-200 to-sound-100 items-center justify-center text-8xl shrink-0 rounded-l-xl"
                    aria-hidden="true"
                  >
                    {featured.emoji}
                  </div>
                )}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-forest-600 text-parchment-50">
                      Worth Knowing
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[featured.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {featured.category}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl text-stone-900 mb-3 group-hover:text-forest-600 transition-colors leading-tight font-semibold">
                    {featured.title}
                  </h2>
                  <p className="text-[15px] text-stone-600 mb-4">
                    By {featured.author} &nbsp;·&nbsp;{' '}
                    <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                    &nbsp;·&nbsp; {featured.readMinutes} min read
                  </p>
                  <p className="text-stone-600 leading-relaxed text-base mb-6">{featured.excerpt}</p>
                  <MarkdownBody body={featured.body} />
                  {featured.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {featured.tags.map((tag: string) => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-parchment-200 text-stone-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 pt-4 border-t border-parchment-200">
                    <ShareButton
                      title={`${featured.title} — WhidbeyWave`}
                      url={`/news#${featured.slug}`}
                      text={featured.excerpt ?? undefined}
                    />
                  </div>
                  <NewsCommentSection slug={featured.slug} />
                </div>
              </div>
            </article>

            {/* Rest of posts */}
            {rest.length > 0 && (
              <>
                <h2 className="text-2xl text-stone-900 mb-6 font-semibold">More from the Island</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {rest.map((post) => (
                    <article key={post.id} id={post.slug} className="card group scroll-mt-24">
                      {post.imageUrl ? (
                        <div className="relative h-40 overflow-hidden">
                          <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                        </div>
                      ) : (
                        <div
                          className="bg-gradient-to-br from-parchment-100 to-sound-50 h-32 flex items-center justify-center text-6xl rounded-t-xl"
                          aria-hidden="true"
                        >
                          {post.emoji}
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[post.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-xl text-stone-900 mb-2 group-hover:text-forest-600 transition-colors leading-snug font-semibold">
                          {post.title}
                        </h3>
                        <p className="text-[15px] text-stone-600 mb-3">
                          By {post.author} &nbsp;·&nbsp;{' '}
                          <time dateTime={post.publishedAt}>{formatShortDate(post.publishedAt)}</time>
                          &nbsp;·&nbsp; {post.readMinutes} min read
                        </p>
                        <p className="text-stone-600 text-base mb-4 leading-relaxed">{post.excerpt}</p>
                        <MarkdownBody body={post.body} />
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {post.tags.map((tag: string) => (
                              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-parchment-200 text-stone-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-5 pt-4 border-t border-parchment-200">
                          <ShareButton
                            title={`${post.title} — WhidbeyWave`}
                            url={`/news#${post.slug}`}
                            text={post.excerpt ?? undefined}
                          />
                        </div>
                        <NewsCommentSection slug={post.slug} />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Submit story CTA */}
        <div className="mt-16 bg-sound-50 rounded-xl p-8 text-center border border-sound-100">
          <h3 className="text-2xl text-sound-800 mb-2 font-semibold">Got a story worth sharing?</h3>
          <p className="text-sound-600 mb-6 leading-relaxed text-base">
            If something&apos;s happening on the island that your neighbors should know about, we&apos;d love to hear it.
          </p>
          <Link href="/contact" className="btn-primary bg-sound-600 hover:bg-sound-700">
            Share Something
          </Link>
        </div>

      </div>
    </>
  );
}
