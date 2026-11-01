import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';
import { toPacificDateString } from './types';
import { stripHtml } from '@/lib/data';

/** Sno-Isle library branches on Whidbey Island */
const WHIDBEY_BRANCHES = ['langley', 'coupeville', 'oak harbor', 'freeland', 'clinton'];

/** Off-island keywords that indicate an event leaked from another branch */
const OFF_ISLAND_KEYWORDS = [
  'mukilteo', 'lynnwood', 'edmonds', 'mountlake terrace', 'marysville',
  'everett', 'arlington', 'stanwood', 'lake stevens', 'snohomish',
  'camano island library', 'bothell', 'mill creek', 'shoreline',
  'lake forest park', 'woodinville', 'kenmore', 'brier',
];

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
function cleanDescription(raw: string | null): string | null {
  if (!raw) return null;
  let text = stripHtml(raw);
  for (const pattern of BOILERPLATE_PATTERNS) {
    text = text.replace(pattern, '');
  }
  return text.trim() || null;
}

/**
 * Check if an event is from an off-island library branch.
 */
function isOffIsland(title: string, description: string | null, branchName: string | null): boolean {
  // If we have an explicit branch name, check it
  if (branchName) {
    const lower = branchName.toLowerCase();
    if (WHIDBEY_BRANCHES.some(b => lower.includes(b))) return false;
    return true; // Branch exists but isn't on Whidbey
  }

  // Fall back to keyword check on title + description
  const text = `${title} ${description ?? ''}`.toLowerCase();
  return OFF_ISLAND_KEYWORDS.some(kw => text.includes(kw));
}

type SnoIsleConfig = {
  pageUrl: string;
  location: string;   // e.g. "Langley Library"
  town: string;       // e.g. "Langley"
  source: string;     // e.g. "Langley Library"
  logPrefix: string;  // e.g. "[scrapeLangleyLibrary]"
};

/**
 * Shared Sno-Isle BiblioCommons scraper. Both Langley and Coupeville
 * use this with different config.
 */
export async function scrapeSnoIsleLibrary(config: SnoIsleConfig): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(config.pageUrl, {
      signal: AbortSignal.timeout(6000),
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

      const description = (definition?.description as string) ?? null;

      // Try to get the branch name from the series data
      const branchName = (definition?.branchName as string)
        ?? (definition?.locationName as string)
        ?? (series.branchName as string)
        ?? null;

      // Skip off-island events
      if (isOffIsland(title, description, branchName)) continue;

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
          location: config.location,
          town: config.town,
          category: 'Classes & Workshops',
          description: cleanDesc,
          source: config.source,
        });
      }
    }

    return events;
  } catch (err) {
    console.error(`${config.logPrefix} error:`, err);
    return [];
  }
}
