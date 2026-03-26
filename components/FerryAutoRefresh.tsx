'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function FerryAutoRefresh() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const refresh = useCallback(() => {
    router.refresh();
    setLastRefresh(new Date());
    setCountdown(REFRESH_INTERVAL / 1000);
  }, [router]);

  // Auto-refresh on interval
  useEffect(() => {
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  // Countdown timer
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastRefresh]);

  // Refresh when tab becomes visible again
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastRefresh.getTime();
        if (elapsed >= REFRESH_INTERVAL) {
          refresh();
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [lastRefresh, refresh]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="flex items-center justify-center gap-3 text-sm text-stone-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </span>
      <span className="text-stone-300">·</span>
      <span>
        Refreshes in {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <button
        onClick={refresh}
        className="text-forest-600 hover:text-forest-800 font-medium transition-colors"
      >
        Refresh now
      </button>
    </div>
  );
}
