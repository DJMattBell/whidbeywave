import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// NOTE: The correct domain is dblfbrewing.com — no events listed on the website.
// This scraper checks the homepage for any event sections and returns [] if none found.
const DOUBLE_BLUFF_URL = 'https://www.dblfbrewing.com/';

function parseDate(raw: string): string | null {
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function scrapeDoubleBluff(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(DOUBLE_BLUFF_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Look for any section/div labelled as events or live music
    $('h2, h3, h4').each((_, el) => {
      const heading = $(el).text().toLowerCase();
      if (!heading.includes('event') && !heading.includes('live music') && !heading.includes('happening')) return;

      // Gather sibling content for date + title pairs
      $(el).nextAll('p, li, div').slice(0, 10).each((_, sibling) => {
        const text  = $(sibling).text().trim();
        const title = text.split('\n')[0]?.trim();
        if (!title || title.length < 4 || title.length > 120) return;

        // Only include if a date-like string is present nearby
        const date = parseDate(text);
        if (!date) return;

        events.push({
          title,
          date,
          time: null,
          location: 'Double Bluff Brewing',
          town:     'Langley',
          category: 'Music & Performance',
          description: null,
          source: 'Double Bluff Brewing',
        });
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeDoubleBluff] error:', err);
    return [];
  }
}
