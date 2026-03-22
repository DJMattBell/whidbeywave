'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// #12 Floating Action Button for community contribution

const actions = [
  { href: '/submit-event',   emoji: '📅', label: 'Submit Event' },
  { href: '/submit-listing', emoji: '🏷️', label: 'Post Listing' },
  { href: '/forum#ask',      emoji: '💬', label: 'Ask the Island' },
  { href: '/recommendations',emoji: '⭐', label: 'Write a Review' },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on pages that already have their own submit forms
  const hiddenPaths = ['/submit-event', '/submit-listing', '/forum', '/admin'];
  const shouldHide = hiddenPaths.some(p => pathname.startsWith(p));

  // Close on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  if (shouldHide) return null;

  return (
    <div className="md:hidden fixed bottom-[84px] right-4 z-[49]">
      {/* Speed dial actions */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[48]"
            onClick={() => setOpen(false)}
          />
          <div className="flex flex-col gap-2 mb-3 animate-fadeIn">
            {actions.map(({ href, emoji, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 self-end bg-white rounded-full pl-4 pr-3 py-2.5 shadow-warm-md border border-parchment-200 hover:bg-forest-50 transition-colors"
              >
                <span className="text-sm font-medium text-stone-700">{label}</span>
                <span className="text-lg w-8 h-8 rounded-full bg-forest-50 flex items-center justify-center">{emoji}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close menu' : 'Create something'}
        aria-expanded={open}
        className={`w-14 h-14 rounded-full shadow-warm-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-stone-700 rotate-45'
            : 'bg-forest-600 hover:bg-forest-700'
        }`}
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
