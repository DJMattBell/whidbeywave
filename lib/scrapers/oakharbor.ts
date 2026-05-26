import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const RSS_URL =
  'https://www.oakharbor.gov/RSSFeed.aspx?ModID=58&CID=All-0&ShowAll=True';

/**
 * Parse an RSS pubDate (RFC-2822) into YYYY-MM-DD.
 * Example input: "Mon, 10 Mar 2026 13:00:00 GMT"
 */
function toDateString(raw: string): string | null {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
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
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const $ = cheerio.load(xml, { xml: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events: ScrapedEvent[] = [];

    $('item').each((_, el) => {
      const $item = $(el);

      const title = $item.find('title').text().trim();
      if (!title) return;

      const pubDateRaw = $item.find('pubDate').text().trim();
      const date = toDateString(pubDateRaw);
      if (!date) return;

      // Only include future events (today or later)
      if (new Date(date + 'T00:00:00') < today) return;

      const descriptionRaw = $item.find('description').text().trim();
      const descriptionText = descriptionRaw ? stripHtml(descriptionRaw) : null;

      // Try to pull a time from the description first, then from pubDate
      const time =
        (descriptionText ? extractTime(descriptionText) : null) ??
        extractTime(pubDateRaw);

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
