'use client';

import { useState } from 'react';

const ALERT_CATEGORIES = [
  'All categories',
  'Furniture',
  'Electronics',
  'Clothing',
  'Tools',
  'Free Stuff',
  'Housing',
  'Vehicles',
  'Services',
  'Other',
] as const;

const inputCls =
  'px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400';

export default function ListingAlertSubscription() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/listings/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Could not reach the server. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-gradient-to-br from-parchment-100 to-amber-50 rounded-2xl p-8 border border-parchment-300 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">✉️</div>
        <h3 className="text-lg text-stone-900 font-semibold mb-1">You&apos;re subscribed!</h3>
        <p className="text-stone-600 text-sm leading-relaxed">
          We&apos;ll email you when new{category !== 'All categories' ? ` ${category.toLowerCase()}` : ''} listings go live.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-parchment-100 to-amber-50 rounded-2xl p-8 border border-parchment-300">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="text-4xl shrink-0" aria-hidden="true">🔔</div>
        <div className="flex-1">
          <h3 className="text-xl text-stone-900 font-semibold mb-1">Get notified of new listings</h3>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            We&apos;ll send you a quick email whenever something new goes up — no spam, just neighbors selling stuff.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`${inputCls} flex-1`}
              autoComplete="email"
              aria-label="Your email address"
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={`${inputCls} w-full sm:w-auto`}
              aria-label="Category to watch"
            >
              {ALERT_CATEGORIES.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary shrink-0 py-2.5 disabled:opacity-60"
            >
              {status === 'loading' ? 'Subscribing…' : 'Notify Me'}
            </button>
          </form>
          {status === 'error' && (
            <p className="text-red-500 text-sm mt-2" role="alert">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
