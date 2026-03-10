import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// Wix site — events are almost always rendered client-side via JS.
// This scraper attempts best-effort static extraction and returns []
// silently if the page is not server-side renderable.
const DANCING_FISH_URL = 'https://www.dancingfishvineyards.com/calendar-of-events';

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

export async function scrapeDancingFish(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(DANCING_FISH_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Attempt 1: Wix events widget elements
    $('[data-testid*="event"], [class*="EventListItem"], [class*="event-list-item"]').each((_, el) => {
      const $el  = $(el);
      const title = $el.find('[class*="title"], h2, h3').first().text().trim();
      if (!title) return;
      const rawDate = $el.find('time[datetime]').first().attr('datetime') ??
                      $el.find('[class*="date"]').first().text();
      const date = parseDate(rawDate ?? '');
      if (!date) return;
      events.push({
        title,
        date,
        time: $el.find('[class*="time"]').first().text().trim() || null,
        location: 'Dancing Fish Vineyards',
        town:     'Freeland',
        category: 'Music & Performance',
        description: null,
        source: 'Dancing Fish Vineyards',
      });
    });

    if (events.length > 0) return events;

    // Attempt 2: <time> elements anywhere on page
    $('time[datetime]').each((_, el) => {
      const rawDate = $(el).attr('datetime') ?? '';
      const date    = parseDate(rawDate);
      if (!date) return;
      const title = $(el).closest('article, li, div').find('h2, h3, h4').first().text().trim();
      if (!title) return;
      events.push({
        title,
        date,
        time: $(el).text().trim() || null,
        location: 'Dancing Fish Vineyards',
        town:     'Freeland',
        category: 'Music & Performance',
        description: null,
        source: 'Dancing Fish Vineyards',
      });
    });

    return events;
  } catch (err) {
    // Wix sites commonly fail to render server-side — silent return
    console.error('[scrapeDancingFish] error:', err);
    return [];
  }
}
