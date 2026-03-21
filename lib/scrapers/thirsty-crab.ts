import type { ScrapedEvent } from './types';

const API_URL =
  'https://thirstycrabbrewery.com/wp-json/tribe/events/v1/events';

/** Strip HTML tags and collapse whitespace. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#?\w+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Guess a category from the event title. */
function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/\bmusic\b|\blive\b|\bband\b|\bjam\b|\bopen mic\b|\bconcert\b/.test(t))
    return 'Live Music';
  if (/\btrivia\b/.test(t)) return 'Trivia';
  if (/\bbingo\b/.test(t)) return 'Bingo';
  if (/\bkaraoke\b/.test(t)) return 'Karaoke';
  if (/\bcomedy\b|\bstand-up\b/.test(t)) return 'Comedy';
  if (/\bquiz\b/.test(t)) return 'Trivia';
  if (/\btasting\b|\bbeer\b|\bbrew\b|\bcider\b/.test(t)) return 'Tasting';
  if (/\bfood truck\b|\bdinner\b|\bbrunch\b/.test(t)) return 'Food & Drink';
  if (/\bmarket\b|\bvendor\b|\bcraft\b/.test(t)) return 'Market';
  if (/\bfundraiser\b|\bcharity\b|\bbenefit\b/.test(t)) return 'Fundraiser';
  if (/\bkids\b|\bfamily\b|\bchildren\b/.test(t)) return 'Family Event';
  if (/\bclass\b|\bworkshop\b|\blesson\b/.test(t)) return 'Class';
  return 'Community & Social';
}

/**
 * Extract YYYY-MM-DD from a TEC start_date string ("2026-03-15 19:00:00").
 */
function extractDate(startDate: string): string {
  return startDate.split(' ')[0];
}

/**
 * Extract a human-readable time from a TEC start_date + end_date pair.
 * "2026-03-15 19:00:00" → "7:00 PM"
 * If end_date is provided: "7:00 PM – 9:00 PM"
 */
function extractTime(startDate: string, endDate?: string): string | null {
  const fmt = (raw: string): string | null => {
    const timePart = raw.split(' ')[1]; // "19:00:00"
    if (!timePart) return null;
    const [hStr, mStr] = timePart.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr;
    if (isNaN(h)) return null;
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${m} ${ampm}`;
  };

  const start = fmt(startDate);
  if (!start) return null;

  if (endDate) {
    const end = fmt(endDate);
    if (end && end !== start) return `${start} – ${end}`;
  }
  return start;
}

interface TecEvent {
  title: string;
  start_date: string;
  end_date?: string;
  description?: string;
  venue?: { venue?: string; city?: string };
  url?: string;
  image?: { url?: string };
}

interface TecResponse {
  events?: TecEvent[];
  total?: number;
  total_pages?: number;
}

export async function scrapeThirstyCrab(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(API_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const data: TecResponse = await res.json();
    if (!data.events || !Array.isArray(data.events)) return [];

    const events: ScrapedEvent[] = [];

    for (const ev of data.events) {
      const title = (ev.title ?? '').trim();
      if (!title) continue;

      const date = extractDate(ev.start_date);
      if (!date || date.length !== 10) continue;

      const time = extractTime(ev.start_date, ev.end_date);

      const location = ev.venue?.venue?.trim() || 'Thirsty Crab Brewery';

      let description: string | null = null;
      if (ev.description) {
        const cleaned = stripHtml(ev.description);
        description = cleaned.length > 0 ? cleaned.slice(0, 1000) : null;
      }

      events.push({
        title,
        date,
        time,
        location,
        town: 'Clinton',
        category: guessCategory(title),
        description,
        source: 'Thirsty Crab Brewery',
      });
    }

    return events;
  } catch (err) {
    console.error('[scrapeThirstyCrab] error:', err);
    return [];
  }
}
