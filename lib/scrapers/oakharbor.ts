import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';

const RSS_URL =
  'https://www.oakharbor.gov/RSSFeed.aspx?ModID=58&CID=All-0&ShowAll=True';

/**
 * Extract the event date from RSS item.
 * The feed's pubDate is the *publication* date, NOT the event date.
 * The actual event date lives in <calendarEvent:EventDates> or in the
 * description text as "Event date: August 4, 2026".
 */
function extractEventDate(
  $item: cheerio.Cheerio<any>,
  $: ReturnType<typeof cheerio.load>
): string | null {
  // Try <calendarEvent:EventDates> first (XML namespace element)
  const eventDatesEl = $item.find('calendarEvent\\:EventDates, EventDates');
  if (eventDatesEl.length) {
    const raw = eventDatesEl.text().trim();
    // May be "August 4, 2026" or a range "August 4 - August 6, 2026"
    const d = new Date(raw.split(/[-–—]/)[0].trim());
    if (!isNaN(d.getTime())) return toPacificDateString(d);
  }

  // Fallback: extract "Event date: Month Day, Year" from description text
  const desc = $item.find('description').text().trim();
  const dateMatch = desc.match(
    /Event\s+date:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i
  );
  if (dateMatch) {
    const d = new Date(dateMatch[1]);
    if (!isNaN(d.getTime())) return toPacificDateString(d);
  }

  return null;
}

/**
 * Try to extract a human-readable time string from text.
 * Looks for patterns like "1:00 PM", "6:00 PM – 7:00 PM", "10:30 AM".
 */
function extractTime(text: string): string | null {
  const match = text.match(
    /\d{1,2}:\d{2}\s*[APap][Mm](?:\s*[–—-]\s*\d{1,2}:\d{2}\s*[APap][Mm])?/
  );
  return match ? match[0].trim() : null;
}

/**
 * Strip HTML tags from a string and collapse whitespace.
 */
function stripHtml(raw: string): string {
  const $ = cheerio.load(raw, { xml: false });
  return $.text().replace(/\s+/g, ' ').trim();
}

/**
 * Scrape upcoming city events from the Oak Harbor RSS feed.
 */
export async function scrapeOakHarbor(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(RSS_URL, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const $ = cheerio.load(xml, { xml: true });

    const todayStr = toPacificDateString(new Date());

    const events: ScrapedEvent[] = [];

    $('item').each((_, el) => {
      const $item = $(el);

      const title = $item.find('title').text().trim();
      if (!title) return;

      const date = extractEventDate($item, $);
      if (!date) return;

      // Only include future events (today or later) using string comparison on YYYY-MM-DD
      if (date < todayStr) return;

      const descriptionRaw = $item.find('description').text().trim();
      const descriptionText = descriptionRaw ? stripHtml(descriptionRaw) : null;

      const time = descriptionText ? extractTime(descriptionText) : null;

      const link = $item.find('link').text().trim() || null;

      events.push({
        title,
        date,
        time,
        location: null,
        town: 'Oak Harbor',
        category: 'Community & Social',
        description: descriptionText || (link ? `Details: ${link}` : null),
        source: 'City of Oak Harbor',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeOakHarbor] error:', err);
    return [];
  }
}
