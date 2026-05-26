import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { createServerClient } from '@/lib/supabase';
import { formatDate, categoryColors } from '@/lib/data';
import MarkdownBody from '@/components/MarkdownBody';
import NewsCommentSection from '@/components/NewsCommentSection';
import ShareButton from '@/components/ShareButton';
import { JsonLd } from '@/components/JsonLd';
import { normalizePostFull } from '@/lib/normalize-post';

export const revalidate = 300;

const getGuide = cache(async (slug: string) => {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .eq('post_type', 'guide')
    .single();

  return data ? normalizePostFull(data, '📖') : null;
});

const getRelatedGuides = cache(async (category: string, excludeSlug: string) => {
  const supabase = createServerClient();

  const { data: sameCat } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'guide')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  if (sameCat && sameCat.length >= 3) {
    return sameCat.map(p => normalizePostFull(p, '📖'));
  }

  const { data: latest } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'guide')
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  return (latest ?? []).map(p => normalizePostFull(p, '📖'));
});

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('news_posts')
    .select('slug')
    .eq('published', true)
    .eq('post_type', 'guide');

  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: 'Guide Not Found — WhidbeyWave' };

  const ogImage = guide.imageUrl
    ?? `/api/og?title=${encodeURIComponent(guide.title)}&subtitle=${encodeURIComponent('Island Guide')}`;

  return {
    title: `${guide.title} — WhidbeyWave`,
    description: guide.excerpt ?? `${guide.title} — a community guide for Whidbey Island.`,
    openGraph: {
      title: guide.title,
      description: guide.excerpt ?? guide.title,
      siteName: 'WhidbeyWave',
      type: 'article',
      publishedTime: guide.publishedAt,
      authors: [guide.author],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.excerpt ?? guide.title,
      images: [ogImage],
    },
  };
}

export default async function GuideDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const related = await getRelatedGuides(guide.category, guide.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.publishedAt,
    author: { '@type': 'Person', name: guide.author },
    publisher: { '@type': 'Organization', name: 'WhidbeyWave', url: 'https://whidbeywave.com' },
    url: `https://whidbeywave.com/guides/${guide.slug}`,
    ...(guide.imageUrl ? { image: guide.imageUrl } : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero image */}
      {guide.imageUrl && (
        <div className="-mx-4 sm:mx-0 md:max-w-4xl md:mx-auto md:mt-8">
          <div className="relative w-full h-56 sm:h-72 md:h-96 md:rounded-xl overflow-hidden">
            <Image
              src={guide.imageUrl}
              alt={guide.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-stone-500" aria-label="Breadcrumb">
          <Link href="/guides" className="hover:text-forest-600 transition-colors">Guides</Link>
          <span className="mx-2">›</span>
          <span className="text-stone-700">{guide.title}</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-forest-100 text-forest-800">
            Guide
          </span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[guide.category] ?? 'bg-parchment-200 text-stone-700'}`}>
            {guide.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 leading-tight">
          {guide.title}
        </h1>

        {/* Byline */}
        <p className="text-sm text-stone-500 mb-8">
          By {guide.author} · <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time> · {guide.readMinutes} min read
        </p>

        {/* Body */}
        <MarkdownBody body={guide.body} standalone />

        {/* Tags */}
        {guide.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-8">
            {guide.tags.map((tag: string) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-parchment-200 text-stone-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 pt-6 border-t border-parchment-200">
          <ShareButton
            title={`${guide.title} — WhidbeyWave`}
            url={`/guides/${guide.slug}`}
            text={guide.excerpt ?? undefined}
          />
        </div>

        {/* Comments */}
        <NewsCommentSection slug={guide.slug} />
      </article>

      {/* Related guides */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">More Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/guides/${r.slug}`} className="card group">
                {r.imageUrl ? (
                  <div className="relative h-40 overflow-hidden">
                    <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-forest-50 to-sound-50 h-32 flex items-center justify-center text-5xl rounded-t-xl" aria-hidden="true">
                    {r.emoji}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex gap-1.5 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-forest-100 text-forest-800">
                      Guide
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[r.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {r.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 group-hover:text-forest-600 transition-colors leading-snug mb-1">
                    {r.title}
                  </h3>
                  <p className="text-sm text-stone-500">{r.readMinutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
