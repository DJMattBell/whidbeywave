import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';

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

  // Date range: "April 04, 2026 - October 17, 2026"
  const rangeWithYear = trimmed.match(
    /^([A-Za-z]+\s+\d{1,2},?\s*\d{4})\s*[-–—]/
  );
  if (rangeWithYear) {
    const d = new Date(rangeWithYear[1]);
    if (!isNaN(d.getTime())) {
      return toPacificDateString(d);
    }
  }

  // Date range: "March 8 - March 15, 2026" or "March 8 – March 15, 2026"
  const rangeMatch = trimmed.match(
    /^([A-Za-z]+\s+\d{1,2})\s*[-–—]\s*[A-Za-z]+\s+\d{1,2},?\s*(\d{4})/
  );
  if (rangeMatch) {
    const startStr = `${rangeMatch[1]}, ${rangeMatch[2]}`;
    const d = new Date(startStr);
    if (!isNaN(d.getTime())) {
      return toPacificDateString(d);
    }
  }

  // Single date: "March 8, 2026" or "March 8 2026"
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return toPacificDateString(d);
  }

  // Date without year: "Apr 04" or "Aug 15" — assume current/next occurrence
  const noYearMatch = trimmed.match(
    /^([A-Za-z]+)\s+(\d{1,2})$/
  );
  if (noYearMatch) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const withYear = new Date(`${noYearMatch[1]} ${noYearMatch[2]}, ${currentYear}`);
    if (!isNaN(withYear.getTime())) {
      // If the date is more than 2 months in the past, assume next year
      if (withYear.getTime() < now.getTime() - 60 * 86400000) {
        withYear.setFullYear(currentYear + 1);
      }
      return toPacificDateString(withYear);
    }
  }

  return null;
}


/** Infer town from location and title text */
function detectTown(location: string | null, title: string): string {
  const text = `${location ?? ''} ${title}`.toLowerCase();
  if (text.includes('oak harbor'))  return 'Oak Harbor';
  if (text.includes('coupeville'))  return 'Coupeville';
  if (text.includes('langley'))     return 'Langley';
  if (text.includes('freeland'))    return 'Freeland';
  if (text.includes('greenbank'))   return 'Greenbank';
  if (text.includes('clinton'))     return 'Clinton';
  return 'Other';
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/theatre|theater|play|performance|comedy|murder/.test(t)) return 'Arts & Culture';
  if (/music|concert|band|live|jazz|blues/.test(t))             return 'Music & Performance';
  if (/market|bazaar|craft|vendor/.test(t))                     return 'Farmers Market';
  if (/parade|festival|fair|fest\b/.test(t))                    return 'Arts & Culture';
  if (/class|workshop|lesson|seminar/.test(t))                  return 'Classes & Workshops';
  if (/kids|children|youth|family/.test(t))                     return 'Community & Social';
  if (/st\.?\s*patrick|holiday|halloween|christmas|trunk/.test(t)) return 'Community & Social';
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

      // Title from h2 > a inside .event-title
      const title = $content.find('.event-title h2 a').first().text().trim()
        || $content.find('h2 a').first().text().trim();
      if (!title) return;

      // Date extraction — .postmetadata-date is the primary selector,
      // .events_meta_date exists on a few older entries as fallback
      let rawDate = $content.find('.postmetadata-date').first().text().trim()
        || $content.find('.events_meta_date').first().text().trim();

      if (!rawDate) return;

      const date = parseDate(rawDate);
      if (!date) return;

      // Time extraction — look for time patterns in the content text
      let time: string | null = null;
      const fullText = $content.text();
      const timeMatch = fullText.match(
        /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)(?:\s*[-–—]\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))?)/
      );
      if (timeMatch) {
        time = timeMatch[1].trim();
      } else {
        // Try "Xpm to Ypm" or "X to Y pm" patterns
        const informalTime = fullText.match(
          /(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:to|-|–)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
        );
        if (informalTime) time = informalTime[1].trim();
      }

      // Location extraction — loose text "Location: City, WA" in .event-box-content
      // The location text runs directly into description text, so we take just
      // the first short segment (typically "City, WA" or a venue name).
      let location: string | null = null;
      const locationMatch = fullText.match(/Location:\s*([^\n]+)/);
      if (locationMatch) {
        let loc = locationMatch[1].trim();
        // Cut at the first sentence boundary or after "WA" + space
        const waEnd = loc.match(/,?\s*WA\b/);
        if (waEnd && waEnd.index !== undefined) {
          loc = loc.substring(0, waEnd.index + waEnd[0].length).trim();
        } else {
          // No "WA" found — take up to the first period-space or 60 chars
          const cutoff = loc.search(/\.\s|,\s+[A-Z][a-z]/);
          if (cutoff > 0) loc = loc.substring(0, cutoff).trim();
          if (loc.length > 60) loc = loc.substring(0, 60).trim();
        }
        loc = loc.replace(/\.$/, '').trim();
        if (loc) location = loc;
      }

      // Description — get text after event-title div, skip location line
      let description: string | null = null;
      const descText = fullText
        .replace(title, '')
        .replace(rawDate, '')
        .replace(/Location:\s*[^\n]+/, '')
        .replace(/Read More\s*>?/i, '')
        .trim();
      if (descText.length > 20) {
        description = descText.substring(0, 500).trim() || null;
      }

      events.push({
        title,
        date,
        time,
        location,
        town: detectTown(location, title),
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
