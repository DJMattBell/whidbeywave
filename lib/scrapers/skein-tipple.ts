import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// Wix site — events rendered client-side. Best-effort static parse; returns [] if nothing found.
const SKEIN_TIPPLE_URL = 'https://skeinandtipple.com/';

function parseDate(raw: string): string | null {
  const iso = raw.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function scrapeSkeinTipple(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(SKEIN_TIPPLE_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Attempt 1: Wix events widget
    $('[data-testid*="event"], [class*="EventListItem"], [class*="event-list-item"]').each((_, el) => {
      const $el   = $(el);
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
        location: 'Skein & Tipple, Clinton',
        town:     'Clinton',
        category: 'Music & Performance',
        description: null,
        source: 'Skein & Tipple',
      });
    });

    if (events.length > 0) return events;

    // Attempt 2: JSON in <script> tags containing startDate
    $('script').each((_, el) => {
      const src = $(el).html() ?? '';
      if (!src.includes('startDate')) return;
      try {
        // Extract embedded JSON objects/arrays
        const matches = src.match(/\{[^{}]*"startDate"[^{}]*\}/g) ?? [];
        for (const m of matches) {
          const obj = JSON.parse(m);
          const date = parseDate(obj.startDate ?? '');
          const title = (obj.eventName ?? obj.name ?? '').trim();
          if (!date || !title) continue;
          events.push({
            title,
            date,
            time: null,
            location: 'Skein & Tipple, Clinton',
            town:     'Clinton',
            category: 'Music & Performance',
            description: null,
            source: 'Skein & Tipple',
          });
        }
      } catch {
        // malformed — skip
      }
    });

    return events;
  } catch (err) {
    console.error('[scrapeSkeinTipple] error:', err);
    return [];
  }
}
