'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

type Feedback = {
  id: string;
  message: string;
  page: string | null;
  email: string | null;
  created_at: string;
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function AdminFeedbackPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen]   = useState(false);
  const [items, setItems]         = useState<Feedback[]>([]);
  const [fetching, setFetching]   = useState(false);

  const isAdmin = Boolean(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  const loadFeedback = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase
      .from('site_feedback')
      .select('id, message, page, email, created_at')
      .order('created_at', { ascending: false });
    setItems((data ?? []) as Feedback[]);
    setFetching(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAdmin) loadFeedback();
  }, [isAdmin, loadFeedback]);

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">💬</span>
          <h1 className="text-3xl text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
            Site Feedback
          </h1>
        </div>
        <p className="text-stone-500 text-sm">Signed in as {user.email}</p>
        <div className="mt-3 flex gap-4 text-sm flex-wrap">
          <Link href="/admin/events"   className="text-forest-600 hover:text-forest-800 font-medium">← Events</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/news"     className="text-forest-600 hover:text-forest-800 font-medium">News Posts</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/listings" className="text-forest-600 hover:text-forest-800 font-medium">Marketplace</Link>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 font-medium">Feedback</span>
        </div>
      </div>

      {/* Count + refresh */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          <strong className="text-stone-800">{items.length}</strong> submission{items.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={loadFeedback}
          className="text-xs text-stone-400 border border-parchment-300 rounded-full px-3 py-1.5 hover:border-stone-400 transition-colors"
        >
          {fetching ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-stone-500 text-sm">No feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-5">
              <p className="text-stone-800 text-base leading-relaxed whitespace-pre-wrap mb-3">
                {item.message}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
                <span>📄 {item.page || '/'}</span>
                {item.email && (
                  <a href={`mailto:${item.email}`} className="text-forest-600 hover:text-forest-800">
                    ✉ {item.email}
                  </a>
                )}
                <span>🕐 {fmt(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
