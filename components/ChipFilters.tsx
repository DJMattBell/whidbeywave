'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';

import { getFilterFromCookie, type FilterChip } from '@/lib/chipFilters';
export type { FilterChip };
export { getFilterFromCookie };

const COOKIE_NAME = 'whidbey-filter';
const OLD_COOKIE_NAME = 'ww-persona';
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

const CHIPS: { key: FilterChip; label: string; emoji: string; description: string }[] = [
  { key: 'everyone',       label: 'Everyone',       emoji: '🏝️', description: 'The default island view' },
  { key: 'kids',           label: 'Kids',           emoji: '👧', description: 'Kid-friendly events and activities' },
  { key: 'seniors',        label: 'Seniors',        emoji: '🧓', description: 'Accessibility info and community events' },
  { key: 'visitors',       label: 'Visitors',       emoji: '🗺️', description: 'Best-of guides, ferry tips, restaurants' },
  { key: 'new-residents',  label: 'New Residents',  emoji: '📦', description: 'Getting settled on the island' },
  { key: 'outdoors',       label: 'Outdoors',       emoji: '🥾', description: 'Hiking, kayaking, parks, beaches' },
];

function getFilterCookie(): FilterChip {
  if (typeof document === 'undefined') return 'everyone';
  const cookies = document.cookie.split('; ');
  for (const c of cookies) {
    const [key, val] = c.split('=');
    if (key === COOKIE_NAME && CHIPS.some(ch => ch.key === val)) {
      return val as FilterChip;
    }
  }
  return 'everyone';
}

function setFilterCookie(filter: FilterChip) {
  // Set new cookie
  document.cookie = `${COOKIE_NAME}=${filter}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  // Migrate: delete old cookie if present
  document.cookie = `${OLD_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export default function ChipFilters({ active }: { active?: FilterChip }) {
  const router = useRouter();
  const [selected, setSelected] = useState<FilterChip>(active ?? 'everyone');
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Migrate old cookie on mount
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const currentCookie = getFilterCookie();
    if (currentCookie !== selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from cookie on mount
      setSelected(currentCookie);
    }
    // Delete old cookie regardless
    document.cookie = `${OLD_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback((chip: FilterChip) => {
    setSelected(chip);
    setFilterCookie(chip);
    router.refresh();
  }, [router]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % CHIPS.length;
      const el = scrollRef.current?.children[next] as HTMLElement;
      el?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + CHIPS.length) % CHIPS.length;
      const el = scrollRef.current?.children[prev] as HTMLElement;
      el?.focus();
    }
  }

  return (
    <div className="bg-parchment-50 border-b border-parchment-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-none snap-x"
            role="tablist"
            aria-label="Content filter"
          >
            {CHIPS.map((chip, i) => (
              <button
                key={chip.key}
                role="tab"
                aria-selected={selected === chip.key}
                onClick={() => handleSelect(chip.key)}
                onKeyDown={e => handleKeyDown(e, i)}
                tabIndex={selected === chip.key ? 0 : -1}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 min-h-[44px] select-none ${
                  selected === chip.key
                    ? 'bg-forest-600 text-parchment-50 shadow-sm scale-[1.02]'
                    : 'bg-parchment-100 text-stone-600 border border-parchment-200 hover:bg-parchment-200'
                }`}
              >
                <span aria-hidden="true">{chip.emoji}</span>
                {chip.label}
              </button>
            ))}
          </div>

          {/* "Why am I seeing this?" */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowInfo(p => !p)}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Why am I seeing this?"
            >
              <Info size={16} />
            </button>
            {showInfo && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowInfo(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white rounded-lg shadow-lg border border-parchment-200 p-4">
                  <p className="text-xs font-semibold text-stone-700 mb-2">What do these filters do?</p>
                  <div className="space-y-1.5">
                    {CHIPS.map(chip => (
                      <p key={chip.key} className="text-xs text-stone-600">
                        <strong>{chip.emoji} {chip.label}:</strong> {chip.description}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 mt-3">
                    Filters reorder sections — nothing is hidden. Your choice is saved.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

