'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { EVENT_TAGS, categoryColors } from '@/lib/data';
import type { Event, EventTag } from '@/lib/data';
import TimeWindowFilter, { getTimeWindowDates } from '@/components/TimeWindowFilter';
import type { TimeWindow } from '@/components/TimeWindowFilter';
import { SlidersHorizontal, ChevronRight, Calendar, X } from 'lucide-react';

const TAG_ICONS: Record<EventTag, string> = {
  'Kids Event':       '🧒',
  'Family Event':     '👨‍👩‍👧',
  'Adult Event':      '🍷',
  'Live Music':       '🎵',
  'Festival':         '🎉',
  'Karaoke':          '🎤',
  'Class':            '📚',
  'Visual Art':       '🎨',
  'Just Fun':         '😄',
  'Market':           '🛒',
  'Visitor Friendly': '🗺️',
};

const TOWNS = [
  'All',
  'Oak Harbor',
  'Coupeville',
  'Langley',
  'Freeland',
  'Greenbank',
  'Clinton',
] as const;

function isHappeningNow(event: Event): boolean {
  const now = new Date();
  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  if (event.date !== today) return false;
  if (!event.time) return false;
  const match = event.time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
  if (!match) return false;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2] || '0');
  const ampm = match[3].toLowerCase();
  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  const eventStart = new Date(now);
  eventStart.setHours(hours, minutes, 0, 0);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  return eventStart >= fourHoursAgo && eventStart <= now;
}

function isFreeEvent(event: Event): boolean {
  const desc = (event.description ?? '').toLowerCase();
  const title = event.title.toLowerCase();
  return desc.includes('free') || title.includes('free') ||
         desc.includes('no cost') || desc.includes('no charge') ||
         desc.includes('donation') || title.includes('donation');
}

function getToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

function formatGroupDate(dateStr: string): string {
  if (dateStr === getToday()) return 'Today';
  if (dateStr === getTomorrow()) return 'Tomorrow';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function formatStripDate(dateStr: string): { day: string; num: number } {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    num: d.getDate(),
  };
}

/** Represents either a one-off event or a collapsed recurring series */
type DisplayItem = {
  type: 'single';
  event: Event;
} | {
  type: 'recurring';
  recurringEventId: string;
  representative: Event; // the next upcoming occurrence (used for display)
  occurrenceCount: number;
};

/**
 * Collapse recurring events into single display rows.
 * Each recurring_event_id group becomes one row showing the earliest occurrence.
 * One-off events pass through unchanged.
 */
function collapseRecurring(events: Event[]): DisplayItem[] {
  const oneOffs: DisplayItem[] = [];
  const recurringGroups = new Map<string, Event[]>();

  for (const event of events) {
    if (event.recurring_event_id) {
      const group = recurringGroups.get(event.recurring_event_id) ?? [];
      group.push(event);
      recurringGroups.set(event.recurring_event_id, group);
    } else {
      oneOffs.push({ type: 'single', event });
    }
  }

  const recurringItems: DisplayItem[] = [];
  for (const [id, group] of recurringGroups) {
    // Sort by date to get the earliest (next) occurrence
    const sorted = group.sort((a, b) => a.date.localeCompare(b.date));
    recurringItems.push({
      type: 'recurring',
      recurringEventId: id,
      representative: sorted[0],
      occurrenceCount: sorted.length,
    });
  }

  // Merge and sort by date
  const all = [...oneOffs, ...recurringItems];
  all.sort((a, b) => {
    const dateA = a.type === 'single' ? a.event.date : a.representative.date;
    const dateB = b.type === 'single' ? b.event.date : b.representative.date;
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    // Within same date, happening-now items first
    const eventA = a.type === 'single' ? a.event : a.representative;
    const eventB = b.type === 'single' ? b.event : b.representative;
    return (isHappeningNow(eventA) ? 0 : 1) - (isHappeningNow(eventB) ? 0 : 1);
  });

  return all;
}

/** Get the display date for a DisplayItem */
function getItemDate(item: DisplayItem): string {
  return item.type === 'single' ? item.event.date : item.representative.date;
}

/** Get the display event for a DisplayItem */
function getItemEvent(item: DisplayItem): Event {
  return item.type === 'single' ? item.event : item.representative;
}

