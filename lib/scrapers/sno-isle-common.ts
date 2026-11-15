import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';
import { stripHtml } from '@/lib/data';

/**
 * Whidbey Island branch IDs from the Sno-Isle BiblioCommons locations table.
 * Maps branchLocationId → { name, town, source }.
 */
const WHIDBEY_BRANCHES: Record<string, { name: string; town: string; source: string }> = {
  '10': { name: 'Clinton Library',    town: 'Clinton',    source: 'Clinton Library' },
  '11': { name: 'Coupeville Library', town: 'Coupeville', source: 'Coupeville Library' },
  '14': { name: 'Freeland Library',   town: 'Freeland',   source: 'Freeland Library' },
  '17': { name: 'Langley Library',    town: 'Langley',    source: 'Langley Library' },
  '24': { name: 'Oak Harbor Library', town: 'Oak Harbor',  source: 'Oak Harbor Library' },
};

/** BiblioCommons boilerplate patterns to strip from descriptions.
 *  Uses [\s\S] instead of the `s` flag for ES2017 compat. */
const BOILERPLATE_PATTERNS = [
  /\s*Contact us with questions[\s\S]*$/,
  /\s*Contact Us\s*Programs?\s*&\s*Events?\s*FAQs?[\s\S]*$/,
  /\s*Programs?\s*&\s*Events?\s*FAQs?\s*To request a sign language[\s\S]*$/,
];

/**
 * Extract embedded JSON state from a BiblioCommons SPA page.
 */
export function extractEmbeddedState(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  let state: Record<string, unknown> | null = null;

  $('script').each((_, el) => {
    if (state) return;
    const content = $(el).html();
    if (!content) return;
    if (!content.includes('eventSeries') && !content.includes('entities')) return;

    // Strategy 1: window.__INITIAL_STATE__ = {...}
    const assignMatch = content.match(
      /window\.__[A-Z_]+__\s*=\s*(\{[\s\S]*\})\s*;?\s*$/
    );
    if (assignMatch) {
      try { state = JSON.parse(assignMatch[1]); return; } catch { /* next */ }
    }

    // Strategy 2: Entire script content is JSON
    try {
      const parsed = JSON.parse(content.trim());
      if (typeof parsed === 'object' && parsed !== null) { state = parsed; return; }
    } catch { /* next */ }

    // Strategy 3: Find JSON object containing eventSeries
    const jsonMatch = content.match(/(\{[\s\S]*"eventSeries"[\s\S]*\})/);
    if (jsonMatch) {
      const startIdx = content.indexOf(jsonMatch[0]);
      let depth = 0;
      let endIdx = startIdx;
      for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') depth--;
        if (depth === 0) { endIdx = i + 1; break; }
      }
      try { state = JSON.parse(content.slice(startIdx, endIdx)); } catch { /* give up */ }
    }
  });

  return state;
}

/**
 * Recursively search for the "eventSeries" map in embedded state.
 */
