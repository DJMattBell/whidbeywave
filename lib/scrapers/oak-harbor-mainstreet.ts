import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const MAINSTREET_URL = 'https://www.oakharbormainstreet.org/events/';

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

export async function scrapeOakHarborMainStreet(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(MAINSTREET_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Strategy 1: WordPress Events Calendar plugin
    $('article.type-tribe_events, .tribe-event, .tribe-events-calendar-list__event-row').each((_, el) => {
      const $el = $(el);
      const title = $el.find(
        '.tribe-event-url, .tribe-events-list-event-title a, ' +
        '.tribe-events-calendar-list__event-title-link'
      ).first().text().trim();
      if (!title) return;

      const rawDate = $el.find(
        'abbr.tribe-events-abbr, .tribe-events-schedule abbr, ' +
        '.tribe-event-date-start, .tribe-events-calendar-list__event-datetime-wrapper time'
      ).first().attr('title') ??
      $el.find('.tribe-events-schedule, .tribe-events-calendar-list__event-datetime-wrapper').first().text();

      const date = parseDate(rawDate ?? '');
      if (!date) return;

      events.push({
        title,
        date,
        time: cleanTime($el.find('.tribe-events-schedule__time, .tribe-events-calendar-list__event-datetime-wrapper').first().text()),
        location: null,
        town:     'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'Oak Harbor Main Street',
      });
    });

    if (events.length > 0) return events;

    // Strategy 2: Standard WordPress post list fallback
    $('article.type-post, .entry-title').each((_, el) => {
      const $el   = $(el);
      const title = $el.find('.entry-title a, h2 a, h1 a').first().text().trim() ||
                    (el.tagName === 'h2' || el.tagName === 'h1' ? $el.find('a').first().text().trim() : '');
      if (!title) return;

      const rawDate = $el.find('time[datetime]').first().attr('datetime') ??
                      $el.find('.entry-date').first().text();
      const date = parseDate(rawDate ?? '');
      if (!date) return;

      events.push({
        title,
        date,
        time: null,
        location: null,
        town:     'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'Oak Harbor Main Street',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeOakHarborMainStreet] error:', err);
    return [];
  }
}
