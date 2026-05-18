import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const WHIDBEY_TEL_URL = 'https://www.whidbeytel.com/events/';

/**
 * Parse a date string into YYYY-MM-DD format.
 * Handles: "March 8, 2026", "March 8 - March 15, 2026", ISO dates, etc.
 * For date ranges, returns the start date.
 */
function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // ISO format: 2026-03-08 or 2026-03-08T...
  const iso = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  // Date range: "March 8 - March 15, 2026" or "March 8 – March 15, 2026"
  const rangeMatch = trimmed.match(
    /^([A-Za-z]+\s+\d{1,2})\s*[-–—]\s*[A-Za-z]+\s+\d{1,2},?\s*(\d{4})/
  );
  if (rangeMatch) {
    const startStr = `${rangeMatch[1]}, ${rangeMatch[2]}`;
    const d = new Date(startStr);
    if (!isNaN(d.getTime())) {
      return formatDate(d);
    }
  }

  // Date range where start has year: "March 8, 2026 - March 15, 2026"
  const rangeWithYear = trimmed.match(
    /^([A-Za-z]+\s+\d{1,2},?\s*\d{4})\s*[-–—]/
  );
  if (rangeWithYear) {
    const d = new Date(rangeWithYear[1]);
    if (!isNaN(d.getTime())) {
      return formatDate(d);
    }
  }

  // Single date: "March 8, 2026" or "March 8 2026"
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return formatDate(d);
  }

  return null;
}

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/theatre|theater|play|performance|comedy|murder/.test(t)) return 'Arts & Culture';
  if (/music|concert|band|live|jazz|blues/.test(t))             return 'Music & Performance';
  if (/market|bazaar|craft|vendor/.test(t))                     return 'Farmers Market';
  if (/parade|festival|fair|fest\b/.test(t))                    return 'Arts & Culture';
  if (/class|workshop|lesson|seminar/.test(t))                  return 'Classes & Workshops';
  if (/kids|children|youth|family/.test(t))                     return 'Community & Social';
  if (/st\.?\s*patrick|holiday|halloween|christmas/.test(t))    return 'Community & Social';
  return 'Community & Social';
}

export async function scrapeWhidbeyTelecomEvents(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(WHIDBEY_TEL_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    $('.event-main-box').each((_, el) => {
      const $el = $(el);
      const $content = $el.find('.event-box-content');

      // Title from h2 > a inside .event-box-content
      const title = $content.find('h2 a').first().text().trim();
      if (!title) return;

      // Date extraction — try .events_meta_date first
      let rawDate = $content.find('.events_meta_date').first().text().trim();

      // Fallback: look for <p><strong> containing date-like text
      if (!rawDate) {
        $content.find('p strong').each((_, strong) => {
          const text = $(strong).text().trim();
          // Check if the text looks like a date (starts with month name or has date pattern)
          if (/^(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(text)) {
            rawDate = text;
            return false; // break
          }
        });
      }

      // Fallback: look for <p> text that starts with a month name
      if (!rawDate) {
        $content.find('p').each((_, p) => {
          const text = $(p).text().trim();
          if (/^(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(text)) {
            rawDate = text.split('\n')[0].trim();
            return false; // break
          }
        });
      }

      const date = parseDate(rawDate);
      if (!date) return;

      // Time extraction — look for time patterns in the content
      let time: string | null = null;
      const fullText = $content.text();
      const timeMatch = fullText.match(
        /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)(?:\s*[-–—]\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))?)/
      );
      if (timeMatch) {
        time = timeMatch[1].trim();
      }

      // Location extraction — look for "Location:" label in <p><strong>
      let location: string | null = null;
      $content.find('p').each((_, p) => {
        const $p = $(p);
        const strongText = $p.find('strong').text().trim();
        if (/location/i.test(strongText)) {
          // Get text after the <strong> tag
          const fullP = $p.text().trim();
          const loc = fullP.replace(/.*location:?\s*/i, '').trim();
          if (loc) location = loc;
          return false; // break
        }
      });

      // Description — collect remaining <p> text that isn't date or location
      let description: string | null = null;
      const descParts: string[] = [];
      $content.find('p').each((_, p) => {
        const $p = $(p);
        const text = $p.text().trim();
        if (!text) return;
        // Skip date and location paragraphs
        if (/^(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(text)) return;
        if (/location:?\s/i.test(text)) return;
        // Skip if it's just a time
        if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)/.test(text)) return;
        descParts.push(text);
      });
      if (descParts.length > 0) {
        description = descParts.join(' ').substring(0, 500) || null;
      }

      events.push({
        title,
        date,
        time,
        location,
        town: 'Other',
        category: guessCategory(title),
        description,
        source: 'Whidbey Telecom Events',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeWhidbeyTelecomEvents] error:', err);
    return [];
  }
}
