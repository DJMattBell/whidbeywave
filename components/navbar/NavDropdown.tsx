'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

/**
 * Dropdown that works on both pointer-hover desktops and touch-screen laptops.
 *
 * - Pure mouse (hover: hover) → opens on hover, click toggles
 * - Touch device → first tap opens, second tap on trigger closes
 * - Outside click / Escape closes
 */
export default function NavDropdown({
  trigger,
  children,
  align = 'left',
}: {
  trigger: (props: { open: boolean; chevron: ReactNode }) => ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Detect touch on first interaction
  useEffect(() => {
    function onTouch() {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', onTouch);
    }
    window.addEventListener('touchstart', onTouch, { passive: true });
    return () => window.removeEventListener('touchstart', onTouch);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const chevron = (
    <svg
      className={`w-3 h-3 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.75"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 4 4 4-4" />
    </svg>
  );

  return (
    <div
      ref={ref}
      className="relative"
      // Only hover on non-touch devices
      onMouseEnter={isTouchDevice ? undefined : () => setOpen(true)}
      onMouseLeave={isTouchDevice ? undefined : () => setOpen(false)}
    >
      <div onClick={() => setOpen(v => !v)}>
        {trigger({ open, chevron })}
      </div>

      {open && (
        <div
          className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} pt-1 bg-transparent min-w-[240px] z-50`}
          onClick={() => setOpen(false)}
        >
          <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
