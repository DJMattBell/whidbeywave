import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient, isConfigured } from '@/lib/supabase';
import { CATEGORY_EMOJI } from '@/lib/constants';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Event Archive — WhidbeyWave',
  description: 'Browse past events on Whidbey Island by month. A record of community gatherings, markets, concerts, and more.',
};

type ArchivedEvent = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  town: string;
  category: string;
};

async function getPastEvents(): Promise<ArchivedEvent[]> {
  if (!isConfigured) return [];

  const supabase = createServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('event_submissions')
    .select('id, title, date, time, town, category')
    .eq('status', 'approved')
    .lt('date', today)
    .order('date', { ascending: false });

  return (data ?? []) as ArchivedEvent[];
}

function groupByMonth(events: ArchivedEvent[]): [string, ArchivedEvent[]][] {
  const groups = new Map<string, ArchivedEvent[]>();
  for (const event of events) {
    const d = new Date(event.date + 'T12:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const group = groups.get(key) ?? [];
    group.push(event);
    groups.set(key, group);
  }
  return Array.from(groups.entries());
}

function formatMonth(key: string): string {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
}

export default async function EventArchivePage() {
  const events = await getPastEvents();
  const monthGroups = groupByMonth(events);

  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-stone-500 font-medium mb-2 tracking-wide uppercase text-sm">Community History</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-stone-900">Event Archive</h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            {events.length} past events on Whidbey Island, month by month.
          </p>
          <div className="mt-4">
            <Link href="/events" className="text-sm text-forest-600 hover:text-forest-800 transition-colors">
              ← Back to upcoming events
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Month quick-jump */}
        {monthGroups.length > 3 && (
          <nav className="flex flex-wrap gap-2 mb-8" aria-label="Jump to month">
            {monthGroups.map(([key]) => (
              <a
                key={key}
                href={`#month-${key}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-parchment-100 text-stone-600 border border-parchment-200 hover:border-forest-400 hover:text-forest-600 transition-colors"
              >
                {formatMonth(key)}
              </a>
            ))}
          </nav>
        )}

        {/* Month groups */}
        <div className="space-y-10">
          {monthGroups.map(([key, monthEvents]) => (
            <section key={key} id={`month-${key}`}>
              <h2 className="text-xl font-semibold text-stone-800 mb-3 font-heading sticky top-[64px] bg-white py-2 z-[5] border-b border-parchment-200">
                {formatMonth(key)}
                <span className="text-stone-400 font-normal text-sm ml-2">
                  ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="space-y-2">
                {monthEvents.map(event => {
                  const d = new Date(event.date + 'T12:00:00');
                  const emoji = CATEGORY_EMOJI[event.category] ?? '📅';
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-parchment-50 border border-parchment-200 hover:border-forest-300 hover:bg-forest-50/30 transition-colors group"
                    >
                      <div className="shrink-0 w-11 h-11 bg-stone-100 rounded-lg flex flex-col items-center justify-center text-stone-500" aria-hidden="true">
                        <span className="text-[10px] font-semibold uppercase">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-base font-extrabold leading-none">
                          {d.getDate()}
                        </span>
                      </div>
                      <span className="text-lg shrink-0" aria-hidden="true">{emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-700 text-sm truncate group-hover:text-forest-700 transition-colors">
                          {event.title}
                        </p>
                        <p className="text-xs text-stone-500 truncate">
                          {event.time ? `${event.time} · ` : ''}{event.town}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {events.length === 0 && (
          <p className="text-center text-stone-500 py-12">No past events yet.</p>
        )}
      </div>
    </>
  );
}
