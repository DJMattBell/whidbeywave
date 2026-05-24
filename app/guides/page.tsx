import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { createServerClient } from '@/lib/supabase';
import { formatShortDate, categoryColors } from '@/lib/data';
import MarkdownBody from '@/components/MarkdownBody';
import NewsCommentSection from '@/components/NewsCommentSection';
import ShareButton from '@/components/ShareButton';

export const revalidate = 300;

function normalize(p: any) {
  return {
    ...p,
    publishedAt: p.published_at ?? p.publishedAt ?? '',
    readMinutes: p.read_minutes ?? p.readMinutes ?? 3,
    author:      p.author      ?? 'WhidbeyWave',
    body:        p.body        ?? '',
    emoji:       p.emoji       ?? '📖',
    slug:        p.slug        ?? String(p.id),
    imageUrl:    p.image_url   ?? p.imageUrl ?? null,
    tags:        p.tags        ?? [],
  };
}

const getCachedGuides = cache(async () => {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'guide')
    .order('published_at', { ascending: false });

  return (data ?? []).map(normalize);
});

export const metadata: Metadata = {
  title: 'Community Guides — WhidbeyWave',
  description: 'Practical guides for living on and visiting Whidbey Island — ferries, trails, farms, seasonal tips, and island know-how.',
  keywords: ['Whidbey Island guide', 'Whidbey Island tips', 'moving to Whidbey Island', 'Whidbey ferry guide', 'island living'],
  openGraph: {
    title: 'Community Guides — WhidbeyWave',
    description: 'Practical guides for living on and visiting Whidbey Island.',
    siteName: 'WhidbeyWave',
  },
};

export default async function GuidesPage() {
  const guides = await getCachedGuides();

  // Group by category for organized display
  const categories = [...new Set(guides.map(g => g.category))];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-800 to-sound-700 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-300 font-medium mb-2 tracking-wide uppercase text-sm">📖 Island Know-How</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50">
            Community Guides
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Practical guides for getting around, settling in, and making the most of island life.
          </p>
          <div className="mt-4">
            <Link href="/news" className="text-parchment-400 hover:text-parchment-200 text-sm font-medium transition-colors">
              Looking for news? →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {guides.length === 0 ? (
          <div className="text-center py-20 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300 mb-12">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-lg text-stone-700 font-semibold mb-2">Guides are on the way</p>
            <p className="text-stone-600 text-sm mb-5">
              We&apos;re putting together practical guides to help you navigate island life. Check back soon!
            </p>
            <Link href="/news" className="text-forest-600 hover:text-forest-800 font-medium text-sm transition-colors">
              Read the latest news →
            </Link>
          </div>
        ) : (
          <>
            {/* Category filter pills */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map(cat => (
                  <a
                    key={cat}
                    href={`#cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoryColors[cat] ?? 'bg-parchment-200 text-stone-700'} hover:opacity-80`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            )}

            {/* Guides grouped by category */}
            {categories.map(cat => {
              const catGuides = guides.filter(g => g.category === cat);
              return (
                <section key={cat} id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`} className="mb-12 scroll-mt-24">
                  <h2
                    className="text-2xl text-stone-900 mb-6 font-semibold flex items-center gap-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[cat] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {cat}
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {catGuides.map((guide: any) => (
                      <article key={guide.id} id={guide.slug} className="bg-parchment-50 rounded-2xl shadow-warm hover:shadow-warm-md transition-shadow duration-300 overflow-hidden group scroll-mt-24">
                        {guide.imageUrl ? (
                          <div className="h-44 overflow-hidden">
                            <img src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div
                            className="bg-gradient-to-br from-forest-50 to-sound-50 h-32 flex items-center justify-center text-6xl rounded-t-2xl"
                            aria-hidden="true"
                          >
                            {guide.emoji}
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-forest-100 text-forest-800">
                              Guide
                            </span>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[guide.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                              {guide.category}
                            </span>
                          </div>
                          <h3 className="text-xl text-stone-900 mb-2 group-hover:text-forest-600 transition-colors leading-snug font-semibold">
                            {guide.title}
                          </h3>
                          <p className="text-[15px] text-stone-600 mb-3">
                            By {guide.author} &nbsp;·&nbsp;{' '}
                            <time dateTime={guide.publishedAt}>{formatShortDate(guide.publishedAt)}</time>
                            &nbsp;·&nbsp; {guide.readMinutes} min read
                          </p>
                          <p className="text-stone-600 text-base mb-4 leading-relaxed">{guide.excerpt}</p>
                          <MarkdownBody body={guide.body} />
                          {guide.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {guide.tags.map((tag: string) => (
                                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-parchment-200 text-stone-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-5 pt-4 border-t border-parchment-200">
                            <ShareButton
                              title={`${guide.title} — WhidbeyWave`}
                              url={`/guides#${guide.slug}`}
                              text={guide.excerpt}
                            />
                          </div>
                          <NewsCommentSection slug={guide.slug} />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* CTA */}
        <div className="mt-8 bg-forest-50 rounded-2xl p-8 text-center border border-forest-100">
          <h3 className="text-2xl text-forest-800 mb-2 font-semibold">Know something your neighbors should know?</h3>
          <p className="text-forest-700 mb-6 leading-relaxed text-base">
            Whether it&apos;s the best crabbing spots or how to survive storm season, we&apos;d love your island wisdom.
          </p>
          <Link href="/contact" className="btn-primary">
            Share a Tip
          </Link>
        </div>

      </div>
    </>
  );
}
