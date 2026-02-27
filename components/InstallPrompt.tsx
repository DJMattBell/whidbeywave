'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [banner, setBanner]   = useState<'android' | 'ios' | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  // ── Mount: set up listeners / timers ──────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed') === 'true') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as Record<string, unknown>)['MSStream'];

    // iOS — no beforeinstallprompt, instruct manually after 45 s
    if (isIOS) {
      const t = setTimeout(() => setBanner('ios'), 45_000);
      return () => clearTimeout(t);
    }

    // Android / Chrome — capture deferred prompt, show after 30 s
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      timer = setTimeout(() => setBanner('android'), 30_000);
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // ── Second-page trigger for Android ───────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('pwa-dismissed') === 'true') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return;

    const count = parseInt(sessionStorage.getItem('pwa-nav') || '0', 10) + 1;
    sessionStorage.setItem('pwa-nav', String(count));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (count >= 2 && deferred) setBanner('android');
  }, [pathname, deferred]);

  // ── Actions ───────────────────────────────────────────────────────────
  function dismiss() {
    localStorage.setItem('pwa-dismissed', 'true');
    setBanner(null);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') localStorage.setItem('pwa-dismissed', 'true');
    setBanner(null);
    setDeferred(null);
  }

  if (!banner) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      role="dialog"
      aria-label="Add WhidbeyWave to your home screen"
    >
      <div className="bg-forest-800 text-parchment-50 shadow-[0_-4px_24px_rgba(0,0,0,0.35)] px-5 pt-5 pb-7">

        {/* Header row */}
        <div className="flex items-start gap-3 mb-1">
          <span className="text-3xl leading-none shrink-0 mt-0.5" aria-hidden="true">🌊</span>
          <p className="flex-1 text-base font-semibold text-parchment-50 leading-snug">
            Add WhidbeyWave to your home screen for quick access to ferry status and island events
          </p>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl
                       text-2xl leading-none text-parchment-300
                       hover:text-parchment-50 hover:bg-forest-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Android: native install */}
        {banner === 'android' && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={install}
              className="flex-1 bg-parchment-50 text-forest-800 font-semibold
                         rounded-xl py-3 px-4 text-base min-h-[52px]
                         hover:bg-parchment-100 transition-colors"
            >
              Add to Home Screen
            </button>
            <button
              onClick={dismiss}
              className="px-5 py-3 rounded-xl text-base min-h-[52px]
                         text-parchment-300 hover:text-parchment-50
                         hover:bg-forest-700 transition-colors"
            >
              Not now
            </button>
          </div>
        )}

        {/* iOS: manual instruction */}
        {banner === 'ios' && (
          <div className="mt-3">
            <p className="text-[15px] text-parchment-300 leading-relaxed mb-4">
              In Safari, tap the{' '}
              <span className="inline-flex items-center gap-1 bg-forest-700 px-2 py-0.5 rounded-md font-medium">
                {/* iOS share / upload icon */}
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0L8 7m4-4 4 4"
                  />
                </svg>
                Share
              </span>{' '}
              button, then tap{' '}
              <strong className="text-parchment-100 font-semibold">
                &ldquo;Add to Home Screen&rdquo;
              </strong>
              .
            </p>
            <button
              onClick={dismiss}
              className="w-full py-3 min-h-[48px] text-base
                         text-parchment-400 hover:text-parchment-200 transition-colors"
            >
              Got it — maybe later
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
