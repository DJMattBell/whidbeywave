import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const OAK_HARBOR_URL = 'https://www.oakharbor.gov/Calendar.aspx';

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03',     april: '04',
  may:     '05', june:     '06', july:  '07',     august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

/** Parse CivicEngage date strings like "March 8, 2026" or "3/8/2026" */
function parseDate(raw: string): string | null {
  const s = raw.trim();

  // MM/DD/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // "Month D, YYYY"
  const longDate = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (longDate) {
    const [, monthName, day, year] = longDate;
    const mm = MONTH_MAP[monthName.toLowerCase()];
    if (mm) return `${year}-${mm}-${day.padStart(2, '0')}`;
  }

  // Fall back to JS Date
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function cleanText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

export async function scrapeOakHarbor(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(OAK_HARBOR_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $    = cheerio.load(html);
    const events: ScrapedEvent[] = [];

    // CivicEngage / CivicPlus calendar uses various selectors depending on version:
    // - .fc-event (FullCalendar widget)
    // - .rgRow / .rgAltRow in a RadGrid
    // - .cal_titlelink in classic CivicPlus

    // Strategy 1: FullCalendar event items
    $('.fc-event').each((_, el) => {
      const $el  = $(el);
      const title = cleanText($el.text());
      if (!title) return;

      // FC stores date on the parent day cell's data-date attribute
      const rawDate = $el.closest('[data-date]').attr('data-date') ??
                      $el.attr('data-date') ?? '';
      const date = parseDate(rawDate);
      if (!date) return;

      events.push({
        title,
        date,
        time: null,
        location: 'Oak Harbor City Hall',
        town: 'Oak Harbor',
        category: 'Community & Social',
        description: null,
        source: 'Oak Harbor',
      });
    });

    // Strategy 2: Classic CivicPlus list-view rows
    if (events.length === 0) {
      $('a.cal_titlelink').each((_, el) => {
        const $el   = $(el);
        const title = cleanText($el.text());
        if (!title) return;

        // Date is usually in a sibling td or a nearby .cal_date span
        const $row  = $el.closest('tr');
        const rawDate = cleanText(
          $row.find('.cal_date, td:first-child').first().text()
        );
        const date = parseDate(rawDate);
        if (!date) return;

        const time = cleanText($row.find('.cal_time').text()) || null;

        events.push({
          title,
          date,
          time: time || null,
          location: null,
          town: 'Oak Harbor',
          category: 'Community & Social',
          description: null,
          source: 'Oak Harbor',
        });
      });
    }

    // Strategy 3: RadGrid rows (another CivicEngage variant)
    if (events.length === 0) {
      $('.rgRow, .rgAltRow').each((_, el) => {
        const $el    = $(el);
        const tds    = $el.find('td');
        if (tds.length < 2) return;

        const rawDate = cleanText($(tds[0]).text());
        const title   = cleanText($(tds[1]).text());
        if (!title || !rawDate) return;

        const date = parseDate(rawDate);
        if (!date) return;

        events.push({
          title,
          date,
          time: null,
          location: null,
          town: 'Oak Harbor',
          category: 'Community & Social',
          description: null,
          source: 'Oak Harbor',
        });
      });
    }

    return events;
  } catch (err) {
    console.error('[scrapeOakHarbor] error:', err);
    return [];
  }
}
