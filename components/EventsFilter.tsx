'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EVENT_TAGS, categoryColors } from '@/lib/data';
import type { Event, EventTag } from '@/lib/data';
import EventRsvpButton from '@/components/EventRsvpButton';
import ShareButton from '@/components/ShareButton';
import AddToCalendar from '@/components/AddToCalendar';

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

const MOBILE_TAG_LIMIT = 5;

export default function EventsFilter({ events }: { events: Event[] }) {
  const searchParams = useSearchParams();
  const [activeTags, setActiveTags] = useState<EventTag[]>([]);
  const [activeTown, setActiveTown] = useState('All');
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const town = searchParams.get('town');
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
  }

  const hasFilters = activeTags.length > 0 || activeTown !== 'All';

  const filtered = events.filter((e) => {
    if (activeTown !== 'All' && e.town !== activeTown) return false;
    if (activeTags.length > 0 && !activeTags.some((t) => e.tags.includes(t))) return false;
    return true;
  });

  return (
    <div>
      {/* ── Filter bars — sticky on mobile ──────────────────────── */}
      <div className="mb-8 space-y-5 sticky top-[104px] z-10 bg-parchment-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 -mt-4 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            Looking for something specific?
          </p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-medium bg-stone-100 text-stone-600 border border-stone-300 rounded-full px-3 py-1 hover:bg-stone-200 transition-colors"
            >
              Show everything
            </button>
          )}
        </div>

        {/* Town filter — scrollable on mobile */}
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Town</p>
          <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-none sm:flex-wrap">
            {TOWNS.map((town) => {
              const active = town === activeTown;
              return (
                <button
                  key={town}
                  onClick={() => setActiveTown(town)}
                  className={`inline-flex items-center shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
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

        {/* Tag filter — collapsed on mobile */}
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TAGS.map((tag, i) => {
              const active = activeTags.includes(tag);
              const hiddenOnMobile = !showAllTags && i >= MOBILE_TAG_LIMIT;
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                    active
                      ? 'bg-forest-500 text-parchment-50 border-forest-500 shadow-warm scale-105'
                      : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50'
                  } ${hiddenOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'}`}
                >
                  <span>{TAG_ICONS[tag]}</span>
                  <span>{tag}</span>
                </button>
              );
            })}
            {EVENT_TAGS.length > MOBILE_TAG_LIMIT && (
              <button
                onClick={() => setShowAllTags(v => !v)}
                className="inline-flex sm:hidden items-center px-4 py-2 rounded-full text-sm font-medium border border-parchment-300 bg-parchment-100 text-stone-500 hover:bg-parchment-200 transition-colors"
              >
                {showAllTags ? 'Show less' : `+${EVENT_TAGS.length - MOBILE_TAG_LIMIT} more`}
              </button>
            )}
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
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
          <div className="text-5xl mb-4">🌧️</div>
          <p className="text-lg font-semibold text-stone-700 mb-1"
             style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Quiet day for those filters
          </p>
          <p className="text-stone-600 text-sm mb-5">Try fewer filters — or check back soon.</p>
          <button onClick={clearAll} className="btn-primary">
            Show everything
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="card flex flex-col md:flex-row group block">
              {/* Date block */}
              <div className="md:w-36 bg-gradient-to-br from-forest-600 to-sound-600 text-parchment-100 flex flex-col items-center justify-center py-6 md:py-0 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none shrink-0">
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
              <div className="flex-1 p-6">
                <div className="flex flex-wrap items-start gap-2 mb-3">
                  <span className={`badge ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                    {event.category}
                  </span>
                  <span className="badge bg-parchment-200 text-stone-600">{event.town}</span>
                </div>

                <h2 className="text-xl text-stone-900 mb-2 group-hover:text-forest-600 transition-colors flex items-center gap-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
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

                {/* Tags + RSVP + Share */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-parchment-200" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { if (!activeTags.includes(tag)) toggleTag(tag); }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          activeTags.includes(tag)
                            ? 'bg-forest-500 text-parchment-50'
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
          ))}
        </div>
      )}
    </div>
  );
}
