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

export const revalidate = 300;

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

const getPost = cache(async (slug: string) => {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .eq('post_type', 'news')
    .single();

  return data ? normalize(data) : null;
});

const getRelatedPosts = cache(async (category: string, excludeSlug: string) => {
  const supabase = createServerClient();

  // Try same category first
  const { data: sameCat } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'news')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  if (sameCat && sameCat.length >= 3) {
    return sameCat.map(normalize);
  }

  // Fallback: latest posts excluding current
  const { data: latest } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'news')
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  return (latest ?? []).map(normalize);
});

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('news_posts')
    .select('slug')
    .eq('published', true)
    .eq('post_type', 'news');

  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article Not Found — WhidbeyWave' };

  const ogImage = post.imageUrl
    ?? `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent('Island News')}`;

  return {
    title: `${post.title} — WhidbeyWave`,
    description: post.excerpt ?? `${post.title} — local news from Whidbey Island.`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? post.title,
      siteName: 'WhidbeyWave',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? post.title,
      images: [ogImage],
    },
  };
}

export default async function NewsArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.category, post.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'WhidbeyWave', url: 'https://whidbeywave.com' },
    url: `https://whidbeywave.com/news/${post.slug}`,
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero image */}
      {post.imageUrl && (
        <div className="-mx-4 sm:mx-0 md:max-w-4xl md:mx-auto md:mt-8">
          <div className="relative w-full h-56 sm:h-72 md:h-96 md:rounded-xl overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
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
          <Link href="/news" className="hover:text-forest-600 transition-colors">News</Link>
          <span className="mx-2">›</span>
          <span className="text-stone-700">{post.title}</span>
        </nav>

        {/* Category badge */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[post.category] ?? 'bg-parchment-200 text-stone-700'}`}>
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Byline */}
        <p className="text-sm text-stone-500 mb-8">
          By {post.author} · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readMinutes} min read
        </p>

        {/* Body */}
        <MarkdownBody body={post.body} standalone />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-8">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-parchment-200 text-stone-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 pt-6 border-t border-parchment-200">
          <ShareButton
            title={`${post.title} — WhidbeyWave`}
            url={`/news/${post.slug}`}
            text={post.excerpt ?? undefined}
          />
        </div>

        {/* Comments */}
        <NewsCommentSection slug={post.slug} />
      </article>

      {/* Related content */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">More from the Island</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/news/${r.slug}`} className="card group">
                {r.imageUrl ? (
                  <div className="relative h-40 overflow-hidden">
                    <Image src={r.imageUrl} alt={r.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-parchment-100 to-sound-50 h-32 flex items-center justify-center text-5xl rounded-t-xl" aria-hidden="true">
                    {r.emoji}
                  </div>
                )}
                <div className="p-5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-2 ${categoryColors[r.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                    {r.category}
                  </span>
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
