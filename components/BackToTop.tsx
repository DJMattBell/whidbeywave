'use client';

import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-20 left-4 z-40 bg-parchment-200 text-stone-600
                 rounded-full px-4 py-2.5 min-h-[44px] min-w-[44px] text-sm font-medium shadow-warm-sm
                 hover:bg-parchment-300 transition-colors md:bottom-6 md:left-6"
    >
      ↑ Top
    </button>
  );
}
