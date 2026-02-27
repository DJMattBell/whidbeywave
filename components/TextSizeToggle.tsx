'use client';
import { useState, useEffect } from 'react';

export default function TextSizeToggle() {
  const [large, setLarge] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem('whidbey-text-size');
    if (saved === 'large') {
      setLarge(true);
      document.documentElement.classList.add('text-large');
    }
  }, []);

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

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      title="Text size"
      aria-label={large ? 'Reset text size' : 'Increase text size'}
      className={`md:hidden fixed bottom-6 right-4 z-40 w-[52px] h-[52px] rounded-full shadow-warm-md flex items-center justify-center transition-colors duration-200 ${
        large ? 'bg-amber-500 text-white' : 'bg-forest-700 text-parchment-50'
      }`}
    >
      <span
        className={`font-bold leading-none ${large ? 'text-xl' : 'text-base'}`}
        aria-hidden="true"
      >
        A
      </span>
      {large && (
        <span
          className="absolute -top-0.5 -right-0.5 text-[10px] bg-white text-amber-500 rounded-full w-4 h-4 flex items-center justify-center font-bold"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
    </button>
  );
}
