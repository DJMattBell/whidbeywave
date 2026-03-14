import ICAL from 'ical.js';
import type { ScrapedEvent } from './types';

/**
 * Shared helper for Sno-Isle Libraries BiblioCommons scraping.
 * Strategy: try JSON API first, fall back to ICS feed.
 */

type LibraryConfig = {
  branchCode: string;   // e.g. 'LAE', 'CPE', 'OHE', 'SWE'
  town: string;
  location: string;     // e.g. 'Langley Library'
  source: string;
};

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Try the BiblioCommons JSON events API */
async function fetchJSON(config: LibraryConfig): Promise<ScrapedEvent[] | null> {
  const url =
    `https://sno-isle.bibliocommons.com/v2/events?branch=${config.branchCode}&format=json&start_date=${todayISO()}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: {
      'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) return null;

  let json: Record<string, unknown>;
  try {
    json = await res.json();
  } catch {
    return null;
  }

  // BiblioCommons nests events under entities.events as a map
  const eventsMap =
    (json?.entities as Record<string, unknown> | undefined)?.events as
      Record<string, Record<string, unknown>> | undefined;

  if (!eventsMap || typeof eventsMap !== 'object') return null;

  const events: ScrapedEvent[] = [];

  for (const evt of Object.values(eventsMap)) {
    const title = (evt.title as string | undefined)?.trim();
    if (!title) continue;

    const start = evt.start as string | undefined;
    if (!start) continue;

    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) continue;

    const date = formatDate(startDate);

    let time: string | null = null;
    try {
      const startTime = formatTime(startDate);
      const end = evt.end as string | undefined;
      if (end) {
        const endDate = new Date(end);
        if (!isNaN(endDate.getTime())) {
          time = `${startTime} – ${formatTime(endDate)}`;
        }
      }
      if (!time) time = startTime;
    } catch {
      // leave time null
    }

    const rawDesc = typeof evt.description === 'string' ? evt.description : null;
    const description = rawDesc ? stripHtml(rawDesc).slice(0, 500) || null : null;

    events.push({
      title,
      date,
      time,
      location: config.location,
      town: config.town,
      category: 'Classes & Workshops',
      description,
      source: config.source,
    });
  }

  return events;
}

/** Fallback: fetch ICS feed and parse with ical.js */
async function fetchICS(config: LibraryConfig): Promise<ScrapedEvent[]> {
  const url =
    `https://sno-isle.bibliocommons.com/v2/events?branch=${config.branchCode}&format=ics`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
  });

  if (!res.ok) return [];

  const icsText = await res.text();
  if (!icsText.includes('BEGIN:VCALENDAR')) return [];

  const jcalData = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const events: ScrapedEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const title = event.summary?.trim();
    if (!title) continue;

    const dtstart = event.startDate;
    if (!dtstart) continue;

    const jsDate = dtstart.toJSDate();
    if (isNaN(jsDate.getTime())) continue;

    const date = formatDate(jsDate);

    let time: string | null = null;
    try {
      // Only include time if the event has a specific time (not all-day)
      if (dtstart.hour !== 0 || dtstart.minute !== 0) {
        const startTime = formatTime(jsDate);
        const dtend = event.endDate;
        if (dtend) {
          const endJs = dtend.toJSDate();
          if (!isNaN(endJs.getTime())) {
            time = `${startTime} – ${formatTime(endJs)}`;
          }
        }
        if (!time) time = startTime;
      }
    } catch {
      // leave time null
    }

    const rawDesc = event.description ?? null;
    const description = rawDesc ? stripHtml(rawDesc).slice(0, 500) || null : null;

    events.push({
      title,
      date,
      time,
      location: config.location,
      town: config.town,
      category: 'Classes & Workshops',
      description,
      source: config.source,
    });
  }

  return events;
}

/** Scrape a Sno-Isle library branch: JSON first, ICS fallback */
export async function scrapeSnoIsleLibrary(config: LibraryConfig): Promise<ScrapedEvent[]> {
  try {
    const jsonEvents = await fetchJSON(config);
    if (jsonEvents && jsonEvents.length > 0) return jsonEvents;

    // JSON returned nothing or failed — try ICS
    return await fetchICS(config);
  } catch (err) {
    console.error(`[scrape${config.source.replace(/\s/g, '')}] error:`, err);
    return [];
  }
}
