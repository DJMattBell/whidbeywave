import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const SW_PARKS_URL = 'https://www.swhidbeyparks.org/events/';

/** Parse "March 8, 2026" or "March 8" → "2026-03-08" */
function parseDate(raw: string): string | null {
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function cleanTime(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, ' ');
  return t.length > 1 ? t : null;
}

export async function scrapeSWParks(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(SW_PARKS_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // WordPress Events Calendar plugin (same as WICA)
    $('article.type-tribe_events, .tribe-event, .tribe-events-calendar-list__event-row').each((_, el) => {
      const $el = $(el);

      const title = $el.find(
        '.tribe-event-url, .tribe-events-list-event-title a, ' +
        '.tribe-events-calendar-list__event-title-link, h2.tribe-events-list-event-title'
      ).first().text().trim();
      if (!title) return;

      const rawDate = $el.find(
        'abbr.tribe-events-abbr, ' +
        '.tribe-events-schedule abbr, ' +
        '.tribe-event-date-start, ' +
        '.tribe-events-calendar-list__event-datetime-wrapper time'
      ).first().attr('title') ??
      $el.find(
        '.tribe-events-schedule, .tribe-events-calendar-list__event-datetime-wrapper'
      ).first().text();

      const date = parseDate(rawDate ?? '');
      if (!date) return;

      const time = cleanTime(
        $el.find(
          '.tribe-events-schedule__time, .tribe-events-calendar-list__event-datetime-wrapper'
        ).first().text()
      );

      const location = $el.find(
        '.tribe-venue, .tribe-events-calendar-list__event-venue'
      ).first().text().trim() || null;

      const description = $el.find(
        '.tribe-events-list-event-description p, ' +
        '.tribe-events-calendar-list__event-description'
      ).first().text().trim() || null;

      events.push({
        title,
        date,
        time,
        location,
        town:     'Langley',
        category: 'Outdoors & Recreation',
        description: description ? description.slice(0, 1000) : null,
        source: 'SW Parks & Rec',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeSWParks] error:', err);
    return [];
  }
}
