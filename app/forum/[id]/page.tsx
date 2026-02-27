import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient, isConfigured } from '@/lib/supabase';
import type { ForumPost, ForumReply } from '@/lib/db-types';
import ReplyForm from '@/components/forum/ReplyForm';
import LocalBadge from '@/components/LocalBadge';
import { isWhidbeyLocal } from '@/lib/whidbey-zips';

export const revalidate = 30;

const CATEGORY_COLORS: Record<string, string> = {
  General:             'bg-stone-100 text-stone-700',
  Recommendations:     'bg-amber-100 text-amber-800',
  'Island Life':       'bg-forest-100 text-forest-800',
  Events:              'bg-sound-100 text-sound-800',
  'Lost & Found':      'bg-terra-100 text-terra-700',
  'For Sale / Free':   'bg-amber-100 text-amber-900',
  'Welcome Newcomers': 'bg-forest-50 text-forest-700',
};

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!isConfigured) return { title: 'Forum Thread' };
  const db = createServerClient();
  const { data } = await db.from('forum_posts').select('*').eq('id', params.id).single();
  return { title: (data as any)?.title ?? 'Forum Thread' };
}

export default async function ForumThreadPage({ params }: { params: { id: string } }) {
  if (!isConfigured) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🌧️</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Forum not configured yet</h1>
        <p className="text-stone-500 mb-6">Add your Supabase keys to <code>.env.local</code> to enable the forum.</p>
        <Link href="/forum" className="btn-secondary">← Back to Forum</Link>
      </div>
    );
  }

  const db = createServerClient();

  const [postRes, repliesRes] = await Promise.all([
    db.from('forum_posts').select('*, forum_categories(name, slug)').eq('id', params.id).single(),
    db.from('forum_replies').select('*').eq('post_id', params.id).order('created_at', { ascending: true }),
  ]);

  if (postRes.error || !postRes.data) notFound();

  const post    = postRes.data as unknown as ForumPost;
  const replies = (repliesRes.data ?? []) as ForumReply[];
  const catName = (post.forum_categories as any)?.name ?? 'General';
  const catSlug = (post.forum_categories as any)?.slug ?? 'general';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

      {/* Back link */}
      <Link
        href={`/forum?category=${encodeURIComponent(catName)}`}
        className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 mb-8 font-medium"
      >
        ← Back to {catName}
      </Link>

      {/* Original post */}
      <article className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm-md p-7 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.is_pinned && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-800">
              📌 Pinned
            </span>
          )}
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${CATEGORY_COLORS[catName] ?? 'bg-stone-100 text-stone-700'}`}>
            {catName}
          </span>
        </div>
        <h1 className="text-2xl text-stone-900 mb-3 leading-snug font-semibold">
          {post.title}
        </h1>
        <p className="text-sm text-stone-600 mb-5 flex flex-wrap items-center gap-1.5">
          <span>Asked by <strong className="text-stone-600">{post.author_name}</strong></span>
          {isWhidbeyLocal(post.zip_code) && <LocalBadge />}
          <span>·</span>
          <time dateTime={post.created_at} title={formatFullDate(post.created_at)}>
            {formatFullDate(post.created_at)}
          </time>
        </p>
        {post.body && post.body.trim() && (
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap border-t border-parchment-200 pt-4 text-base">
            {post.body}
          </p>
        )}
      </article>

      {/* Replies */}
      <section aria-label="Replies">
        <h2 className="text-lg text-stone-800 mb-4 font-semibold">
          {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
        </h2>

        {replies.length > 0 && (
          <ol className="space-y-4">
            {replies.map((reply, i) => (
              <li key={reply.id} className="flex gap-4">
                {/* Thread indicator */}
                <div className="flex flex-col items-center" aria-hidden="true">
                  <div className="w-8 h-8 rounded-full bg-forest-100 border border-forest-200 flex items-center justify-center text-xs font-bold text-forest-700 shrink-0">
                    {i + 1}
                  </div>
                  {i < replies.length - 1 && <div className="w-px flex-1 bg-parchment-300 my-1" />}
                </div>
                <div className="flex-1 bg-white rounded-xl border border-parchment-200 p-4">
                  <p className="text-xs text-stone-600 mb-2 flex flex-wrap items-center gap-1.5">
                    <strong className="text-stone-600">{reply.author_name}</strong>
                    {isWhidbeyLocal(reply.zip_code) && <LocalBadge />}
                    <span>·</span>
                    <time dateTime={reply.created_at} title={formatFullDate(reply.created_at)}>
                      {formatShortDate(reply.created_at)}
                    </time>
                  </p>
                  <p className="text-stone-700 text-base leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Reply form */}
      <div className="mt-8">
        <ReplyForm postId={params.id} />
      </div>
    </div>
  );
}
