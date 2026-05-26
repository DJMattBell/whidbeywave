'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { EVENT_TAGS, categoryColors } from '@/lib/data';
import type { Event, EventTag } from '@/lib/data';
import EventRsvpButton from '@/components/EventRsvpButton';
import ShareButton from '@/components/ShareButton';
import AddToCalendar from '@/components/AddToCalendar';
import TimeWindowFilter, { getTimeWindowDates } from '@/components/TimeWindowFilter';
import type { TimeWindow } from '@/components/TimeWindowFilter';
import { SlidersHorizontal, ChevronRight, Calendar } from 'lucide-react';

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

  const filtered = timeFiltered.filter((e) => {
    if (activeTown !== 'All' && e.town !== activeTown) return false;
    if (activeTags.length > 0 && !activeTags.some((t) => e.tags.includes(t))) return false;
    return true;
  });

  // Sort happening-now events to top within each date group
  const sorted = [...filtered].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const aNow = isHappeningNow(a) ? 0 : 1;
    const bNow = isHappeningNow(b) ? 0 : 1;
    return aNow - bNow;
  });

  // Group by date
  const dateGroups: [string, Event[]][] = [];
  for (const event of sorted) {
    const last = dateGroups[dateGroups.length - 1];
    if (last && last[0] === event.date) {
      last[1].push(event);
    } else {
      dateGroups.push([event.date, [event]]);
    }
  }

  // Date strip: unique dates with event counts
  const eventDates = dateGroups.map(([date, evts]) => ({
    date,
    count: evts.length,
    ...formatStripDate(date),
  }));

  const scrollToDate = useCallback((dateStr: string) => {
    const el = document.getElementById(`date-${dateStr}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  return (
    <div>
      {/* ── Sticky filter bar ──────────────────────── */}
      <div className="sticky top-[64px] z-10 bg-parchment-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 shadow-sm border-b border-parchment-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
            <TimeWindowFilter active={timeWindow} onChange={setTimeWindow} counts={windowCounts} />
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`md:hidden shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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

        {/* Filter panel: always visible on desktop, toggled on mobile */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-3 space-y-3`}>
          {/* Town filter */}
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Town</p>
            <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none sm:flex-wrap">
              {TOWNS.map((town) => {
                const active = town === activeTown;
                return (
                  <button
                    key={town}
                    onClick={() => setActiveTown(town)}
                    className={`inline-flex items-center shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-150 min-h-[44px] ${
                      active
                        ? 'bg-sound-600 text-parchment-50 border-sound-600 shadow-warm scale-105'
                        : 'bg-sound-50 text-sound-700 border-sound-200 hover:bg-sound-100 hover:border-sound-300'
                    }`}
                  >
                    {town}
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
                <strong className="text-stone-800">{filtered.length}</strong> of{' '}
                {events.length} events
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
      </div>

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
      {sorted.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">Nothing matches those filters</h3>
          <p className="empty-state-text">Try fewer filters or a different time window.</p>
          <button onClick={clearAll} className="btn-primary">
            Show everything
          </button>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-6">
          {dateGroups.map(([date, dayEvents]) => (
            <div key={date} id={`date-${date}`}>
              {/* Date heading — sticky on mobile, static on desktop */}
              <h3 className="sticky top-[120px] md:static z-[5] bg-parchment-50 py-2 mb-2 md:mb-4 md:py-0 md:mt-6 border-b border-parchment-200 md:border-0 text-sm md:text-base font-semibold text-stone-500 md:text-stone-700 uppercase tracking-wider font-heading">
                {formatGroupDate(date)}
                <span className="text-stone-400 font-normal ml-2">
                  — {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </span>
              </h3>

              {/* Event cards */}
              <div className="space-y-3 md:space-y-6">
                {dayEvents.map((event) => {
                  const happeningNow = isHappeningNow(event);
                  const free = isFreeEvent(event);

                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="card-pressable group block">
                      {/* ── Mobile compact card ── */}
                      <div className="flex md:hidden items-center gap-3 p-4">
                        <span className="text-2xl shrink-0">{event.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            {happeningNow && <span className="badge-now text-[10px] px-1.5 py-0.5">Now</span>}
                            {free && !happeningNow && <span className="badge-free text-[10px] px-1.5 py-0.5">Free</span>}
                            <span className={`badge text-[10px] px-1.5 py-0.5 ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                              {event.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-stone-900 truncate group-hover:text-forest-600 transition-colors text-base">
                            {event.title}
                          </h3>
                          <p className="text-sm text-stone-600 truncate">
                            {event.time} · {event.town}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-stone-400 shrink-0" />
                      </div>

                      {/* ── Desktop full card ── */}
                      <div className="hidden md:flex">
                        {/* Date block */}
                        <div className={`w-36 ${happeningNow ? 'bg-terra-600' : 'bg-forest-700'} text-parchment-50 flex flex-col items-center justify-center py-6 rounded-l-xl shrink-0`}>
                          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                            {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-5xl font-extrabold leading-none">
                            {new Date(event.date + 'T12:00:00').getDate()}
                          </span>
                          <span className="text-xs opacity-70 mt-1">
                            {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 p-6">
                          <div className="flex flex-wrap items-start gap-2 mb-3">
                            {happeningNow && <span className="badge-now">Happening Now</span>}
                            {free && <span className="badge-free">Free</span>}
                            {event.recurring_event_id && (
                              <span className="badge bg-amber-50 text-amber-700 border border-amber-200">Recurring</span>
                            )}
                            <span className={`badge ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                              {event.category}
                            </span>
                            <span className="badge bg-parchment-200 text-stone-600">{event.town}</span>
                          </div>

                          <h2 className="text-xl font-semibold text-stone-900 mb-2 group-hover:text-forest-600 transition-colors flex items-center gap-2">
                            <span>{event.emoji}</span>
                            <span>{event.title}</span>
                          </h2>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600 mb-3">
                            <span>🕐 {event.time}</span>
                            <span>📍 {event.location}</span>
                          </div>

                          <p className="text-stone-600 leading-relaxed mb-4">{event.description}</p>

                          <AddToCalendar
                            event={{
                              title:       event.title,
                              date:        event.date,
                              time:        event.time,
                              location:    event.location,
                              description: event.description,
                            }}
                          />

                          {/* Tags + actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-parchment-200" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1.5">
                              {event.tags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => { if (!activeTags.includes(tag)) toggleTag(tag); }}
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                                    activeTags.includes(tag)
                                      ? 'bg-forest-600 text-parchment-50'
                                      : 'bg-forest-50 text-forest-700 hover:bg-forest-100 border border-forest-200'
                                  }`}
                                  title={`Filter by ${tag}`}
                                >
                                  <span>{TAG_ICONS[tag]}</span>
                                  <span>{tag}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <ShareButton
                                title={`${event.title} — WhidbeyWave`}
                                text={`${event.emoji} ${event.title} · ${event.time} · ${event.location}`}
                              />
                              <EventRsvpButton eventId={event.id} />
                            </div>
                          </div>
                        </div>
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
