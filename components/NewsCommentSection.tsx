'use client';

import { useState, useEffect } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export default function NewsCommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(isConfigured);
  const [name, setName]         = useState('');
  const [body, setBody]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash]       = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isConfigured) return;
    supabase
      .from('news_comments')
      .select('id, author_name, body, created_at')
      .eq('article_slug', slug)
      .order('created_at', { ascending: true })
      .then(({ data, error: fetchErr }) => {
        if (fetchErr) {
          console.error('[NewsCommentSection] fetch error:', fetchErr);
          setError('Could not load comments.');
        } else {
          setComments((data as Comment[]) ?? []);
        }
        setLoading(false);
      });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    if (!isConfigured) {
      setFlash('Comments will be available once the site is live.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { data, error: err } = await supabase
      .from('news_comments')
      .insert({ article_slug: slug, author_name: name.trim(), body: body.trim() })
      .select('id, author_name, body, created_at')
      .single();
    if (err) {
      setError('Something went wrong. Please try again.');
    } else {
      setComments(prev => [...prev, data as Comment]);
      setBody('');
      setFlash('Comment posted!');
      setTimeout(() => setFlash(''), 3000);
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-8 border-t border-parchment-200 pt-6">
      <h3 className="text-base font-semibold text-stone-700 mb-4 flex items-center gap-1.5">
        💬 Comments
        {comments.length > 0 && (
          <span className="text-stone-600 font-normal">({comments.length})</span>
        )}
      </h3>

      {/* Comment list */}
      {loading ? (
        <p className="text-sm text-stone-600 mb-4">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-stone-500 mb-4">No comments yet — be the first.</p>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-semibold text-stone-800 text-sm">{c.author_name}</span>
                <span className="text-xs text-stone-500">
                  {new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="bg-parchment-50 rounded-xl p-4 border border-parchment-200">
        <p className="text-sm font-semibold text-stone-600 mb-3">Leave a comment</p>
        {flash && <p className="text-xs text-forest-600 font-medium mb-2">{flash}</p>}
        {error && <p className="text-xs text-terra-600 mb-2" role="alert">{error}</p>}

        <div className="mb-3">
          <label htmlFor={`comment-name-${slug}`} className="sr-only">Your name</label>
          <input
            id={`comment-name-${slug}`}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={80}
            className="input-base sm:max-w-xs"
          />
        </div>

        <div className="mb-3">
          <label htmlFor={`comment-body-${slug}`} className="sr-only">Your comment</label>
          <textarea
            id={`comment-body-${slug}`}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts…"
            required
            rows={3}
            maxLength={1000}
            className="input-base resize-none"
          />
          <p className="text-xs text-stone-500 mt-1 text-right">{body.length}/1000</p>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim() || !body.trim()}
          className="btn-primary"
        >
          {submitting ? 'Posting…' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}
