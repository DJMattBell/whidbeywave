'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function ReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [body, setBody]         = useState('');
  const [anonName, setAnonName] = useState('');
  const [anonZip, setAnonZip]   = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    if (!user && !anonName.trim()) return;
    setStatus('loading');

    if (!isConfigured) {
      await new Promise(r => setTimeout(r, 600));
      setStatus('success');
      return;
    }

    if (user) {
      // Authenticated path — uses API route so reply notification email is sent
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('error'); return; }

      const res = await fetch('/api/forum/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ postId, body: body.trim() }),
      });

      if (!res.ok) {
        setStatus('error');
      } else {
        setStatus('success');
        router.refresh();
      }
    } else {
      // Anonymous path — direct insert, no notification email
      const { error } = await supabase.from('forum_replies').insert({
        post_id:     postId,
        body:        body.trim(),
        author_id:   null,
        author_name: anonName.trim(),
        zip_code:    anonZip.trim() || null,
      });

      if (error) {
        setStatus('error');
      } else {
        setStatus('success');
        router.refresh();
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6 bg-forest-50 rounded-xl border border-forest-100">
        <div className="text-3xl mb-2">🌿</div>
        <p className="text-forest-700 font-semibold text-sm">Your reply was posted — thank you!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-parchment-50 rounded-xl border border-parchment-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">
          Add your reply
        </h3>
        {user ? (
          <span className="text-xs text-stone-600">
            as {user.user_metadata?.full_name ?? user.email?.split('@')[0]}
          </span>
        ) : null}
      </div>

      {/* Name + zip for anonymous users */}
      {!user && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Your name <span className="text-red-400">*</span>
            </label>
            <input
              type="text" required value={anonName}
              onChange={e => setAnonName(e.target.value)}
              placeholder="Jane from Langley"
              maxLength={80}
              className="w-full px-4 py-2.5 border border-parchment-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 text-stone-800 placeholder:text-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Zip code <span className="text-stone-600 font-normal">(optional)</span>
            </label>
            <input
              type="text" inputMode="numeric" value={anonZip}
              onChange={e => setAnonZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="98277"
              maxLength={5}
              className="w-full px-4 py-2.5 border border-parchment-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 text-stone-800 placeholder:text-stone-400"
            />
            <p className="text-xs text-stone-600 mt-1">Whidbey zips get a 🌊 Local badge</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Your reply <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={4} required value={body} onChange={e => setBody(e.target.value)}
          placeholder="Share what you know…"
          className="w-full px-4 py-2.5 border border-parchment-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 text-stone-800 placeholder:text-stone-400 resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-xs" role="alert">Something went wrong — please try again.</p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary disabled:opacity-60">
        {status === 'loading' ? 'Posting…' : 'Post Reply'}
      </button>
    </form>
  );
}
