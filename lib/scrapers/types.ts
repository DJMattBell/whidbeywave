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
