import type { Metadata } from 'next';
import Link from 'next/link';
import { newsPosts, formatDate, formatShortDate, categoryColors } from '@/lib/data';
import NewsCommentSection from '@/components/NewsCommentSection';
import ShareButton from '@/components/ShareButton';

const latest = newsPosts[0];

export const metadata: Metadata = {
  title: 'Whidbey Island News — WhidbeyWave',
  description: latest
    ? `${latest.title} — ${latest.excerpt.slice(0, 120)}…`
    : 'Stay up to date with the latest from Whidbey Island — local stories on community, nature, arts, transportation, and island life.',
  keywords: ['Whidbey Island news', 'Oak Harbor news', 'Langley news', 'Coupeville WA news', 'Whidbey community'],
  openGraph: {
    title: 'Whidbey Island News — WhidbeyWave',
    description: latest ? latest.excerpt : 'Local stories from Whidbey Island.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whidbey Island News — WhidbeyWave',
    description: latest ? latest.excerpt : 'Local stories from Whidbey Island.',
    images: ['/og-default.png'],
  },
};

function ArticleBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-4 border-t border-parchment-200 pt-5">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-stone-700 leading-relaxed text-base">{p.replace(/\n/g, ' ')}</p>
      ))}
    </div>
  );
}

export default function NewsPage() {
  const [featured, ...rest] = newsPosts;

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-sound-800 to-forest-700 text-parchment-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sound-300 font-medium mb-2 tracking-wide uppercase text-sm">📰 From the Island</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-parchment-50">
            Island News
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Local stories, community updates, and a little of what&apos;s worth knowing around Whidbey.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Featured post */}
        <article id={featured.slug} className="bg-parchment-50 rounded-2xl shadow-warm hover:shadow-warm-md transition-shadow duration-300 overflow-hidden mb-12 md:flex group scroll-mt-24">
          <div
            className="md:w-72 bg-gradient-to-br from-parchment-200 to-sound-100 flex items-center justify-center text-8xl shrink-0 py-10 md:py-0 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
            aria-hidden="true"
          >
            {featured.emoji}
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-forest-500 text-parchment-50">
                Worth Knowing
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[featured.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                {featured.category}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl text-stone-900 mb-3 group-hover:text-forest-600 transition-colors leading-tight font-semibold">
              {featured.title}
            </h2>
            <p className="text-sm text-stone-400 mb-4">
              By {featured.author} &nbsp;·&nbsp;{' '}
              <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
              &nbsp;·&nbsp; {featured.readMinutes} min read
            </p>
            <p className="text-stone-600 leading-relaxed text-base mb-6">{featured.excerpt}</p>
            <ArticleBody body={featured.body} />
            <div className="mt-5 pt-4 border-t border-parchment-200">
              <ShareButton
                title={`${featured.title} — WhidbeyWave`}
                url={`/news#${featured.slug}`}
                text={featured.excerpt}
              />
            </div>
            <NewsCommentSection slug={featured.slug} />
          </div>
        </article>

        {/* Rest of posts */}
        <h2 className="text-2xl text-stone-900 mb-6 font-semibold">More from the Island</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((post) => (
            <article key={post.id} id={post.slug} className="bg-parchment-50 rounded-2xl shadow-warm hover:shadow-warm-md transition-shadow duration-300 overflow-hidden group scroll-mt-24">
              <div
                className="bg-gradient-to-br from-parchment-100 to-sound-50 h-32 flex items-center justify-center text-6xl rounded-t-2xl"
                aria-hidden="true"
              >
                {post.emoji}
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColors[post.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl text-stone-900 mb-2 group-hover:text-forest-600 transition-colors leading-snug font-semibold">
                  {post.title}
                </h2>
                <p className="text-sm text-stone-400 mb-3">
                  By {post.author} &nbsp;·&nbsp;{' '}
                  <time dateTime={post.publishedAt}>{formatShortDate(post.publishedAt)}</time>
                  &nbsp;·&nbsp; {post.readMinutes} min read
                </p>
                <p className="text-stone-600 text-base mb-4 leading-relaxed">{post.excerpt}</p>
                <ArticleBody body={post.body} />
                <div className="mt-5 pt-4 border-t border-parchment-200">
                  <ShareButton
                    title={`${post.title} — WhidbeyWave`}
                    url={`/news#${post.slug}`}
                    text={post.excerpt}
                  />
                </div>
                <NewsCommentSection slug={post.slug} />
              </div>
            </article>
          ))}
        </div>

        {/* Submit story CTA */}
        <div className="mt-16 bg-sound-50 rounded-2xl p-8 text-center border border-sound-100">
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
