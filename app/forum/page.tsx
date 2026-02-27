import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient, isConfigured } from '@/lib/supabase';
import type { ForumPost } from '@/lib/db-types';
import NewPostForm from '@/components/forum/NewPostForm';
import LocalBadge from '@/components/LocalBadge';
import { isWhidbeyLocal } from '@/lib/whidbey-zips';

export const metadata: Metadata = {
  title: 'Ask the Island — Whidbey Island Community Forum',
  description: 'Ask questions of Whidbey Island locals. Get answers from neighbors who know the island — recommendations, events, local life, and more.',
  openGraph: {
    title: 'Ask the Island — Whidbey Island Community Forum',
    description: 'Ask questions of Whidbey Island locals. Get answers from neighbors who know the island.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask the Island — Whidbey Island Community Forum',
    description: 'Ask questions of Whidbey Island locals.',
    images: ['/og-default.png'],
  },
};

export const revalidate = 60;

const CATEGORIES = [
  'All',
  'General',
  'Recommendations',
  'Island Life',
  'Events',
  'Lost & Found',
  'For Sale / Free',
  'Welcome Newcomers',
];

const CATEGORY_COLORS: Record<string, string> = {
  General:              'bg-stone-100 text-stone-700',
  Recommendations:      'bg-amber-100 text-amber-800',
  'Island Life':        'bg-forest-100 text-forest-800',
  Events:               'bg-sound-100 text-sound-800',
  'Lost & Found':       'bg-terra-100 text-terra-700',
  'For Sale / Free':    'bg-amber-100 text-amber-900',
  'Welcome Newcomers':  'bg-forest-50 text-forest-700',
};

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
    .select('*, forum_categories(name, slug)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (category && category !== 'All') {
    // Filter via the joined forum_categories name
    q = q.eq('forum_categories.name', category) as typeof q;
  }

  const { data } = await q;
  let posts = (data ?? []) as ForumPost[];

  // Client-side filter by category name since the join filter above may return all rows
  if (category && category !== 'All') {
    posts = posts.filter(p => (p.forum_categories as any)?.name === category);
  }

  return posts;
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const activeCategory = searchParams.category ?? 'All';
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
                      ? 'bg-forest-500 text-parchment-50 border-forest-500'
                      : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600'
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
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Demo mode:</strong> Add your Supabase keys to <code>.env.local</code> to see and post real questions.
          </div>
        )}

        {/* Post list */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
            <div className="text-5xl mb-4" aria-hidden="true">🌾</div>
            <p className="text-lg text-stone-700 mb-1 font-semibold">
              {activeCategory === 'All' ? 'No questions yet — be the first' : `No posts in "${activeCategory}" yet`}
            </p>
            <p className="text-stone-600 text-sm">
              {isConfigured ? 'Scroll down to post a question.' : 'Configure Supabase to enable the forum.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list">
            {posts.map(post => {
              const catName = (post.forum_categories as any)?.name ?? 'General';
              return (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  role="listitem"
                  className="block bg-parchment-50 rounded-2xl shadow-warm hover:shadow-warm-md transition-shadow duration-300 overflow-hidden p-5 group hover:border-forest-200 border border-transparent"
                >
                  <div className="flex items-start gap-4">
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
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* New post form */}
        <NewPostForm />
      </div>
    </>
  );
}
