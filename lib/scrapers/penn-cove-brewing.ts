import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// NOTE: www.penncovebrewing.com is currently unreachable (DNS failure).
// This scraper is ready for when the site comes back online.
const PENN_COVE_URL = 'https://www.penncovebrewing.com/events';

/** Parse ISO date from <time datetime="YYYY-MM-DD..."> or text "March 8, 2026" */
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

/** Guess town from location text */
function detectTown(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('oak harbor'))  return 'Oak Harbor';
  if (t.includes('freeland'))    return 'Freeland';
  if (t.includes('coupeville'))  return 'Coupeville';
  return 'Coupeville'; // default
}

export async function scrapePennCoveBrewing(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(PENN_COVE_URL, {
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

      const locationText = $el.find(
        '.eventlist-meta-address, .eventlist-meta-location'
      ).first().text().trim();

      const town = detectTown(locationText || '');

      events.push({
        title,
        date,
        time: time || null,
        location: locationText || 'Penn Cove Brewing',
        town,
        category: 'Music & Performance',
        description: null,
        source: 'Penn Cove Brewing',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapePennCoveBrewing] error:', err);
    return [];
  }
}
