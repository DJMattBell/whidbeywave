'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import NotificationOptIn from '@/components/NotificationOptIn';
import { Bell } from 'lucide-react';

type Pref = { channel: string; event_type: string; enabled: boolean };

const EVENT_TYPES = [
  {
    category: 'Forum',
    types: [
      { key: 'forum_reply_to_my_post', label: 'Replies to my questions' },
    ],
  },
  {
    category: 'Marketplace',
    types: [
      { key: 'listing_contact', label: 'Someone contacts me about my listing' },
    ],
  },
  {
    category: 'Events',
    types: [
      { key: 'event_approved', label: 'My submitted event is approved' },
    ],
  },
];

const CHANNELS = ['email', 'push'] as const;

export default function NotificationPreferencesPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPrefsLoading(false);
      return;
    }

    async function fetchPrefs() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setPrefs(json.preferences ?? []);
      }
      setPrefsLoading(false);
    }
    fetchPrefs();
  }, [user]);

  function isEnabled(eventType: string, channel: string): boolean {
    const pref = prefs.find(p => p.event_type === eventType && p.channel === channel);
    if (pref) return pref.enabled;
    // Default: forum_reply_to_my_post email is ON
    if (eventType === 'forum_reply_to_my_post' && channel === 'email') return true;
    return false;
  }

  async function togglePref(eventType: string, channel: string) {
    const current = isEnabled(eventType, channel);
    const newEnabled = !current;
    const key = `${eventType}-${channel}`;
    setSaving(key);

    // Optimistic update
    setPrefs(prev => {
      const existing = prev.find(p => p.event_type === eventType && p.channel === channel);
      if (existing) {
        return prev.map(p => p === existing ? { ...p, enabled: newEnabled } : p);
      }
      return [...prev, { event_type: eventType, channel, enabled: newEnabled }];
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          updates: [{ channel, event_type: eventType, enabled: newEnabled }],
        }),
      });
    }

    setSaving(null);
  }

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <div className="bg-parchment-100 border-b border-parchment-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-2 text-sm text-stone-500">
              <li><Link href="/profile" className="hover:text-forest-600 transition-colors">Profile</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-stone-700">Notifications</li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Notification Preferences
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Choose how you want to hear from WhidbeyWave
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {loading && <p className="text-stone-500 text-sm">Loading…</p>}

        {!loading && !user && (
          <div className="text-center py-16">
            <Bell className="mx-auto text-parchment-300 mb-4" size={48} strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-stone-700 mb-2">Sign in to manage notifications</h2>
            <p className="text-stone-500 text-sm mb-6">Choose which updates you want to receive.</p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary">Sign In</button>
          </div>
        )}

        {!loading && user && (
          <div className="space-y-8">
            {/* Push notification setup */}
            <div className="card p-5">
              <h2 className="text-lg font-semibold text-stone-900 mb-3">Push Notifications</h2>
              <p className="text-sm text-stone-600 mb-4">
                Get instant alerts on your phone or desktop when something happens.
              </p>
              <NotificationOptIn />
            </div>

            {/* Preference toggles */}
            {prefsLoading ? (
              <p className="text-stone-500 text-sm">Loading preferences…</p>
            ) : (
              EVENT_TYPES.map(group => (
                <div key={group.category} className="card overflow-hidden">
                  <div className="bg-parchment-100 px-5 py-3 border-b border-parchment-200">
                    <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
                      {group.category}
                    </h3>
                  </div>
                  <div className="divide-y divide-parchment-200">
                    {group.types.map(type => (
                      <div key={type.key} className="px-5 py-4">
                        <p className="text-sm font-medium text-stone-800 mb-3">{type.label}</p>
                        <div className="flex gap-4">
                          {CHANNELS.map(channel => {
                            const enabled = isEnabled(type.key, channel);
                            const isSaving = saving === `${type.key}-${channel}`;
                            return (
                              <label key={channel} className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() => togglePref(type.key, channel)}
                                  disabled={isSaving}
                                  className="w-5 h-5 rounded border-parchment-300 text-forest-600 focus:ring-forest-600"
                                />
                                <span className="text-sm text-stone-600 capitalize">{channel}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
