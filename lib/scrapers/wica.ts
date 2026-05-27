import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';

const WICA_URLS = [
  'https://www.wicaonline.org/events-calendar?format=json',
  'https://www.wicaonline.org/calendar?format=json',
];

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}


/** Convert ms timestamp to HH:MM AM/PM in Pacific time */
function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/** Build location string from Squarespace location object */
function extractLocation(loc: Record<string, unknown> | null | undefined): string | null {
  if (!loc) return null;
  const parts: string[] = [];
  if (loc.addressLine1) parts.push(String(loc.addressLine1));
  if (loc.addressLine2) parts.push(String(loc.addressLine2));
  if (loc.addressCity) parts.push(String(loc.addressCity));
  const result = parts.join(', ').trim();
  return result || null;
}

/** Fetch a single Squarespace JSON endpoint and return raw event items */
async function fetchSquarespaceEvents(url: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
  });
  if (!res.ok) return [];

  const json = await res.json() as Record<string, unknown>;

  // Try "upcoming" first, fall back to "items"
  const upcoming = json.upcoming;
  if (Array.isArray(upcoming) && upcoming.length > 0) return upcoming;

  const items = json.items;
  if (Array.isArray(items) && items.length > 0) return items;

  return [];
}

export async function scrapeWica(): Promise<ScrapedEvent[]> {
  try {
    let rawEvents: Record<string, unknown>[] = [];

    for (const url of WICA_URLS) {
      rawEvents = await fetchSquarespaceEvents(url);
      if (rawEvents.length > 0) break;
    }

    if (rawEvents.length === 0) return [];

    const events: ScrapedEvent[] = [];

    for (const item of rawEvents) {
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      if (!title) continue;

      const startDate = typeof item.startDate === 'number' ? item.startDate : null;
      if (!startDate) continue;

      const date = toPacificDateString(startDate);
      const time = formatTime(startDate);

      const location = extractLocation(
        item.location as Record<string, unknown> | null | undefined
      );

      // Prefer excerpt, fall back to body, strip HTML from either
      let description: string | null = null;
      if (typeof item.excerpt === 'string' && item.excerpt.trim()) {
        description = stripHtml(item.excerpt);
      } else if (typeof item.body === 'string' && item.body.trim()) {
        description = stripHtml(item.body);
      }
      if (description) {
        description = description.slice(0, 1000) || null;
      }

      events.push({
        title,
        date,
        time,
        location,
        town: 'Langley',
        category: 'Arts & Culture',
        description,
        source: 'WICA',
      });
    }

    return events;
  } catch (err) {
    console.error('[scrapeWica] error:', err);
    return [];
  }
}
