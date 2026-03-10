import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const WHIDBEY_TEL_URL = 'https://www.whidbeytel.com/events/';

function parseDate(raw: string): string | null {
  const iso = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/music|concert|band|live/.test(t))  return 'Music & Performance';
  if (/market|bazaar/.test(t))            return 'Farmers Market';
  if (/parade|festival|fair/.test(t))     return 'Arts & Culture';
  return 'Community & Social';
}

function cleanTime(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, ' ');
  return t.length > 1 ? t : null;
}

export async function scrapeWhidbeyTelecomEvents(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(WHIDBEY_TEL_URL, {
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
        town:     'Whidbey Island',
        category: guessCategory(title),
        description: null,
        source: 'Whidbey Telecom Events',
      });
    });

    if (events.length > 0) return events;

    // Strategy 2: Generic WordPress event items
    $('.event-item, .wp-block-group').each((_, el) => {
      const $el   = $(el);
      const title = $el.find('h2 a, h3 a, h4 a').first().text().trim();
      if (!title) return;

      const rawDate = $el.find('time[datetime]').first().attr('datetime') ??
                      $el.find('.tribe-event-date-start').first().text();
      const date = parseDate(rawDate ?? '');
      if (!date) return;

      events.push({
        title,
        date,
        time: $el.find('time').first().text().trim() || null,
        location: null,
        town:     'Whidbey Island',
        category: guessCategory(title),
        description: null,
        source: 'Whidbey Telecom Events',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeWhidbeyTelecomEvents] error:', err);
    return [];
  }
}
