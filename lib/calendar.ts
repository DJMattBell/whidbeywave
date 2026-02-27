export interface CalendarEventInput {
  title: string;
  date: string;        // YYYY-MM-DD
  time?: string;       // e.g. "10:00 AM – 4:00 PM" or "7:00 PM"
  location?: string;
  description?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Parse "H:MM AM/PM" → [hour24, minute] or null */
function parseTime12(s: string): [number, number] | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return [h, min];
}

function allDayRange(dateStr: string): { start: string; end: string } {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const start = `${y}${pad(mo)}${pad(d)}`;
  // Google Calendar all-day end = exclusive next day
  const next = new Date(y, mo - 1, d + 1);
  const end = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  return { start, end };
}

function parseDates(date: string, time?: string): {
  start: string;
  end: string;
  allDay: boolean;
} {
  if (!time) {
    return { ...allDayRange(date), allDay: true };
  }

  // Split on en-dash (–), em-dash (—), or plain hyphen
  const parts = time.split(/\s*[–—\-]\s*/);
  const startTime = parseTime12(parts[0] ?? '');
  const endTime   = parts[1] ? parseTime12(parts[1]) : null;

  if (!startTime) {
    return { ...allDayRange(date), allDay: true };
  }

  const [y, mo, d] = date.split('-').map(Number);
  const [sh, sm]   = startTime;
  const [eh, em]   = endTime ?? [sh + 1, sm]; // default 1 hour if no end given
  const fmt        = (h: number, min: number) =>
    `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(min)}00`;

  return { start: fmt(sh, sm), end: fmt(eh, em), allDay: false };
}

export function googleCalendarUrl(event: CalendarEventInput): string {
  const { start, end } = parseDates(event.date, event.time);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text:   event.title,
    dates:  `${start}/${end}`,
  });
  if (event.location)    params.set('location', event.location);
  if (event.description) params.set('details',  event.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcs(event: CalendarEventInput): string {
  const { start, end, allDay } = parseDates(event.date, event.time);
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const uid = `${event.date}-${event.title.toLowerCase().replace(/\W+/g, '-')}@whidbeywave.com`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WhidbeyWave//WhidbeyWave//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTAMP:${now}`,
    `UID:${uid}`,
    allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    allDay ? `DTEND;VALUE=DATE:${end}`     : `DTEND:${end}`,
    `SUMMARY:${event.title}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${event.location}`);
  }
  if (event.description) {
    // Escape special chars; fold long lines at 75 chars per RFC 5545
    const escaped = event.description
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/[\r\n]+/g, '\\n');
    let desc = `DESCRIPTION:${escaped}`;
    const folded: string[] = [];
    while (desc.length > 75) {
      folded.push(desc.slice(0, 75));
      desc = ' ' + desc.slice(75);
    }
    folded.push(desc);
    lines.push(folded.join('\r\n'));
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}
