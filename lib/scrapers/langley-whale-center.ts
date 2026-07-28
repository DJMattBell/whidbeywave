import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';

// Orca Network / Langley Whale Center events — WordPress REST API (The Events Calendar)
const EVENTS_API_URL = 'https://www.orcanetwork.org/wp-json/tribe/events/v1/events';

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** Convert an ISO date string to HH:MM AM/PM in Pacific time */
function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export async function scrapeLangleyWhaleCenter(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(EVENTS_API_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const items: unknown[] = Array.isArray(data?.events) ? data.events : [];

    const events: ScrapedEvent[] = [];

    for (const item of items) {
      const evt = item as Record<string, unknown>;

      const title = typeof evt.title === 'string' ? evt.title.trim() : '';
      if (!title) continue;

      // The Events Calendar uses ISO date strings
      const startDate = typeof evt.start_date === 'string' ? evt.start_date : null;
      if (!startDate) continue;

      const date = toPacificDateString(new Date(startDate));
      const time = formatTime(startDate);

      // Build description from excerpt or description
      let description: string | null = null;
      if (typeof evt.excerpt === 'string' && evt.excerpt.trim()) {
        description = stripHtml(evt.excerpt).slice(0, 1000) || null;
      } else if (typeof evt.description === 'string' && evt.description.trim()) {
        description = stripHtml(evt.description).slice(0, 1000) || null;
      }

      // Extract venue/location
      let location: string | null = 'Langley Whale Center';
      const venue = evt.venue as Record<string, unknown> | null | undefined;
      if (venue && typeof venue.venue === 'string' && venue.venue) {
        location = venue.venue;
      }

      events.push({
        title: stripHtml(title),
        date,
        time,
        location,
        town: 'Langley',
        category: 'Nature & Wildlife',
        description,
        source: 'Langley Whale Center',
      });
    }

    return events;
  } catch (err) {
    console.error('[scrapeLangleyWhaleCenter] error:', err);
    return [];
  }
}
