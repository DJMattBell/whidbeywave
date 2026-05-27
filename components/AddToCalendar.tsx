'use client';

import { googleCalendarUrl, generateIcs } from '@/lib/calendar';
import type { CalendarEventInput } from '@/lib/calendar';
import { CalendarPlus, Download } from 'lucide-react';

export default function AddToCalendar({ event }: { event: CalendarEventInput }) {
  function downloadIcs() {
    const content = generateIcs(event);
    const blob    = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <CalendarPlus size={14} className="shrink-0 -mt-0.5" aria-hidden="true" /> Add to calendar
      </a>
      <span className="text-parchment-300 select-none" aria-hidden="true">·</span>
      <button
        onClick={downloadIcs}
        className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-800 transition-colors"
        title="Download .ics for Apple Calendar, Outlook, etc."
      >
        <Download size={12} className="shrink-0 -mt-0.5" aria-hidden="true" />&nbsp;.ics
      </button>
    </div>
  );
}
