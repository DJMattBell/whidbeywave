export type ScrapedEvent = {
  title: string;
  date: string;        // YYYY-MM-DD
  time: string | null;
  location: string | null;
  town: string;        // from ALLOWED_TOWNS — default 'Other'
  category: string;   // from ALLOWED_EVENT_CATEGORIES — default 'Other'
  description: string | null;
  source: string;      // 'WICA' | 'Oak Harbor'
};

/** Convert a Date (or ms timestamp) to YYYY-MM-DD in Pacific time */
export function toPacificDateString(d: Date | number): string {
  return new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

/**
 * Sanitize a time string by removing duplicated time ranges.
 * Catches patterns like "10:30am–11:30am10:30am to 11:30am" where
 * a source website rendered the same time in two formats and the scraper
 * picked up the concatenated text.
 *
 * Returns the first clean time range found, or the original string if
 * no duplication is detected.
 */
export function sanitizeTime(raw: string): string {
  if (!raw) return raw;

  // Match a single time or time range: "10:30 AM", "10:30am – 11:30pm", etc.
  const timeRangeRe =
    /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)(?:\s*[-–—]\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))?/g;

  const matches = raw.match(timeRangeRe);
  if (!matches || matches.length <= 1) return raw;

  // If we found multiple time patterns, return just the first one (the canonical format)
  return matches[0].trim();
}

/** Normalize a location string for dedup: lowercase, collapse whitespace */
export function normalizeLocation(loc: string | null | undefined): string {
  return (loc ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}
