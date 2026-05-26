'use client';

import { useState, useEffect } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function EventRsvpButton({ eventId }: { eventId: string }) {
  const { user }                    = useAuth();
  const [count, setCount]           = useState(0);
  const [going, setGoing]           = useState(false);
  const [loading, setLoading]       = useState(isConfigured);
  const [busy, setBusy]             = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    Promise.resolve(
      supabase
        .from('event_rsvps')
        .select('user_email')
        .eq('event_id', eventId)
    )
      .then(({ data }) => {
        setCount(data?.length ?? 0);
        setGoing(data?.some(r => r.user_email === user?.email) ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId, user?.email]);

  async function toggle() {
    if (busy || !user?.email || !isConfigured) return;
    setBusy(true);
    if (going) {
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_email', user.email);
      setGoing(false);
      setCount(c => Math.max(0, c - 1));
    } else {
      const { error } = await supabase
        .from('event_rsvps')
        .insert({ event_id: eventId, user_email: user.email });
      if (!error) {
        setGoing(true);
        setCount(c => c + 1);
      }
    }
    setBusy(false);
  }

  if (!isConfigured || loading) return null;

  return (
    <button
      onClick={toggle}
      disabled={!user || busy}
      title={!user ? 'Sign in to RSVP' : going ? 'Cancel your RSVP' : 'Mark yourself as going'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
        going
          ? 'bg-forest-600 text-parchment-50 border-forest-600 shadow-warm-sm'
          : user
            ? 'bg-parchment-50 text-forest-600 border-forest-200 hover:bg-forest-100'
            : 'bg-parchment-50 text-stone-600 border-parchment-300 cursor-not-allowed'
      }`}
    >
      <span aria-hidden="true">{going ? '✓' : '+'}</span>
      <span>{going ? 'Going' : 'Going?'}{count > 0 ? ` (${count})` : ''}</span>
    </button>
  );
}
