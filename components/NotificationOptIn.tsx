'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/plausible';

type Status = 'idle' | 'requesting' | 'subscribed' | 'denied' | 'unsupported' | 'ios-not-pwa';

function isIOSSafariNotPWA(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isStandalone = (window.navigator as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  return isIOS && !isStandalone;
}

export default function NotificationOptIn() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleEnable() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    if (isIOSSafariNotPWA()) {
      setStatus('ios-not-pwa');
      return;
    }

    setStatus('requesting');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('denied');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setStatus('unsupported');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        applicationServerKey: vapidKey,
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('idle');
        return;
      }

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (res.ok) {
        setStatus('subscribed');
        trackEvent('notification-opt-in');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  }

  if (status === 'subscribed') {
    return (
      <div className="flex items-center gap-2 text-sm text-forest-600">
        <Bell size={16} />
        <span>Push notifications enabled</span>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <BellOff size={16} />
        <span>Notifications blocked — check your browser settings</span>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <BellOff size={16} />
        <span>Push notifications aren&apos;t supported in this browser</span>
      </div>
    );
  }

  if (status === 'ios-not-pwa') {
    return (
      <div className="info-banner">
        <Bell className="text-sound-600 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="font-semibold text-sm">Add WhidbeyWave to your home screen first</p>
          <p className="text-xs text-stone-600 mt-1">
            On iOS, push notifications only work when WhidbeyWave is installed as an app.
            Tap the share button in Safari, then &quot;Add to Home Screen.&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={status === 'requesting'}
      className="btn-secondary text-sm py-2 disabled:opacity-60"
    >
      <Bell size={16} />
      {status === 'requesting' ? 'Requesting…' : 'Enable push notifications'}
    </button>
  );
}