export default function EventsFilter({ events }: { events: Event[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(
    () => (searchParams.get('window') as TimeWindow) || 'all'
  );
  const [activeTown, setActiveTown] = useState(
    () => searchParams.get('town') || 'All'
  );
  const [activeTags, setActiveTags] = useState<EventTag[]>(
    () => {
      const raw = searchParams.get('tags');
      return raw ? raw.split(',').filter(Boolean) as EventTag[] : [];
    }
  );
  const [showFilters, setShowFilters] = useState(false);

  // Sync filter state to URL
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (timeWindow !== 'all') params.set('window', timeWindow);
    if (activeTown !== 'All') params.set('town', activeTown);
    if (activeTags.length > 0) params.set('tags', activeTags.join(','));
    const qs = params.toString();
    router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
  }, [timeWindow, activeTown, activeTags, router, pathname]);

  // Lock body scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showFilters]);

  function toggleTag(tag: EventTag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearAll() {
    setActiveTags([]);
    setActiveTown('All');
    setTimeWindow('all');
    setShowFilters(false);
  }

  const hasFilters = activeTags.length > 0 || activeTown !== 'All' || timeWindow !== 'all';
  const activeFilterCount = (activeTown !== 'All' ? 1 : 0) + activeTags.length;

  // Apply time window filter
  const { start, end } = getTimeWindowDates(timeWindow);
  const timeFiltered = events.filter((e) => {
    if (e.date < start) return false;
    if (end && e.date > end) return false;
    return true;
  });

  // Compute counts for each time window
  const windowCounts: Partial<Record<TimeWindow, number>> = {};
  (['today', 'tomorrow', 'weekend', 'week', 'all'] as TimeWindow[]).forEach((w) => {
    const { start: s, end: e } = getTimeWindowDates(w);
    windowCounts[w] = events.filter((ev) => {
      if (ev.date < s) return false;
      if (e && ev.date > e) return false;
      return true;
    }).length;
  });

  // Compute per-town counts (after time window, before town filter)
  const townCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const town of TOWNS) {
      if (town === 'All') {
        counts[town] = timeFiltered.length;
      } else {
        counts[town] = timeFiltered.filter((e) => e.town === town).length;
      }
    }
    return counts;
  }, [timeFiltered]);

  const filtered = timeFiltered.filter((e) => {
    if (activeTown !== 'All' && e.town !== activeTown) return false;
    if (activeTags.length > 0 && !activeTags.some((t) => e.tags.includes(t))) return false;
    return true;
  });

  // Collapse recurring events into single rows
  const displayItems = useMemo(() => collapseRecurring(filtered), [filtered]);

  // Group by date
  const dateGroups = useMemo(() => {
    const groups: [string, DisplayItem[]][] = [];
    for (const item of displayItems) {
      const date = getItemDate(item);
      const last = groups[groups.length - 1];
      if (last && last[0] === date) {
        last[1].push(item);
      } else {
        groups.push([date, [item]]);
      }
    }
    return groups;
  }, [displayItems]);

  // Date strip: unique dates with event counts (collapsed)
  const eventDates = dateGroups.map(([date, items]) => ({
    date,
    count: items.length,
    ...formatStripDate(date),
  }));

  const scrollToDate = useCallback((dateStr: string) => {
    const el = document.getElementById(`date-${dateStr}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  // Filter panel content (shared between desktop inline and mobile bottom sheet)
  const filterPanelContent = (
    <div className="space-y-3">
      {/* Town filter */}
      <div>
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Town</p>
        <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none sm:flex-wrap">
          {TOWNS.map((town) => {
            const active = town === activeTown;
            const count = townCounts[town] ?? 0;
            const isEmpty = town !== 'All' && count === 0;
            return (
              <button
                key={town}
                onClick={() => setActiveTown(town)}
                disabled={isEmpty}
                className={`inline-flex items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-150 min-h-[44px] ${
                  active
                    ? 'bg-sound-600 text-parchment-50 border-sound-600 shadow-warm scale-105'
                    : isEmpty
                      ? 'bg-parchment-50 text-stone-300 border-parchment-200 cursor-not-allowed'
                      : 'bg-sound-50 text-sound-700 border-sound-200 hover:bg-sound-100 hover:border-sound-300'
                }`}
              >
                <span>{town}</span>
                {town !== 'All' && (
                  <span className={`text-xs ${active ? 'text-parchment-200' : isEmpty ? 'text-stone-300' : 'text-sound-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag filter */}
      <div>
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Type</p>
        <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap">
          {EVENT_TAGS.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-150 min-h-[44px] ${
                  active
                    ? 'bg-forest-600 text-parchment-50 border-forest-600 shadow-warm scale-105'
                    : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50'
                }`}
              >
                <span>{TAG_ICONS[tag]}</span>
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter summary + clear */}
      {hasFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500" aria-live="polite">
            <strong className="text-stone-800">{displayItems.length}</strong>{' '}
            event{displayItems.length !== 1 ? 's' : ''}
            {activeTown !== 'All' && (
              <span className="text-sound-600 font-medium"> · {activeTown}</span>
            )}
            {activeTags.length > 0 && (
              <span className="text-forest-600 font-medium">
                {' '}· {activeTags.join(' or ')}
              </span>
            )}
          </p>
          <button
            onClick={clearAll}
            className="text-xs font-medium bg-stone-100 text-stone-600 border border-stone-300 rounded-full px-3 py-1.5 hover:bg-stone-200 transition-colors min-h-[36px]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* ── Sticky filter bar ──────────────────────── */}
      <div className="sticky top-[64px] z-10 bg-parchment-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 shadow-sm border-b border-parchment-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
            <TimeWindowFilter active={timeWindow} onChange={setTimeWindow} counts={windowCounts} />
          </div>
          {/* Mobile: inline clear + filter toggle */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-medium text-stone-500 hover:text-stone-700 px-2 py-1 transition-colors min-h-[44px]"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
                activeFilterCount > 0
                  ? 'bg-forest-600 text-parchment-50 border-forest-600'
                  : 'bg-parchment-50 text-stone-600 border-parchment-300'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-parchment-50/20 text-parchment-50 text-xs font-bold rounded-full px-1.5 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop: filter panel always visible */}
        <div className="hidden md:block mt-3">
          {filterPanelContent}
        </div>
      </div>

      {/* ── Mobile bottom sheet ────────────────────── */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowFilters(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-parchment-50 rounded-t-2xl shadow-lg max-h-[70vh] overflow-y-auto">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-stone-300 rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-parchment-200">
              <h3 className="text-base font-semibold text-stone-800">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-forest-600 text-parchment-50 min-h-[44px]"
              >
                Done
              </button>
            </div>
            {/* Content */}
            <div className="px-4 py-4">
              {filterPanelContent}
            </div>
          </div>
        </div>
      )}

      {/* ── Date strip ─────────────────────────────── */}
      {eventDates.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {eventDates.map(({ date, day, num, count }) => {
            const isToday = date === getToday();
            return (
              <button
                key={date}
                onClick={() => scrollToDate(date)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium border transition-colors min-w-[52px] min-h-[44px] ${
                  isToday
                    ? 'bg-forest-600 text-parchment-50 border-forest-600'
                    : 'bg-white text-stone-700 border-parchment-200 hover:border-forest-300 hover:bg-forest-50'
                }`}
              >
                <span className="uppercase tracking-wide">{day}</span>
                <span className="text-lg font-bold leading-tight">{num}</span>
                <span className={`text-[10px] ${isToday ? 'text-parchment-200' : 'text-stone-400'}`}>
                  {count} evt{count !== 1 ? 's' : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Event groups or empty state ────────────── */}
      {displayItems.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">Nothing matches those filters</h3>
          <p className="empty-state-text">Try fewer filters or a different time window.</p>
          <button onClick={clearAll} className="btn-primary">
            Show everything
          </button>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-4">
          {dateGroups.map(([date, dayItems]) => (
            <div key={date} id={`date-${date}`}>
              {/* Date heading — sticky on mobile, static on desktop */}
              <h3 className="sticky top-[120px] md:static z-[5] bg-parchment-50 py-2 mb-2 md:mb-3 md:py-0 md:mt-4 border-b border-parchment-200 md:border-0 text-sm md:text-base font-semibold text-stone-500 md:text-stone-700 uppercase tracking-wider font-heading">
                {formatGroupDate(date)}
                <span className="text-stone-400 font-normal ml-2">
                  — {dayItems.length} event{dayItems.length !== 1 ? 's' : ''}
                </span>
              </h3>

              {/* Event cards — unified compact layout */}
              <div className="space-y-2">
                {dayItems.map((item) => {
                  const event = getItemEvent(item);
                  const happeningNow = isHappeningNow(event);
                  const free = isFreeEvent(event);
                  const isRecurring = item.type === 'recurring';
                  const d = new Date(event.date + 'T12:00:00');

                  return (
                    <Link
                      key={item.type === 'single' ? event.id : item.recurringEventId}
                      href={`/events/${event.id}`}
                      className="card-pressable group block"
                    >
                      <div className="flex items-center gap-3 p-3 md:p-4">
                        {/* Date block */}
                        <div
                          className={`shrink-0 w-12 md:w-14 h-14 md:h-16 rounded-lg flex flex-col items-center justify-center ${
                            happeningNow
                              ? 'bg-terra-600 text-parchment-50'
                              : 'bg-forest-50 text-forest-800 border border-forest-100'
                          }`}
                        >
                          <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide opacity-80">
                            {d.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl md:text-2xl font-extrabold leading-none">
                            {d.getDate()}
                          </span>
                          <span className="text-[10px] opacity-60">
                            {d.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            {happeningNow && <span className="badge-now text-[10px] px-1.5 py-0.5">Now</span>}
                            {free && !happeningNow && <span className="badge-free text-[10px] px-1.5 py-0.5">Free</span>}
                            {isRecurring && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                Recurring
                              </span>
                            )}
                            <span className={`badge text-[10px] px-1.5 py-0.5 ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                              {event.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-stone-900 text-sm md:text-base group-hover:text-forest-600 transition-colors line-clamp-1 md:line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-xs md:text-sm text-stone-600 truncate">
                            {event.time} · {event.town}
                          </p>
                          {isRecurring && event.recurrence_summary && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              {event.recurrence_summary}
                            </p>
                          )}
                        </div>

                        {/* Chevron */}
                        <ChevronRight size={18} className="text-stone-400 shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
