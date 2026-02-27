'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const CATEGORIES = [
  'General',
  'Recommendations',
  'Island Life',
  'Events',
  'Lost & Found',
  'For Sale / Free',
  'Welcome Newcomers',
];

const CATEGORY_SLUGS: Record<string, string> = {
  'General':           'general',
  'Recommendations':   'recommendations',
  'Island Life':       'island-life',
  'Events':            'events',
  'Lost & Found':      'lost-and-found',
  'For Sale / Free':   'for-sale-free',
  'Welcome Newcomers': 'welcome-newcomers',
};

export default function NewPostForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen]             = useState(false);
  const [categorySlug, setCategory] = useState('General');
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [anonName, setAnonName]     = useState('');
  const [anonZip, setAnonZip]       = useState('');
  const [status, setStatus]         = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (!user && !anonName.trim()) return;
    setStatus('loading');

    if (!isConfigured) {
      await new Promise(r => setTimeout(r, 600));
      setStatus('success');
      setTimeout(() => { setOpen(false); setStatus('idle'); setTitle(''); setBody(''); }, 2000);
      return;
    }

    const displayName = user
      ? (user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Anonymous')
      : anonName.trim();

    const zip = user
      ? (user.user_metadata?.zip_code ?? null)
      : (anonZip.trim() || null);

    // Look up the category UUID from forum_categories
    const slug = CATEGORY_SLUGS[categorySlug] ?? 'general';
    const { data: catData } = await supabase
      .from('forum_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    const { error } = await supabase.from('forum_posts').insert({
      title:       title.trim(),
      body:        body.trim() || null,
      author_id:   user?.id ?? null,
      author_name: displayName,
      author_email: user?.email ?? null,
      zip_code:    zip,
      category_id: catData?.id ?? null,
    });

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      router.refresh();
      setTimeout(() => {
        setOpen(false); setStatus('idle'); setTitle(''); setBody('');
        setAnonName(''); setAnonZip('');
      }, 1500);
    }
  }

  if (!open) {
    return (
      <div className="text-center py-8 border-t border-parchment-200 mt-4">
        <button onClick={() => setOpen(true)} className="btn-primary">
          Post a Question
        </button>
        <p className="text-xs text-stone-600 mt-2">
          {user
            ? `Posting as ${user.user_metadata?.full_name ?? user.email?.split('@')[0]}`
            : 'No account needed — just a name.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-parchment-50 rounded-2xl border border-parchment-300 shadow-warm-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
          Ask the island
        </h3>
        <button onClick={() => setOpen(false)} className="text-stone-600 hover:text-stone-800 text-sm">
          Cancel
        </button>
      </div>

      {status === 'success' ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🌿</div>
          <p className="text-forest-700 font-semibold">Question posted — thank you!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
            <select
              value={categorySlug} onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-700"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Name + zip for anonymous users */}
          {!user && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Your name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" required value={anonName} onChange={e => setAnonName(e.target.value)}
                  placeholder="Jane from Langley"
                  maxLength={80}
                  className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Zip code
                  <span className="text-stone-600 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text" inputMode="numeric" value={anonZip}
                  onChange={e => setAnonZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="98277"
                  maxLength={5}
                  className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                />
                <p className="text-xs text-stone-600 mt-1">Whidbey zips get a 🌊 Local badge</p>
              </div>
            </div>
          )}

          {user && (
            <p className="text-xs text-stone-600">
              Posting as <strong className="text-stone-700">
                {user.user_metadata?.full_name ?? user.email?.split('@')[0]}
              </strong>
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Your question <span className="text-red-400">*</span>
            </label>
            <input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Best place to get fresh oysters?"
              className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              More details <span className="text-stone-600 font-normal">(optional but helpful)</span>
            </label>
            <textarea
              rows={4} value={body} onChange={e => setBody(e.target.value)}
              placeholder="Any context that would help locals give a better answer…"
              className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-none"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-xs">Something went wrong — please try again.</p>
          )}

          <button type="submit" disabled={status === 'loading'} className="btn-primary disabled:opacity-60">
            {status === 'loading' ? 'Posting…' : 'Post Question'}
          </button>
        </form>
      )}
    </div>
  );
}
