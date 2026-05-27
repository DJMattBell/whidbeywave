'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import NotificationOptIn from '@/components/NotificationOptIn';
import { Gift, X } from 'lucide-react';

const TOWNS = [
  'Oak Harbor', 'Coupeville', 'Langley', 'Freeland',
  'Greenbank', 'Clinton',
] as const;

type Props = {
  onClose: () => void;
};

export default function FlashGiveSubscriptionSheet({ onClose }: Props) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedTowns, setSelectedTowns] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function toggleTown(town: string) {
    setSelectedTowns(prev =>
      prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town]
    );
  }

  async function handleSave() {
    if (!user) { setAuthOpen(true); return; }
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const scope = selectedTowns.length > 0 ? { towns: selectedTowns } : null;

    await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        updates: [
          { channel: 'email', event_type: 'flash_give_in_my_area', enabled: true, scope },
          { channel: 'push', event_type: 'flash_give_in_my_area', enabled: true, scope },
        ],
      }),
    });

    setSaving(false);
    setDone(true);
  }

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[71] animate-slideUp">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-parchment-300 rounded-full" />
          </div>

          <div className="px-5 pb-6 pt-2">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center">
                  <Gift className="text-forest-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Free stuff alerts</h2>
                  <p className="text-sm text-stone-500">Get notified when neighbors give things away</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-600 transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-forest-700 font-semibold mb-1">You&apos;re all set!</p>
                <p className="text-sm text-stone-500">
                  We&apos;ll let you know when free items pop up
                  {selectedTowns.length > 0 ? ` near ${selectedTowns.join(', ')}` : ' on the island'}.
                </p>
                <button onClick={onClose} className="btn-secondary text-sm mt-4">
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Town selection */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Narrow by town <span className="normal-case font-normal">(optional — leave blank for all)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TOWNS.map(town => (
                      <button
                        key={town}
                        onClick={() => toggleTown(town)}
                        className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors min-h-[44px] ${
                          selectedTowns.includes(town)
                            ? 'bg-forest-500 text-parchment-50 border-forest-500'
                            : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-300'
                        }`}
                      >
                        {town}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Push opt-in */}
                {user && (
                  <div className="mb-5 bg-parchment-50 rounded-xl border border-parchment-200 p-4">
                    <p className="text-xs font-semibold text-stone-600 mb-2">Push notifications</p>
                    <NotificationOptIn />
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full btn-primary justify-center mb-2 disabled:opacity-60"
                >
                  {!user ? 'Sign in to subscribe' : saving ? 'Saving…' : 'Subscribe to free stuff alerts'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors py-2 min-h-[44px]"
                >
                  Not now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
