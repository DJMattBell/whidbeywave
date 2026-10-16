import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';

const BARRINGTONS_URL = 'https://barringtonsirishbar.com/events-2/';

const MONTH_NAMES = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
];

/**
 * Parse informal date strings like "Saturday, October 17th, 8 to 9 pm"
 * or "Monday, November 2nd, 6-8pm" or "October 2nd and 3rd".
 * Returns the date portion as YYYY-MM-DD (start date for ranges).
 */
function parseEventDate(raw: string): { date: string; time: string | null } | null {
  const s = raw.trim();

  // Try to find "Month Day" pattern (with optional ordinal suffix)
  const monthDayMatch = s.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i
  );
  if (!monthDayMatch) return null;

  const monthStr = monthDayMatch[1];
  const dayStr = monthDayMatch[2];

  // Look for explicit year
  const yearMatch = s.match(/\b(20\d{2})\b/);
  let year: number;
  if (yearMatch) {
    year = parseInt(yearMatch[1]);
  } else {
    // Assume current or next occurrence
    const now = new Date();
    const monthIdx = MONTH_NAMES.indexOf(monthStr.toLowerCase());
    const candidate = new Date(now.getFullYear(), monthIdx, parseInt(dayStr));
    // If more than 2 months in the past, assume next year
    if (candidate.getTime() < now.getTime() - 60 * 86400000) {
      year = now.getFullYear() + 1;
    } else {
      year = now.getFullYear();
    }
  }

  const d = new Date(`${monthStr} ${dayStr}, ${year}`);
  if (isNaN(d.getTime())) return null;
  const date = toPacificDateString(d);

  // Extract time — look for patterns like "8 to 9 pm", "6-8pm", "5:30 pm – 7:30 pm", "(6:00 PM)"
  let time: string | null = null;
  const timeMatch = s.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|–|—)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
  );
  if (timeMatch) {
    time = `${timeMatch[1].trim()} - ${timeMatch[2].trim()}`;
  } else {
    // Single time: "(6:00 PM)" or standalone "7:30pm"
    const singleTime = s.match(/(\d{1,2}:\d{2}\s*(?:am|pm))/i);
    if (singleTime) time = singleTime[1].trim();
  }

  return { date, time };
}

/** Strip emoji and excess whitespace from a title */
function cleanTitle(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function scrapeBarringtons(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(BARRINGTONS_URL, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    // Barringtons uses WordPress Gutenberg blocks — events are h2 headings
    // with <br> separating the title from the date/time line.
    // Example: "LIVE MUSIC! Shannon Patiño...<br>Saturday, October 17th, 8 to 9 pm"
    $('.entry-content h2').each((_, el) => {
      const $el = $(el);
      const rawHtml = $el.html() ?? '';
      const fullText = $el.text().trim();

      if (!rawHtml.includes('<br') && !fullText.includes('\n')) return;

      // Split on <br> tags to separate title from date line
      const parts = rawHtml.split(/<br\s*\/?>/i).map(p =>
        cheerio.load(p).text().trim()
      ).filter(Boolean);

      if (parts.length < 2) return;

      const titleRaw = parts[0];
      const dateLine = parts.slice(1).join(' ');

      const title = cleanTitle(titleRaw);
      if (!title || title.length < 3) return;

      const parsed = parseEventDate(dateLine);
      if (!parsed) return;

      // Dedup within this scrape (mobile/desktop duplicates)
      const dedupKey = `${title.toLowerCase()}|${parsed.date}`;
      if (seen.has(dedupKey)) return;
      seen.add(dedupKey);

      events.push({
        title,
        date: parsed.date,
        time: parsed.time,
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
