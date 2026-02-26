'use client';

import { useEffect, useState } from 'react';

export default function TextSizeToggle() {
  const [large, setLarge] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Apply saved preference after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem('text-size');
    if (saved === 'large') {
      document.documentElement.classList.add('text-large');
      setLarge(true);
    }
    setMounted(true);
  }, []);

  function toggle() {
    const next = !large;
    setLarge(next);
    if (next) {
      document.documentElement.classList.add('text-large');
      localStorage.setItem('text-size', 'large');
    } else {
      document.documentElement.classList.remove('text-large');
      localStorage.setItem('text-size', 'normal');
    }
  }

  // Don't render until mounted (avoids SSR/client mismatch)
  if (!mounted) return null;

  return (
    <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col items-center gap-1">
      <button
        onClick={toggle}
        aria-pressed={large}
        aria-label={large ? 'Switch to normal text size' : 'Increase text size'}
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 ${
          large
            ? 'bg-amber-400 text-stone-900'
            : 'bg-forest-600 text-parchment-50'
        }`}
      >
        {large ? (
          <span className="text-xl font-bold leading-none">A✓</span>
        ) : (
          <span className="text-base font-bold leading-none">A</span>
        )}
      </button>
      <span className="sr-only">
        {large ? 'Large text is on' : 'Increase text size'}
      </span>
    </div>
  );
}
