import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// Orca Network / Langley Whale Center events — Squarespace site
const WHALE_CENTER_URL = 'https://www.orcanetwork.org/events';

/** Parse ISO date from datetime attr or text like "April 11, 2026" */
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

export async function scrapeLangleyWhaleCenter(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(WHALE_CENTER_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Squarespace event list selectors
    $('.eventlist-event, .eventlist--upcoming .eventlist-event').each((_, el) => {
      const $el = $(el);

      const title = $el.find(
        '.eventlist-title a, .eventlist-title'
      ).first().text().trim();
      if (!title) return;

      const rawDate =
        $el.find('time.dt-start, time[datetime]').first().attr('datetime') ??
        $el.find('.event-date, .eventlist-meta-date').first().text();

      const date = parseDate(rawDate ?? '');
      if (!date) return;

      const time = $el.find(
        '.event-time-12hr, .eventlist-meta-time'
      ).first().text().trim() || null;

      const description = $el.find(
        '.eventlist-description p, .eventlist-excerpt p'
      ).first().text().trim() || null;

      events.push({
        title,
        date,
        time: time || null,
        location: 'Langley Whale Center',
        town:     'Langley',
        category: 'Nature & Wildlife',
        description: description ? description.slice(0, 1000) : null,
        source: 'Langley Whale Center',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeLangleyWhaleCenter] error:', err);
    return [];
  }
}
