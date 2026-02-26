'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const CATEGORIES = [
  'Transportation', 'Arts & Culture', 'Agriculture', 'Community',
  'Nature', 'Events', 'Business', 'Health', 'Other',
];

type Post = {
  id: string;
  title: string;
  slug: string;
  emoji: string;
  category: string;
  read_minutes: number;
  published: boolean;
  published_at: string;
};

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fmt(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const EMPTY_FORM = {
  title:        '',
  slug:         '',
  emoji:        '📰',
  category:     'Community',
  read_minutes: '3',
  excerpt:      '',
  body:         '',
  author:       'WhidbeyWave',
  published_at: new Date().toISOString().split('T')[0],
  published:    true,
};

export default function AdminNewsPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  // Form state
  const [form, setForm]         = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [newId, setNewId]       = useState<string | null>(null);

  // Posts list
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});

  const isAdmin = Boolean(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('news_posts')
      .select('id, title, slug, emoji, category, read_minutes, published, published_at')
      .order('published_at', { ascending: false });
    setPosts((data ?? []) as Post[]);
    setLoadingPosts(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadPosts();
  }, [isAdmin, loadPosts]);

  // Auto-populate slug from title unless user has manually edited it
  function handleTitleChange(value: string) {
    setForm(f => ({
      ...f,
      title: value,
      slug: slugEdited ? f.slug : toSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setForm(f => ({ ...f, slug: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    const res  = await fetch('/api/news/create', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...form, read_minutes: Number(form.read_minutes) }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      setSubmitStatus('error');
      setSubmitting(false);
      return;
    }

    setSubmitStatus('ok');
    setNewId(data.id);
    setForm(EMPTY_FORM);
    setSlugEdited(false);
    setSubmitting(false);
    loadPosts();
  }

  async function togglePublished(post: Post) {
    setToggling(t => ({ ...t, [post.id]: true }));
    await fetch('/api/news/toggle', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: post.id, published: !post.published }),
    });
    await loadPosts();
    setToggling(t => ({ ...t, [post.id]: false }));
  }

  // ── Auth gates ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌊</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl text-stone-800 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
              Admin access only
            </h1>
            <p className="text-stone-500 mb-5 text-sm">You need to be signed in as an admin.</p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary">Sign in</button>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🌧️</div>
          <h1 className="text-2xl text-stone-800 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            Not authorized
          </h1>
          <p className="text-stone-500 text-sm">This page is restricted to site administrators.</p>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">📰</span>
          <h1 className="text-3xl text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
            News Posts
          </h1>
        </div>
        <p className="text-stone-500 text-sm">Signed in as {user.email}</p>
        <div className="mt-3 flex gap-4 text-sm flex-wrap">
          <Link href="/admin/events"   className="text-forest-600 hover:text-forest-800 font-medium">← Events</Link>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 font-medium">News Posts</span>
          <span className="text-stone-300">|</span>
          <Link href="/admin/listings" className="text-forest-600 hover:text-forest-800 font-medium">Marketplace →</Link>
        </div>
      </div>

      {/* ── Section A: Create post ─────────────────────────── */}
      <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 mb-10">
        <h2 className="text-xl font-semibold text-stone-800 mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Write a new post
        </h2>

        {submitStatus === 'ok' && (
          <div className="mb-5 p-4 bg-forest-50 border border-forest-200 rounded-xl flex items-center justify-between gap-4">
            <span className="text-forest-700 font-medium text-sm">Published! 🌿</span>
            <Link href="/news" target="_blank" className="text-forest-600 hover:text-forest-800 text-sm font-medium underline underline-offset-2">
              View on site →
            </Link>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Something went wrong — check the server logs.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title + Slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Penn Cove Musselfest Returns"
                className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="penn-cove-musselfest-returns"
                className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 font-mono"
              />
              {form.slug && (
                <p className="text-[11px] text-stone-400 mt-1">URL: whidbeywave.com/news#{form.slug}</p>
              )}
            </div>
          </div>

          {/* Emoji + Category + Read minutes */}
          <div className="grid sm:grid-cols-3 gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Emoji</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  maxLength={4}
                  className="w-20 px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                />
                <span className="text-4xl leading-none select-none" aria-hidden="true">{form.emoji}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Read minutes</label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.read_minutes}
                onChange={e => setForm(f => ({ ...f, read_minutes: e.target.value }))}
                className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Excerpt *</label>
            <textarea
              required
              rows={2}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="A short summary shown on the news page and in the newsletter."
              className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
              Body <span className="text-stone-400 font-normal normal-case ml-1">— separate paragraphs with a blank line</span>
            </label>
            <textarea
              rows={10}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write the full article here..."
              className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-y"
            />
          </div>

          {/* Author + Date + Published */}
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Published date</label>
              <input
                type="date"
                value={form.published_at}
                onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
                className="w-full px-3 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
              />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <input
                id="news-published"
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 rounded border-parchment-300 text-forest-600 focus:ring-forest-400"
              />
              <label htmlFor="news-published" className="text-sm font-medium text-stone-700 cursor-pointer select-none">
                Publish immediately
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60"
          >
            {submitting
              ? 'Saving…'
              : form.published
                ? 'Publish Post →'
                : 'Save Draft'}
          </button>

        </form>
      </div>

      {/* ── Section B: Existing posts ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-stone-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            All posts
          </h2>
          <button
            onClick={loadPosts}
            className="text-xs text-stone-400 border border-parchment-300 rounded-full px-3 py-1.5 hover:border-stone-400 transition-colors"
          >
            {loadingPosts ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-stone-500 text-sm">No posts yet. Write the first one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id} className="bg-parchment-50 rounded-xl border border-parchment-200 px-5 py-4 flex items-center gap-4">
                <span className="text-2xl shrink-0" aria-hidden="true">{post.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate"
                     style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {post.title}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {post.category} · {fmt(post.published_at)} · {post.read_minutes} min read
                  </p>
                </div>
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  post.published
                    ? 'bg-forest-100 text-forest-800 border border-forest-200'
                    : 'bg-stone-100 text-stone-500 border border-stone-200'
                }`}>
                  {post.published ? 'live' : 'draft'}
                </span>
                <button
                  onClick={() => togglePublished(post)}
                  disabled={toggling[post.id]}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                    post.published
                      ? 'bg-white text-stone-500 border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-white text-forest-600 border-forest-200 hover:bg-forest-50'
                  }`}
                >
                  {toggling[post.id] ? '…' : post.published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
