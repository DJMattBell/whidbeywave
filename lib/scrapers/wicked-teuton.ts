import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// Squarespace Fluid Engine site — events are styled blocks, not structured data.
// Best effort: look for headings near italic date/time text.
const WICKED_TEUTON_URL = 'https://www.wickedteuton.com/';

const MONTH_NAMES = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
];

function parseDate(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (s.includes(MONTH_NAMES[i])) {
      const d = new Date(raw.trim());
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, '0');
        const dd   = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }
  return null;
}

export async function scrapeWickedTeuton(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(WICKED_TEUTON_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Squarespace Fluid Engine: look for h4 + nearby <em> with date/time text
    $('h4, h3').each((_, el) => {
      const $el    = $(el);
      const title  = $el.text().trim();
      if (!title || title.length > 80) return;

      // Look for an <em> or <p><em> near this heading that contains a date
      const $parent = $el.parent();
      const italic  = $parent.find('em').first().text().trim();
      if (!italic) return;

      // Try to extract a date from the italic text (e.g. "Mondays\n5:30pm - 7:30pm")
      // Recurring events won't have a specific date — skip them
      const date = parseDate(italic);
      if (!date) return;

      const time = italic.match(/\d{1,2}:\d{2}\s*(?:am|pm)/i)?.[0] ?? null;

      events.push({
        title,
        date,
        time,
        location: 'Wicked Teuton Brewing',
        town:     'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'Wicked Teuton Brewing',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeWickedTeuton] error:', err);
    return [];
  }
}
