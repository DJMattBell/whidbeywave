'use client';

import { useState } from 'react';

// #7 Time-Window Filters for events

export type TimeWindow = 'today' | 'tomorrow' | 'weekend' | 'week' | 'all';

const windows: { key: TimeWindow; label: string }[] = [
  { key: 'today',    label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend',  label: 'This Weekend' },
  { key: 'week',     label: 'This Week' },
  { key: 'all',      label: 'All Upcoming' },
];

export function getTimeWindowDates(window: TimeWindow): { start: string; end: string | null } {
  const now = new Date();
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const today = pst.toLocaleDateString('en-CA');

  switch (window) {
    case 'today':
      return { start: today, end: today };
    case 'tomorrow': {
      const tom = new Date(pst);
      tom.setDate(tom.getDate() + 1);
      const tomStr = tom.toLocaleDateString('en-CA');
      return { start: tomStr, end: tomStr };
    }
    case 'weekend': {
      // Find next Saturday (or today if it's Sat/Sun)
      const day = pst.getDay();
      const daysToSat = day === 0 ? 0 : day === 6 ? 0 : 6 - day;
      const sat = new Date(pst);
      sat.setDate(pst.getDate() + daysToSat);
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + (day === 0 ? 0 : 1));
      // If today is already weekend, start from today
      const start = day === 0 || day === 6 ? today : sat.toLocaleDateString('en-CA');
      return { start, end: sun.toLocaleDateString('en-CA') };
    }
    case 'week': {
      const end = new Date(pst);
      end.setDate(pst.getDate() + 7);
      return { start: today, end: end.toLocaleDateString('en-CA') };
    }
    case 'all':
      return { start: today, end: null };
  }
}

export default function TimeWindowFilter({
  active,
  onChange,
  counts,
}: {
  active: TimeWindow;
  onChange: (w: TimeWindow) => void;
  counts?: Partial<Record<TimeWindow, number>>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 md:flex-wrap">
      {windows.map(({ key, label }) => {
        const isActive = key === active;
        const count = counts?.[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-150 min-h-[44px] ${
              isActive
                ? 'bg-forest-600 text-parchment-50 border-forest-600 shadow-warm'
                : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50'
            }`}
          >
            <span>{label}</span>
            {count !== undefined && count > 0 && (
              <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${
                isActive ? 'bg-parchment-50/20 text-parchment-50' : 'bg-forest-100 text-forest-700'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
