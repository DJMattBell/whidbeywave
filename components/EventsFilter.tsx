'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EVENT_TAGS, categoryColors } from '@/lib/data';
import type { Event, EventTag } from '@/lib/data';
import EventRsvpButton from '@/components/EventRsvpButton';
import ShareButton from '@/components/ShareButton';
import AddToCalendar from '@/components/AddToCalendar';
import TimeWindowFilter, { getTimeWindowDates } from '@/components/TimeWindowFilter';
import type { TimeWindow } from '@/components/TimeWindowFilter';

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
  // Simple heuristic: if the event has a time and it includes a start time before now
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
  // Consider it "happening now" if it started within the last 4 hours
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

export default function EventsFilter({ events }: { events: Event[] }) {
  const searchParams = useSearchParams();
  const [activeTags, setActiveTags] = useState<EventTag[]>([]);
  const [activeTown, setActiveTown] = useState('All');

  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');

  useEffect(() => {
    const town = searchParams.get('town');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (town) setActiveTown(town);
  }, [searchParams]);

  function toggleTag(tag: EventTag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearAll() {
    setActiveTags([]);
    setActiveTown('All');
    setTimeWindow('all');
  }

  const hasFilters = activeTags.length > 0 || activeTown !== 'All' || timeWindow !== 'all';

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

  // Sort happening-now events to top (#6)
  const sorted = [...filtered].sort((a, b) => {
    const aNow = isHappeningNow(a) ? 0 : 1;
    const bNow = isHappeningNow(b) ? 0 : 1;
    return aNow - bNow;
  });

  return (
    <div>
      {/* ── Filter section ──────────────────────── */}
      <div className="mb-8 space-y-4 sticky top-[104px] z-10 bg-parchment-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 -mt-4 shadow-sm">
        {/* #7 Time window filter — mobile first */}
        <TimeWindowFilter active={timeWindow} onChange={setTimeWindow} counts={windowCounts} />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            Filter
          </p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-medium bg-stone-100 text-stone-600 border border-stone-300 rounded-full px-3 py-1.5 hover:bg-stone-200 transition-colors min-h-[36px]"
            >
              Clear all
            </button>
          )}
        </div>

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

        {/* Tag filter — #9 increased touch targets */}
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

        {hasFilters && (
          <p className="text-sm text-stone-500" aria-live="polite">
            Found{' '}
            <strong className="text-stone-800">{filtered.length}</strong> of{' '}
            {events.length} events
            {activeTown !== 'All' && (
              <span className="text-sound-600 font-medium"> · in {activeTown}</span>
            )}
            {activeTags.length > 0 && (
              <span className="text-forest-600 font-medium">
                {' '}· {activeTags.join(' or ')}
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Event cards ─────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon text-5xl">🌧️</div>
          <p className="empty-state-title">Quiet day for those filters</p>
          <p className="empty-state-text">Try fewer filters — or check back soon.</p>
          <button onClick={clearAll} className="btn-primary">
            Show everything
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {sorted.map((event) => {
            const happeningNow = isHappeningNow(event);
            const free = isFreeEvent(event);

            return (
              <Link key={event.id} href={`/events/${event.id}`} className="card-pressable flex flex-col md:flex-row group block hover:shadow-warm-md hover:-translate-y-0.5 transition-all duration-200">
                {/* Date block */}
                <div className={`md:w-36 ${happeningNow ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-forest-600 to-sound-600'} text-parchment-100 flex flex-col items-center justify-center py-6 md:py-0 rounded-t-xl md:rounded-l-xl md:rounded-tr-none shrink-0`}>
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
                    {/* #6 Happening Now badge */}
                    {happeningNow && <span className="badge-now">Happening Now</span>}
                    {/* #8 Free badge */}
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

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-stone-600 mb-3">
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

                  {/* Tags + actions — #9 increased tag size */}
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
