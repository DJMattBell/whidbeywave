'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isWhidbeyLocal } from '@/lib/whidbey-zips';

const STORAGE_KEY = 'ww-zip-prompt-dismissed';

export default function ZipPrompt({ user }: { user: User }) {
  const [dismissed, setDismissed] = useState(true); // start hidden, reveal after check
  const [zip, setZip]             = useState('');
  const [saving, setSaving]       = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Only show if user has no zip and hasn't dismissed before
    if (user.user_metadata?.zip_code) return;
    const prev = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : '1';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!prev) setDismissed(false);
  }, [user]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = zip.trim();
    if (!trimmed || trimmed.length < 5) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { zip_code: trimmed } });
    setSaving(false);
    setConfirmed(true);
    // Auto-dismiss after showing the result
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      setDismissed(true);
    }, 3000);
  }

  if (dismissed) return null;

  const isLocal = isWhidbeyLocal(zip.trim());

  return (
    <div
      className="fixed bottom-5 right-5 z-50 w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-parchment-200 overflow-hidden"
      role="dialog"
      aria-label="Tell us your zip code"
    >
      {/* Header */}
      <div className="bg-forest-800 px-5 py-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-parchment-50 font-semibold text-sm">You&apos;re in!</p>
          <p className="text-parchment-300 text-xs mt-0.5 leading-snug">
            What&apos;s your zip code? Locals get a special badge.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-parchment-400 hover:text-parchment-100 transition-colors shrink-0 text-lg leading-none mt-0.5"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {confirmed ? (
          <div className="text-center py-2">
            {isWhidbeyLocal(zip.trim()) ? (
              <>
                <p className="text-2xl mb-1">🌊</p>
                <p className="font-bold text-forest-700 text-sm">You&apos;re a local!</p>
                <p className="text-xs text-stone-600 mt-0.5">Your posts will show the Local badge.</p>
              </>
            ) : (
              <>
                <p className="text-2xl mb-1">👋</p>
                <p className="font-semibold text-stone-700 text-sm">Welcome to the island!</p>
                <p className="text-xs text-stone-600 mt-0.5">Zip code saved.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <label htmlFor="zip-prompt-input" className="sr-only">Zip code</label>
              <input
                id="zip-prompt-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={zip}
                onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 98277"
                className="w-full px-4 py-2.5 rounded-xl border border-parchment-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 bg-parchment-50 text-stone-800 placeholder:text-stone-400"
              />
              {zip.length === 5 && isLocal && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">🌊</span>
              )}
            </div>
            {zip.length === 5 && isLocal && (
              <p className="text-xs text-sound-700 font-semibold flex items-center gap-1">
                <span>🌊</span> That&apos;s a Whidbey zip — you&apos;ll get the Local badge!
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={zip.trim().length < 5 || saving}
                className="flex-1 py-2 rounded-xl bg-forest-500 text-parchment-50 text-sm font-semibold hover:bg-forest-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="text-xs text-stone-600 hover:text-stone-800 transition-colors px-2 py-2"
              >
                Skip
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
