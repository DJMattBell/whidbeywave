import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { createServerClient, isConfigured } from '@/lib/supabase';
import type { ForumPost } from '@/lib/db-types';
import NewPostForm from '@/components/forum/NewPostForm';
import LocalBadge from '@/components/LocalBadge';
import { isWhidbeyLocal } from '@/lib/whidbey-zips';
import QuickReactions from '@/components/QuickReactions';
import { SkeletonFeed } from '@/components/SkeletonCard';

export const metadata: Metadata = {
  title: 'Ask the Island — Whidbey Island Community Forum',
  description: 'Ask Whidbey Island locals anything — recommendations, island life questions, events, lost & found, and newcomer tips from your neighbors.',
  openGraph: {
    title: 'Ask the Island — Whidbey Island Community Forum',
    description: 'Ask Whidbey Island locals anything — recommendations, island life questions, events, lost & found, and newcomer tips from your neighbors.',
    siteName: 'WhidbeyWave',
    images: [{ url: `/api/og?title=${encodeURIComponent('Ask the Island')}&subtitle=${encodeURIComponent('Whidbey Island Community Forum')}`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask the Island — Whidbey Island Community Forum',
    description: 'Ask Whidbey Island locals anything — recommendations, island life, and more.',
    images: [`/api/og?title=${encodeURIComponent('Ask the Island')}&subtitle=${encodeURIComponent('Community Forum')}`],
  },
};

export const revalidate = 60;

import { FORUM_CATEGORIES, FORUM_CATEGORY_COLORS } from '@/lib/constants';

const CATEGORIES = FORUM_CATEGORIES;
const CATEGORY_COLORS = FORUM_CATEGORY_COLORS;

function formatPostDate(dateStr: string) {
  const date = new Date(dateStr);
  const now   = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM  = Math.floor(diffMs / 60000);

  if (diffM < 60) return `${diffM || 1} min ago`;

  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ago`;

  // Older than a day — show the actual date
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

async function getPosts(category: string | null): Promise<ForumPost[]> {
  if (!isConfigured) return [];
  const db = createServerClient();
  let q = db
    .from('forum_posts')
    .select('*, forum_categories(name, slug), category_name')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (category && category !== 'All') {
    q = q.eq('category_name', category);
  }

  const { data } = await q;
  return (data ?? []) as ForumPost[];
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category ?? 'All';
  const posts = await getPosts(activeCategory);

  return (
    <>
      <div className="bg-gradient-to-br from-sound-800 to-forest-800 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sound-300 font-medium mb-2 tracking-wide uppercase text-sm">💬 Community</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50">
            Ask the Island
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Got a question about the island? Ask it here. Neighbors know things no search engine does.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Category filter pills — functional via URL */}
        <nav aria-label="Filter by category">
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => {
              const isActive = cat === activeCategory;
              const href = cat === 'All' ? '/forum' : `/forum?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-forest-600 text-parchment-50 border-forest-600'
                      : 'bg-parchment-50 text-stone-600 border-parchment-200 hover:border-forest-400 hover:text-forest-600'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Demo mode notice */}
        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <strong>Demo mode:</strong> Add your Supabase keys to <code>.env.local</code> to see and post real questions.
          </div>
        )}

        {/* Post list */}
        {posts.length === 0 ? (
          <>
            {/* Form first so new users can immediately post */}
            <section aria-label="Ask a question" className="mb-10">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Ask a Question
                </h2>
                <p className="text-stone-500 text-sm mt-1">Neighbors know things no search engine does.</p>
              </div>
              <NewPostForm />
            </section>

            <div className="empty-state">
              <div className="empty-state-icon text-5xl">🌾</div>
              <p className="empty-state-title">
                {activeCategory === 'All' ? 'No questions yet — be the first' : `No posts in "${activeCategory}" yet`}
              </p>
              <p className="empty-state-text">
                {isConfigured ? 'Use the form above to post a question.' : 'Configure Supabase to enable the forum.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3" role="list">
              {posts.map(post => {
                const catName = (post.forum_categories as { name?: string } | null)?.name ?? 'General';
                return (
                  <div
                    key={post.id}
                    role="listitem"
                    className="card p-5 hover:border-forest-200 border border-parchment-200"
                  >
                    <Link href={`/forum/${post.id}`} className="flex items-start gap-4 group">
                      {/* Reply count */}
                      <div
                        className="shrink-0 w-12 h-12 rounded-xl bg-parchment-100 border border-parchment-200 flex flex-col items-center justify-center"
                        aria-label={`${post.reply_count ?? 0} ${(post.reply_count ?? 0) === 1 ? 'reply' : 'replies'}`}
                      >
                        <span className="text-lg font-bold text-stone-700" aria-hidden="true">{post.reply_count ?? 0}</span>
                        <span className="text-xs text-stone-600" aria-hidden="true">{(post.reply_count ?? 0) === 1 ? 'reply' : 'replies'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {post.is_pinned && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800">
                              📌 Pinned
                            </span>
                          )}
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[catName] ?? 'bg-stone-100 text-stone-700'}`}>
                            {catName}
                          </span>
                        </div>
                        <h2 className="font-semibold text-stone-900 group-hover:text-forest-600 transition-colors leading-snug mb-1 text-base">
                          {post.title}
                        </h2>
                        <p className="text-sm text-stone-600 flex flex-wrap items-center gap-1.5">
                          <span>{post.author_name}</span>
                          {isWhidbeyLocal(post.zip_code) && <LocalBadge />}
                          <span>·</span>
                          <time dateTime={post.created_at}>
                            {formatPostDate(post.created_at)}
                          </time>
                        </p>
                      </div>
                      <span className="text-stone-300 group-hover:text-forest-400 transition-colors shrink-0 text-lg" aria-hidden="true">→</span>
                    </Link>
                    {/* #13 Quick reactions */}
                    <div className="mt-3 pt-3 border-t border-parchment-100 pl-16">
                      <QuickReactions postId={post.id} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile FAB — scrolls to the ask section */}
            <a
              href="#ask"
              className="fixed bottom-[80px] right-4 z-40 md:hidden btn-primary rounded-full w-14 h-14 text-2xl shadow-warm-lg flex items-center justify-center"
              aria-label="Ask a question"
            >
              ✍️
            </a>

            {/* Ask a question section */}
            <section id="ask" aria-label="Ask a question" className="mt-16 pt-10 border-t border-parchment-200">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Ask a Question
                </h2>
                <p className="text-stone-500 text-sm mt-1">Neighbors know things no search engine does.</p>
              </div>
              <NewPostForm />
            </section>
          </>
        )}
      </div>
    </>
  );
}
