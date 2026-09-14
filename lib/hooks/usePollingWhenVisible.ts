'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Polls a callback on a fixed interval, pausing when the tab is hidden
 * and resuming (with an immediate call) when visible again.
 *
 * Extracted from Navbar bell badge polling (Phase 19c) for reuse.
 */
export function usePollingWhenVisible(
  callback: () => void | Promise<void>,
  intervalMs: number
) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const stableCallback = useCallback(() => callbackRef.current(), []);

  useEffect(() => {
    stableCallback();
    let interval: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (!interval) interval = setInterval(stableCallback, intervalMs);
    }
    function stopPolling() {
      if (interval) { clearInterval(interval); interval = null; }
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        stableCallback();
        startPolling();
      } else {
        stopPolling();
      }
    }

    startPolling();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [stableCallback, intervalMs]);
}
