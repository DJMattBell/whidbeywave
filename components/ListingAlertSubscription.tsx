'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplace';
import { Bell } from 'lucide-react';

const ALERT_CATEGORIES = ['All categories', ...MARKETPLACE_CATEGORIES.filter(c => c !== 'All')] as const;

export default function ListingAlertSubscription() {
  const { user, loading } = useAuth();
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authOpen, setAuthOpen] = useState(false);

  async function handleSubscribe() {
    if (!user) { setAuthOpen(true); return; }
    setStatus('loading');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus('error'); return; }

    const scope = category !== 'All categories'
      ? { categories: [category] }
      : null;

    const res = await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        updates: [
          { channel: 'email', event_type: 'new_listing_in_my_area', enabled: true, scope },
        ],
      }),
    });

    setStatus(res.ok ? 'success' : 'error');
  }

  if (status === 'success') {
    return (
      <div className="bg-gradient-to-br from-parchment-100 to-amber-50 rounded-xl p-8 border border-parchment-200 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">✉️</div>
        <h3 className="text-lg text-stone-900 font-semibold mb-1">You&apos;re subscribed!</h3>
        <p className="text-stone-600 text-sm leading-relaxed">
          We&apos;ll email you when new{category !== 'All categories' ? ` ${category.toLowerCase()}` : ''} listings go live.
        </p>
      </div>
    );
  }

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <div className="bg-gradient-to-br from-parchment-100 to-amber-50 rounded-xl p-8 border border-parchment-200">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Bell className="text-amber-600 shrink-0" size={36} strokeWidth={1.5} />
          <div className="flex-1">
            <h3 className="text-xl text-stone-900 font-semibold mb-1">Get notified of new listings</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              We&apos;ll send you a quick email whenever something new goes up — no spam, just neighbors selling stuff.
            </p>

            {!loading && !user ? (
              <button onClick={() => setAuthOpen(true)} className="btn-primary">
                Sign in to subscribe
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="px-4 py-2.5 border border-parchment-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 text-stone-800 w-full sm:w-auto"
                  aria-label="Category to watch"
                >
                  {ALERT_CATEGORIES.map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={handleSubscribe}
                  disabled={status === 'loading'}
                  className="btn-primary shrink-0 py-2.5 disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Notify Me'}
                </button>
              </div>
            )}

            {status === 'error' && (
              <p className="text-terra-600 text-sm mt-2" role="alert">Something went wrong — please try again.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
