import * as cheerio from 'cheerio';
import type { ScrapedEvent } from './types';

const PAGE_URL = 'https://sno-isle.bibliocommons.com/v2/events?location=langley';

/**
 * Extract embedded JSON state from BiblioCommons SPA.
 * The page renders via React and embeds initial data in a <script> tag
 * (e.g. window.__INITIAL_STATE__ or a JSON blob containing "eventSeries").
 */
function extractEmbeddedState(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  let state: Record<string, unknown> | null = null;

  $('script').each((_, el) => {
    if (state) return; // already found
    const content = $(el).html();
    if (!content) return;

    // Look for script content that contains eventSeries data
    if (!content.includes('eventSeries') && !content.includes('entities')) return;

    // Strategy 1: window.__INITIAL_STATE__ = {...}
    const assignMatch = content.match(
      /window\.__[A-Z_]+__\s*=\s*(\{[\s\S]*\})\s*;?\s*$/
    );
    if (assignMatch) {
      try {
        state = JSON.parse(assignMatch[1]);
        return;
      } catch { /* try next strategy */ }
    }

    // Strategy 2: The entire script content is JSON
    try {
      const parsed = JSON.parse(content.trim());
      if (typeof parsed === 'object' && parsed !== null) {
        state = parsed;
        return;
      }
    } catch { /* try next strategy */ }

    // Strategy 3: Find the largest JSON object in the script
    const jsonMatch = content.match(/(\{[\s\S]*"eventSeries"[\s\S]*\})/);
    if (jsonMatch) {
      // Walk forward from the match to find balanced braces
      const startIdx = content.indexOf(jsonMatch[0]);
      let depth = 0;
      let endIdx = startIdx;
      for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
      try {
        state = JSON.parse(content.slice(startIdx, endIdx));
      } catch { /* give up on this script tag */ }
    }
  });

  return state;
}

/**
 * Recursively search an object for the "eventSeries" map.
 */
function findEventSeries(obj: unknown): Record<string, unknown> | null {
  if (obj === null || typeof obj !== 'object') return null;

  const record = obj as Record<string, unknown>;

  // Direct hit
  if ('eventSeries' in record && typeof record.eventSeries === 'object' && record.eventSeries !== null) {
    return record.eventSeries as Record<string, unknown>;
  }

  // Check inside entities
  if ('entities' in record && typeof record.entities === 'object' && record.entities !== null) {
    const entities = record.entities as Record<string, unknown>;
    if ('eventSeries' in entities && typeof entities.eventSeries === 'object' && entities.eventSeries !== null) {
      return entities.eventSeries as Record<string, unknown>;
    }
  }

  // Recurse one level into top-level keys
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
 * Format an ISO 8601 timestamp to YYYY-MM-DD.
 */
function isoToDate(iso: string): string | null {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return null;
  }
}

/**
 * Format an ISO 8601 timestamp to a human-readable time like "10:00 AM".
 */
function isoToTime(iso: string): string | null {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  } catch {
    return null;
  }
}

/**
 * Build a time range string from start and end ISO timestamps.
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
 * Scrape Langley Library events from the Sno-Isle BiblioCommons SPA.
 * Extracts event data from embedded JSON in <script> tags.
 */
export async function scrapeLangleyLibrary(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(PAGE_URL, {
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

      // Extract definition (title, description)
      const definition = series.definition as Record<string, unknown> | undefined;
      const title = (definition?.title as string) ?? '';
      if (!title) continue;

      const description = (definition?.description as string) ?? null;

      // Extract event timestamps from recurrencePatterns or eventKeys
      const timestamps: string[] = [];

      // recurrencePatterns may contain start/end times
      const recurrencePatterns = series.recurrencePatterns as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(recurrencePatterns)) {
        for (const pattern of recurrencePatterns) {
          const start = pattern.start as string | undefined;
          const end = pattern.end as string | undefined;
          if (start) {
            timestamps.push(start);
            // Store end time keyed by start for time range building
            if (end) {
              (pattern as Record<string, unknown>)._endForStart = end;
            }
          }
        }
      }

      // eventKeys often contain ISO timestamps or date-keyed entries
      const eventKeys = series.eventKeys as Array<string | Record<string, unknown>> | undefined;
      if (Array.isArray(eventKeys)) {
        for (const key of eventKeys) {
          if (typeof key === 'string') {
            // Could be an ISO timestamp or a composite key containing one
            const isoMatch = String(key).match(/(\d{4}-\d{2}-\d{2}T[\d:]+(?:[+-]\d{2}:?\d{2}|Z)?)/);
            if (isoMatch) {
              timestamps.push(isoMatch[1]);
            }
          } else if (typeof key === 'object' && key !== null) {
            const start = (key as Record<string, unknown>).start as string | undefined;
            if (start) timestamps.push(start);
          }
        }
      }

      // If no timestamps found, try top-level start/nextOccurrence fields
      if (timestamps.length === 0) {
        const nextOccurrence = series.nextOccurrence as string | undefined;
        const startTime = series.start as string | undefined;
        if (nextOccurrence) timestamps.push(nextOccurrence);
        else if (startTime) timestamps.push(startTime);
      }

      // Build events from each timestamp
      for (const ts of timestamps) {
        const date = isoToDate(ts);
        if (!date) continue;

        // Try to find matching end time from recurrencePatterns
        let endTs: string | undefined;
        if (Array.isArray(recurrencePatterns)) {
          const matchingPattern = recurrencePatterns.find(p => p.start === ts);
          if (matchingPattern) {
            endTs = matchingPattern.end as string | undefined;
          }
        }

        const time = buildTimeRange(ts, endTs);

        // Strip HTML tags from description if present
        const cleanDescription = description
          ? description.replace(/<[^>]*>/g, '').trim() || null
          : null;

        events.push({
          title,
          date,
          time,
          location: 'Langley Library',
          town: 'Langley',
          category: 'Classes & Workshops',
          description: cleanDescription,
          source: 'Langley Library',
        });
      }
    }

    return events;
  } catch (err) {
    console.error('[scrapeLangleyLibrary] error:', err);
    return [];
  }
}
