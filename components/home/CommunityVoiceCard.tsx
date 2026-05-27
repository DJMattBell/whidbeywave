// "Neighbors Are Talking About" — the most active Ask the Island thread from the last 7 days.
// Styled as a conversation snippet. Skipped if no thread has 3+ replies.

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { createServerClient, isConfigured } from '@/lib/supabase';

type Props = {
  /** If the Lead Story is a forum thread, pass its ID here to avoid showing the same thread twice. */
  excludeThreadId?: string | null;
};

export default async function CommunityVoiceCard({ excludeThreadId }: Props) {
  if (!isConfigured) return null;

  const supabase = createServerClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query = supabase
    .from('forum_posts')
    .select('id, title, body, reply_count, author_name, created_at')
    .eq('is_pinned', false)
    .gte('created_at', sevenDaysAgo.toISOString())
    .gte('reply_count', 3)
    .order('reply_count', { ascending: false })
    .limit(1);

  if (excludeThreadId) {
    query = query.neq('id', excludeThreadId);
  }

  const { data } = await query;
  const thread = data?.[0];
  if (!thread) return null;

  // Relative time
  const diffMs = Date.now() - new Date(thread.created_at).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const timeAgo = diffHours < 1
    ? 'Just now'
    : diffHours < 24
    ? `${diffHours}h ago`
    : `${Math.floor(diffHours / 24)}d ago`;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
      <h2 className="section-title mb-4">Neighbors Are Talking About</h2>
      <Link
        href={`/forum/${thread.id}`}
        className="block bg-forest-50 rounded-xl p-6 hover:bg-forest-100 transition-colors group border border-forest-100"
      >
        <div className="flex items-start gap-4">
          <MessageCircle size={28} className="text-forest-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-stone-900 group-hover:text-forest-600 transition-colors leading-snug mb-2">
              {thread.title}
            </h3>
            {thread.body && (
              <p className="text-sm text-stone-600 line-clamp-2 mb-3">{thread.body}</p>
            )}
            <p className="text-xs text-stone-500">
              {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'} · {thread.author_name} · {timeAgo}
            </p>
          </div>
        </div>
        <span className="text-sm text-forest-600 group-hover:text-forest-800 transition-colors mt-3 block">
          Join the conversation →
        </span>
      </Link>
    </section>
  );
}