export function findEventSeries(obj: unknown): Record<string, unknown> | null {
  if (obj === null || typeof obj !== 'object') return null;
  const record = obj as Record<string, unknown>;

  if ('eventSeries' in record && typeof record.eventSeries === 'object' && record.eventSeries !== null) {
    return record.eventSeries as Record<string, unknown>;
  }
  if ('entities' in record && typeof record.entities === 'object' && record.entities !== null) {
    const entities = record.entities as Record<string, unknown>;
    if ('eventSeries' in entities && typeof entities.eventSeries === 'object' && entities.eventSeries !== null) {
      return entities.eventSeries as Record<string, unknown>;
    }
  }
  for (const key of Object.keys(record)) {
    const val = record[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const found = findEventSeries(val);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Parse an ISO timestamp to YYYY-MM-DD in Pacific time.
 */
function isoToDate(iso: string): string | null {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return toPacificDateString(d);
  } catch {
    return null;
  }
}

/**
 * Extract a human-readable time from an ISO timestamp.
 *
 * BiblioCommons often emits timestamps WITHOUT a timezone suffix (e.g.
 * "2026-11-03T10:30:00"). On Vercel (UTC server), `new Date()` treats
 * these as UTC, producing wrong Pacific times (10:30 UTC → 2:30 AM PST).
 *
 * Fix: when there's no timezone offset, extract the time directly from
 * the string — BiblioCommons renders times in the library's local timezone
 * (Pacific), so the literal string value is the correct local time.
 */
function isoToTime(iso: string): string | null {
  if (!iso) return null;

  // Check if the timestamp has a timezone suffix
  const hasTz = /[+-]\d{2}:?\d{2}$/.test(iso) || iso.endsWith('Z');

  if (hasTz) {
    // Proper ISO with timezone — safe to use Date conversion
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return null;
    }
  }

  // No timezone — extract time directly from the string
  const timeMatch = iso.match(/T(\d{2}):(\d{2})/);
  if (!timeMatch) return null;

  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${minute} ${ampm}`;
}

/**
 * Build a time range string from start and optional end timestamps.
 */
function buildTimeRange(startIso: string, endIso?: string): string | null {
  const startTime = isoToTime(startIso);
  if (!startTime) return null;
  if (!endIso) return startTime;
  const endTime = isoToTime(endIso);
  if (!endTime) return startTime;
  return `${startTime} - ${endTime}`;
}

/**
 * Clean a description: strip HTML, decode entities, remove boilerplate.
 */
export function cleanDescription(raw: string | null): string | null {
  if (!raw) return null;
  let text = stripHtml(raw);
  for (const pattern of BOILERPLATE_PATTERNS) {
    text = text.replace(pattern, '');
  }
  return text.trim() || null;
}

/**
 * Check if a branchLocationId belongs to a Whidbey Island library.
 * Returns the branch info if on-island, null if off-island or unknown.
 */
export function getWhidbeyBranch(branchLocationId: string | null): { name: string; town: string; source: string } | null {
  if (!branchLocationId) return null;
  return WHIDBEY_BRANCHES[branchLocationId] ?? null;
}

/**
 * Scrape all Whidbey Island library events from Sno-Isle BiblioCommons.
 *
 * Fetches the shared BiblioCommons SPA page once and filters events
 * by branchLocationId — only events at Whidbey branches are returned,
 * each attributed to its actual library location and town.
 */
export async function scrapeAllSnoIsleWhidbey(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch('https://sno-isle.bibliocommons.com/v2/events?location=langley', {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const state = extractEmbeddedState(html);
    if (!state) return [];

    const eventSeries = findEventSeries(state);
    if (!eventSeries) return [];

    const events: ScrapedEvent[] = [];

    for (const seriesId of Object.keys(eventSeries)) {
      const series = eventSeries[seriesId] as Record<string, unknown> | null;
      if (!series) continue;

      const definition = series.definition as Record<string, unknown> | undefined;
      const title = ((definition?.title as string) ?? '').trim();
      if (!title) continue;

      // Filter by branchLocationId — the only reliable branch indicator
      const branchLocationId = (definition?.branchLocationId as string) ?? null;
      const branch = getWhidbeyBranch(branchLocationId);
      if (!branch) continue; // Off-island or no branch ID → skip

      const description = (definition?.description as string) ?? null;

      // Extract timestamps
      const timestamps: { start: string; end?: string }[] = [];

      const recurrencePatterns = series.recurrencePatterns as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(recurrencePatterns)) {
        for (const pattern of recurrencePatterns) {
          const start = pattern.start as string | undefined;
          if (start) {
            timestamps.push({ start, end: pattern.end as string | undefined });
          }
        }
      }

      const eventKeys = series.eventKeys as Array<string | Record<string, unknown>> | undefined;
      if (Array.isArray(eventKeys)) {
        for (const key of eventKeys) {
          if (typeof key === 'string') {
            const isoMatch = String(key).match(/(\d{4}-\d{2}-\d{2}T[\d:]+(?:[+-]\d{2}:?\d{2}|Z)?)/);
            if (isoMatch) timestamps.push({ start: isoMatch[1] });
          } else if (typeof key === 'object' && key !== null) {
            const start = (key as Record<string, unknown>).start as string | undefined;
            if (start) timestamps.push({ start, end: (key as Record<string, unknown>).end as string | undefined });
          }
        }
      }

      if (timestamps.length === 0) {
        const nextOccurrence = series.nextOccurrence as string | undefined;
        const startTime = series.start as string | undefined;
        if (nextOccurrence) timestamps.push({ start: nextOccurrence });
        else if (startTime) timestamps.push({ start: startTime });
      }

      const cleanDesc = cleanDescription(description);

      for (const ts of timestamps) {
        const date = isoToDate(ts.start);
        if (!date) continue;

        const time = buildTimeRange(ts.start, ts.end);

        events.push({
          title,
          date,
          time,
          location: branch.name,
          town: branch.town,
          category: 'Classes & Workshops',
          description: cleanDesc,
          source: branch.source,
        });
      }
    }

    return events;
  } catch (err) {
    console.error('[scrapeSnoIsleWhidbey] error:', err);
    return [];
  }
}

// Legacy wrapper — kept for backward compatibility but delegates to the shared scraper
type SnoIsleConfig = {
  pageUrl: string;
  location: string;
  town: string;
  source: string;
  logPrefix: string;
};

/** @deprecated Use scrapeAllSnoIsleWhidbey() instead */
export async function scrapeSnoIsleLibrary(config: SnoIsleConfig): Promise<ScrapedEvent[]> {
  return scrapeAllSnoIsleWhidbey();
}
