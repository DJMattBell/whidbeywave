import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

// CivicPlus/CivicEngage calendar — confirmed working selectors
const OAK_HARBOR_CITY_URL = 'https://oakharbor.gov/calendar.aspx';

/**
 * Parse CivicEngage date strings like:
 *   "March 9, 2026, 10:00 AM - 11:00 AM"
 * Returns { date: "2026-03-09", time: "10:00 AM - 11:00 AM" }
 */
function parseCivicDate(raw: string): { date: string | null; time: string | null } {
  const s = raw.trim();

  // "Month D, YYYY, time"
  const m = s.match(/^([A-Za-z]+ \d{1,2},?\s*\d{4}),?\s*(.*)?$/);
  if (!m) return { date: null, time: null };

  const d = new Date(m[1].trim());
  if (isNaN(d.getTime())) return { date: null, time: null };

  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');

  const time = m[2]?.trim() || null;
  return { date: `${yyyy}-${mm}-${dd}`, time };
}

export async function scrapeOakHarborCityEvents(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(OAK_HARBOR_CITY_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // Strategy 1: CivicPlus .widgetItem (confirmed on oakharbor.gov)
    $('.widgetItem').each((_, el) => {
      const $el   = $(el);
      const title = $el.find('h3 a, h2 a').first().text().trim();
      if (!title) return;

      // Date/time is in the first <p> after <h3>
      const rawDateTime = $el.find('h3').first().nextAll('p').first().text().trim();
      const { date, time } = parseCivicDate(rawDateTime);
      if (!date) return;

      events.push({
        title,
        date,
        time,
        location: null,
        town:     'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'City of Oak Harbor',
      });
    });

    if (events.length > 0) return events;

    // Strategy 2: FullCalendar widget
    $('.fc-event').each((_, el) => {
      const $el   = $(el);
      const title = $el.text().trim();
      if (!title) return;

      const rawDate = $el.closest('[data-date]').attr('data-date') ??
                      $el.attr('data-date') ?? '';
      if (!rawDate) return;

      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');

      events.push({
        title,
        date: `${yyyy}-${mm}-${dd}`,
        time: null,
        location: null,
        town:     'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'City of Oak Harbor',
      });
    });

    if (events.length > 0) return events;

    // Strategy 3: Classic CivicPlus list-view
    $('a.cal_titlelink').each((_, el) => {
      const $el   = $(el);
      const title = $el.text().trim();
      if (!title) return;

      const $row    = $el.closest('tr');
      const rawDate = $row.find('.cal_date, td:first-child').first().text().trim();
      const { date, time } = parseCivicDate(rawDate);
      if (!date) return;

      events.push({
        title,
        date,
        time,
        location: null,
        town:     'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'City of Oak Harbor',
      });
    });

    return events;
  } catch (err) {
    console.error('[scrapeOakHarborCityEvents] error:', err);
    return [];
  }
}
