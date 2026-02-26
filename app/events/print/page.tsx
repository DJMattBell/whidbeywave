import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { events as fallbackEvents } from '@/lib/data';
import PrintTrigger from './PrintTrigger';

export const revalidate = 1800; // 30 minutes

const CATEGORY_EMOJI: Record<string, string> = {
  'Nature & Wildlife':     '🌿',
  'Arts & Culture':        '🎨',
  'Farmers Market':        '🥕',
  'Music & Performance':   '🎵',
  'Outdoors & Recreation': '🌲',
  'Film & Media':          '🎬',
  'Community & Social':    '🤝',
  'Classes & Workshops':   '📚',
  'Food & Drink':          '🍽️',
  'Sports & Fitness':      '🏃',
};

function fmtDayHeading(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase();
}

function fmtRangeDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

type PrintEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  town?: string;
  category: string;
  description?: string;
  emoji?: string;
};

async function getEvents(): Promise<PrintEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const today = new Date();
  const todayStr  = today.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const cutoff    = new Date(today);
  cutoff.setDate(cutoff.getDate() + 14);
  const cutoffStr = cutoff.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

  if (!url || !key || url.includes('placeholder')) {
    return fallbackEvents
      .filter(e => e.date >= todayStr && e.date <= cutoffStr)
      .map(e => ({ ...e, location: e.location ?? '' }));
  }

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('event_submissions')
    .select('id, title, date, time, location, town, category, description')
    .eq('status', 'approved')
    .gte('date', todayStr)
    .lte('date', cutoffStr)
    .order('date', { ascending: true });

  if (!data || data.length === 0) {
    return fallbackEvents
      .filter(e => e.date >= todayStr && e.date <= cutoffStr)
      .map(e => ({ ...e, location: e.location ?? '' }));
  }

  return data.map((row: any): PrintEvent => ({
    id:          row.id,
    title:       row.title,
    date:        row.date,
    time:        row.time,
    location:    row.location ?? '',
    town:        row.town ?? '',
    category:    row.category,
    description: row.description ?? '',
    emoji:       CATEGORY_EMOJI[row.category] ?? '📅',
  }));
}

export default async function PrintPage() {
  const events = await getEvents();

  const today  = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 14);

  // Group by date
  const byDate = events.reduce<Record<string, PrintEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  return (
    <>
      <PrintTrigger />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; font-family: Georgia, serif; }
          .print-event { page-break-inside: avoid; }
          a { text-decoration: none; color: black; }
          @page { margin: 2cm; }
        }
        @media screen {
          body { background: #fdfaf3; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-6 py-10 font-serif">

        {/* Back link — screen only */}
        <Link
          href="/events"
          className="no-print inline-block mb-8 text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors"
        >
          ← Back to Calendar
        </Link>

        {/* Header */}
        <div className="mb-8 border-b-2 border-stone-800 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl no-print">🌊</span>
            <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              WhidbeyWave
            </span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mt-2 mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Whidbey Island Events
          </h1>
          <p className="text-stone-600 text-sm">
            Events: {fmtRangeDate(today)} – {fmtRangeDate(cutoff)}
          </p>
          <p className="text-stone-400 text-xs mt-0.5">Printed from WhidbeyWave.com</p>
        </div>

        {/* Event list */}
        {sortedDates.length === 0 ? (
          <p className="text-stone-500 text-center py-12">No events in the next 14 days.</p>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                {/* Date heading */}
                <h2 className="text-xs font-bold tracking-widest text-stone-500 uppercase mb-2 pb-1 border-b border-stone-300">
                  {fmtDayHeading(date)}
                </h2>

                <div className="space-y-4">
                  {byDate[date].map(event => (
                    <div key={event.id} className="print-event pl-3 border-l-2 border-forest-400">
                      <p className="font-bold text-stone-900 text-base leading-snug">
                        {event.title}
                      </p>
                      <p className="text-stone-600 text-sm mt-0.5">
                        {event.time}
                        {(event.location || event.town) && (
                          <> · {[event.location, event.town].filter(Boolean).join(', ')}</>
                        )}
                      </p>
                      {event.description && (
                        <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                          {event.description.length > 100
                            ? event.description.slice(0, 100).trimEnd() + '…'
                            : event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-stone-300 text-xs text-stone-400 text-center">
          WhidbeyWave.com · Community events for Whidbey Island, WA
        </div>

      </div>
    </>
  );
}
