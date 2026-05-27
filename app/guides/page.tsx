import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { cache, Suspense } from 'react';
import { createServerClient } from '@/lib/supabase';
import { formatShortDate, categoryColors } from '@/lib/data';
import GuidesFilter from '@/components/GuidesFilter';
import { JsonLd } from '@/components/JsonLd';
import { BookOpen } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { normalizePost } from '@/lib/normalize-post';

export const revalidate = 300;

const getCachedGuides = cache(async () => {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('post_type', 'guide')
    .order('published_at', { ascending: false });

  return (data ?? []).map(p => normalizePost(p, '📖'));
});

export const metadata: Metadata = {
  title: 'Community Guides — WhidbeyWave',
  description: 'Practical guides for living on and visiting Whidbey Island — ferries, trails, farms, seasonal tips, and island know-how.',
  keywords: ['Whidbey Island guide', 'Whidbey Island tips', 'moving to Whidbey Island', 'Whidbey ferry guide', 'island living'],
  openGraph: {
    title: 'Community Guides — WhidbeyWave',
    description: 'Practical guides for living on and visiting Whidbey Island.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Guides — WhidbeyWave',
    description: 'Practical guides for living on and visiting Whidbey Island.',
    images: ['/og-default.png'],
  },
};

function GuidesGrid({ guides, cat }: { guides: ReturnType<typeof normalizePost>[]; cat: string }) {
  const filtered = cat && cat !== 'All' ? guides.filter(g => g.category === cat) : guides;

  if (filtered.length === 0) {
    return (
      <div className="mb-12">
        <EmptyState
          icon={BookOpen}
          headline="No guides in this category yet"
          subtext="Check back soon or browse all guides."
        />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((guide) => (
        <Link key={guide.id} href={`/guides/${guide.slug}`} className="card group">
          {guide.imageUrl ? (
            <div className="relative h-44 overflow-hidden">
              <Image src={guide.imageUrl} alt={guide.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
            </div>
          ) : (
            <div
              className="bg-gradient-to-br from-forest-50 to-sound-50 h-32 flex items-center justify-center text-6xl rounded-t-xl"
              aria-hidden="true"
            >
              {guide.emoji}
            </div>
          )}
          <div className="p-5">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-forest-100 text-forest-800">
                Guide
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[guide.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                {guide.category}
              </span>
            </div>
            <h3 className="text-lg text-stone-900 mb-2 group-hover:text-forest-600 transition-colors leading-snug font-semibold">
              {guide.title}
            </h3>
            <p className="text-sm text-stone-500 mb-2">
              By {guide.author} · <time dateTime={guide.publishedAt}>{formatShortDate(guide.publishedAt)}</time> · {guide.readMinutes} min read
            </p>
            <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">{guide.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const guides = await getCachedGuides();
  const { cat = 'All' } = await searchParams;
  const categories = [...new Set(guides.map(g => g.category))].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Whidbey Island Community Guides',
    description: 'Practical guides for living on and visiting Whidbey Island.',
    url: 'https://whidbeywave.com/guides',
    publisher: {
      '@type': 'Organization',
      name: 'WhidbeyWave',
      url: 'https://whidbeywave.com',
    },
    mainEntity: guides.slice(0, 5).map((guide) => ({
      '@type': 'Article',
      headline: guide.title,
      description: guide.excerpt,
      datePublished: guide.publishedAt,
      author: { '@type': 'Person', name: guide.author },
      publisher: { '@type': 'Organization', name: 'WhidbeyWave' },
      url: `https://whidbeywave.com/guides/${guide.slug}`,
      ...(guide.imageUrl ? { image: guide.imageUrl } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Header */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-600 font-medium mb-2 tracking-wide uppercase text-sm">Island Know-How</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Community Guides
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            Practical guides for getting around, settling in, and making the most of island life.
          </p>
          <div className="mt-4">
            <Link href="/news" className="text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors">
              Looking for news? →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        {guides.length === 0 ? (
          <div className="mb-12">
            <EmptyState
              icon={BookOpen}
              headline="Guides are on the way"
              subtext="We're putting together practical guides to help you navigate island life."
              action={{ label: "Read the latest news", href: "/news" }}
            />
          </div>
        ) : (
          <>
            {/* Category filter chips */}
            {categories.length > 1 && (
              <Suspense>
                <GuidesFilter categories={categories} />
              </Suspense>
            )}

            <GuidesGrid guides={guides} cat={cat} />
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-forest-50 rounded-xl p-8 text-center border border-forest-100">
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
