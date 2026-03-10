import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// BiblioCommons page for Coupeville branch
const URL = 'https://sno-isle.bibliocommons.com/v2/events?location=coupeville';

/**
 * Parse BiblioCommons date-time text like:
 *   "Tuesday, March 10, 2026, 9:00am–9:45am"
 * Returns { date: "2026-03-10", time: "9:00am–9:45am" }
 */
function parseBiblioDateTime(raw: string): { date: string | null; time: string | null } {
  const cleaned = raw.replace(/\s+/g, ' ').trim();

  const m = cleaned.match(
    /(?:[A-Za-z]+,\s*)?([A-Za-z]+ \d{1,2},?\s*\d{4}),?\s*([\d:apm–\-]+.*)?$/i
  );
  if (!m) return { date: null, time: null };

  const d = new Date(m[1].trim());
  if (isNaN(d.getTime())) return { date: null, time: null };

  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');

  const time = m[2] ? m[2].trim() : null;
  return { date: `${yyyy}-${mm}-${dd}`, time };
}

export async function scrapeCoupevilleLibrary(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    $('li').each((_, el) => {
      const $el = $(el);

      const title = $el.find('h3 a, h2 a').first().text().trim();
      if (!title) return;

      // Skip events not at Coupeville
      const locationText = $el.find('a[href*="/locations/"]').text().toLowerCase();
      if (locationText && !locationText.includes('coupeville')) return;

      const rawDateTime = $el
        .find('p, span, time')
        .map((_, el2) => $(el2).text())
        .get()
        .find(t => /\d{4}/.test(t) && /[apm]/i.test(t)) ?? '';

      const { date, time } = parseBiblioDateTime(rawDateTime);
      if (!date) return;

      events.push({
        title,
        date,
        time,
        location: 'Coupeville Library',
        town:     'Coupeville',
        category: 'Classes & Workshops',
        description: null,
        source: 'Coupeville Library',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeCoupevilleLibrary] error:', err);
    return [];
  }
}
