import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const BARRINGTONS_URL = 'https://barringtonsirishbar.com/events-2/';

/** Parse "March 8, 2026" or ISO "2026-03-08" → "2026-03-08" */
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

export async function scrapeBarringtons(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(BARRINGTONS_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Strategy 1: JSON-LD structured data (Schema.org Event)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() ?? '');
        const items: any[] = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item['@type'] !== 'Event') continue;
          const title = item.name?.trim();
          if (!title) continue;
          const date = parseDate(item.startDate ?? '');
          if (!date) continue;
          const timeRaw: string = item.startDate ?? '';
          const timePart = timeRaw.includes('T')
            ? new Date(timeRaw).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : null;
          events.push({
            title,
            date,
            time: timePart,
            location: "Barrington's Irish Bar & Grill",
            town:     'Oak Harbor',
            category: 'Music & Performance',
            description: item.description?.slice(0, 1000) ?? null,
            source: 'Barringtons Irish Bar',
          });
        }
      } catch {
        // malformed JSON-LD — skip
      }
    });

    if (events.length > 0) return events;

    // Strategy 2: WordPress Events Calendar fallback
    $('article.type-tribe_events, .tribe-event, .tribe-events-calendar-list__event-row').each((_, el) => {
      const $el = $(el);
      const title = $el.find(
        '.tribe-event-url, .tribe-events-list-event-title a, ' +
        '.tribe-events-calendar-list__event-title-link'
      ).first().text().trim();
      if (!title) return;

      const rawDate = $el.find(
        'abbr.tribe-events-abbr, .tribe-events-schedule abbr, .tribe-event-date-start'
      ).first().attr('title') ??
      $el.find('.tribe-events-schedule').first().text();

      const date = parseDate(rawDate ?? '');
      if (!date) return;

      events.push({
        title,
        date,
        time: $el.find('.tribe-events-schedule__time').first().text().trim() || null,
        location: "Barrington's Irish Bar & Grill",
        town:     'Oak Harbor',
        category: 'Music & Performance',
        description: null,
        source: 'Barringtons Irish Bar',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeBarringtons] error:', err);
    return [];
  }
}
