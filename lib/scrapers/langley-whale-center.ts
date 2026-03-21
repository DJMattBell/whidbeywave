import type { ScrapedEvent } from './types';

// Orca Network / Langley Whale Center events — Squarespace JSON API
const WHALE_CENTER_URL = 'https://www.orcanetwork.org/events?format=json';

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Convert ms timestamp to YYYY-MM-DD */
function formatDate(ms: number): string {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Convert ms timestamp to HH:MM AM/PM */
function formatTime(ms: number): string {
  const d = new Date(ms);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export async function scrapeLangleyWhaleCenter(): Promise<ScrapedEvent[]> {
  try {
    const res = await fetch(WHALE_CENTER_URL, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'WhidbeyWave/1.0 (+https://whidbeywave.com)' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const upcoming: unknown[] = data?.upcoming ?? [];

    const events: ScrapedEvent[] = [];

    for (const item of upcoming) {
      const evt = item as Record<string, unknown>;

      const title = typeof evt.title === 'string' ? evt.title.trim() : '';
      if (!title) continue;

      const startDate = typeof evt.startDate === 'number' ? evt.startDate : null;
      if (!startDate) continue;

      const date = formatDate(startDate);
      const time = formatTime(startDate);

      // Build description from excerpt, stripped of HTML
      let description: string | null = null;
      if (typeof evt.excerpt === 'string' && evt.excerpt.trim()) {
        description = stripHtml(evt.excerpt).slice(0, 1000) || null;
      }

      // Build location string from location object if available
      let location: string | null = 'Langley Whale Center';
      if (evt.location && typeof evt.location === 'object') {
        const loc = evt.location as Record<string, unknown>;
        const parts: string[] = [];
        if (typeof loc.addressLine1 === 'string' && loc.addressLine1) parts.push(loc.addressLine1);
        if (typeof loc.addressLine2 === 'string' && loc.addressLine2) parts.push(loc.addressLine2);
        if (typeof loc.addressCountry === 'string' && loc.addressCountry) parts.push(loc.addressCountry);
        if (parts.length > 0) location = parts.join(', ');
      }

      events.push({
        title,
        date,
        time,
        location,
        town: 'Langley',
        category: 'Nature & Wildlife',
        description,
        source: 'Langley Whale Center',
      });
    }

    return events;
  } catch (err) {
    console.error('[scrapeLangleyWhaleCenter] error:', err);
    return [];
  }
}
