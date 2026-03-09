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
