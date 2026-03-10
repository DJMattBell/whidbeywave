import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const CHAMBER_URL = 'https://business.oakharborchamber.com/events/';

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
  if (/music|concert|band|live/.test(t))         return 'Music & Performance';
  if (/market|bazaar|craft fair/.test(t))        return 'Farmers Market';
  if (/parade|festival|fair/.test(t))            return 'Arts & Culture';
  return 'Community & Social';
}

export async function scrapeOakHarborChamber(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(CHAMBER_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // GrowthZone CMS selectors
    $('.lm-event-item, .lm-events-list li, .event-listing-item').each((_, el) => {
      const $el = $(el);

      const title = $el.find(
        '.lm-event-title a, .event-listing-title a, h2 a, h3 a'
      ).first().text().trim();
      if (!title) return;

      const rawDate =
        $el.find('time[datetime]').first().attr('datetime') ??
        $el.find('.lm-event-date, .event-date').first().text();

      const date = parseDate(rawDate ?? '');
      if (!date) return;

      const time = $el.find('.lm-event-time, .event-time').first().text().trim() || null;

      events.push({
        title,
        date,
        time: time || null,
        location: null,
        town:     'Oak Harbor',
        category: guessCategory(title),
        description: null,
        source: 'Oak Harbor Chamber',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeOakHarborChamber] error:', err);
    return [];
  }
}
