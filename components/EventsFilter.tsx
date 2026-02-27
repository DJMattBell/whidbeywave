'use client';

import { useState } from 'react';
import { EVENT_TAGS, categoryColors } from '@/lib/data';
import type { Event, EventTag } from '@/lib/data';
import EventRsvpButton from '@/components/EventRsvpButton';
import ShareButton from '@/components/ShareButton';
import AddToCalendar from '@/components/AddToCalendar';

const TAG_ICONS: Record<EventTag, string> = {
  'Kids Event':   '🧒',
  'Family Event': '👨‍👩‍👧',
  'Adult Event':  '🍷',
  'Live Music':   '🎵',
  'Festival':     '🎉',
  'Karaoke':      '🎤',
  'Class':        '📚',
  'Visual Art':   '🎨',
  'Just Fun':     '😄',
  'Market':       '🛒',
};

export default function EventsFilter({ events }: { events: Event[] }) {
  const [activeTags, setActiveTags] = useState<EventTag[]>([]);

  function toggleTag(tag: EventTag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearAll() {
    setActiveTags([]);
  }

  const filtered =
    activeTags.length === 0
      ? events
      : events.filter((e) => activeTags.some((t) => e.tags.includes(t)));

  return (
    <div>
      {/* ── Tag filter bar ──────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            Looking for something specific?
          </p>
          {activeTags.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-forest-600 hover:text-forest-800 font-medium underline underline-offset-2"
            >
              Show everything ({activeTags.length} filter{activeTags.length > 1 ? 's' : ''} active)
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {EVENT_TAGS.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                  active
                    ? 'bg-forest-500 text-parchment-50 border-forest-500 shadow-warm scale-105'
                    : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600 hover:bg-forest-50'
                }`}
              >
                <span>{TAG_ICONS[tag]}</span>
                <span>{tag}</span>
              </button>
            );
          })}
        </div>

        {activeTags.length > 0 && (
          <p className="mt-3 text-sm text-stone-500" aria-live="polite">
            Found{' '}
            <strong className="text-stone-800">{filtered.length}</strong> of{' '}
            {events.length} events &nbsp;·&nbsp; matching{' '}
            <span className="text-forest-600 font-medium">
              {activeTags.join(' or ')}
            </span>
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
            <article key={event.id} className="card flex flex-col md:flex-row group">
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
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-parchment-200">
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
