'use client';

import { useState, useEffect } from 'react';

export default function TextSizeFooterToggle() {
  const [large, setLarge] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('whidbey-text-size');
    if (saved === 'large') setLarge(true);
  }, []);

  if (!mounted) return null;

  function toggle() {
    const next = !large;
    setLarge(next);
    if (next) {
      document.documentElement.classList.add('text-large');
      localStorage.setItem('whidbey-text-size', 'large');
    } else {
      document.documentElement.classList.remove('text-large');
      localStorage.setItem('whidbey-text-size', 'normal');
    }
  }

  return (
    <button
      onClick={toggle}
      className="hover:text-parchment-300 transition-colors"
      title={large ? 'Reset text size' : 'Increase text size'}
      aria-label={large ? 'Reset text size' : 'Increase text size'}
    >
      {large ? 'Aa−' : 'Aa+'}
    </button>
  );
}
