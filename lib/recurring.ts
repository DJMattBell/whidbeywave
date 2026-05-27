import type { RecurringEventRow } from './db-types';
import { toPacificDateString } from './scrapers/types';

/**
 * Generate an array of YYYY-MM-DD date strings for a recurring event template
 * within a window from `fromDate` to `fromDate + windowDays`.
 */
export function generateDates(
  template: Pick<RecurringEventRow, 'recurrence_type' | 'day_of_week' | 'day_of_month' | 'custom_interval_days' | 'start_date' | 'end_date'>,
  windowDays = 90,
  fromDate?: Date,
): string[] {
  const from = fromDate ?? new Date();
  const windowEnd = new Date(from);
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  const startDate = new Date(template.start_date + 'T12:00:00');
  const endDate = template.end_date ? new Date(template.end_date + 'T12:00:00') : null;

  // Effective range: max(startDate, from) to min(endDate, windowEnd)
  const rangeStart = startDate > from ? startDate : from;
  const rangeEnd = endDate && endDate < windowEnd ? endDate : windowEnd;

  if (rangeStart > rangeEnd) return [];

  const dates: string[] = [];

  switch (template.recurrence_type) {
    case 'weekly':
    case 'biweekly': {
      const dow = template.day_of_week ?? 0;
      const step = template.recurrence_type === 'biweekly' ? 14 : 7;
      const cur = new Date(rangeStart);
      // Advance to first occurrence of the target day of week
      while (cur.getDay() !== dow) {
        cur.setDate(cur.getDate() + 1);
      }
      // For biweekly, align to the original start_date's week parity
      if (template.recurrence_type === 'biweekly') {
        const refDate = new Date(startDate);
        while (refDate.getDay() !== dow) {
          refDate.setDate(refDate.getDate() + 1);
        }
        // Use calendar day diff to avoid DST hour shifts
        const daysDiff = Math.round((cur.getTime() - refDate.getTime()) / (24 * 60 * 60 * 1000));
        const diffWeeks = Math.floor(daysDiff / 7);
        if (diffWeeks % 2 !== 0) {
          cur.setDate(cur.getDate() + 7);
        }
      }
      while (cur <= rangeEnd) {
        dates.push(toPacificDateString(cur));
        cur.setDate(cur.getDate() + step);
      }
      break;
    }

    case 'monthly': {
      const dom = template.day_of_month ?? 1;
      const cur = new Date(rangeStart);
      cur.setDate(1); // go to first of month
      while (cur <= rangeEnd) {
        const targetDate = new Date(cur.getFullYear(), cur.getMonth(), dom, 12);
        // Handle months that don't have the target day (e.g. Feb 31 → skip)
        if (targetDate.getMonth() === cur.getMonth() && targetDate >= rangeStart && targetDate <= rangeEnd) {
          dates.push(toPacificDateString(targetDate));
        }
        cur.setMonth(cur.getMonth() + 1);
      }
      break;
    }

    case 'custom': {
      const interval = template.custom_interval_days ?? 1;
      // Start from the template's start_date and step forward
      const cur = new Date(startDate);
      // Advance to at least rangeStart
      if (cur < rangeStart) {
        const diffMs = rangeStart.getTime() - cur.getTime();
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        const steps = Math.floor(diffDays / interval);
        cur.setDate(cur.getDate() + steps * interval);
        if (cur < rangeStart) {
          cur.setDate(cur.getDate() + interval);
        }
      }
      while (cur <= rangeEnd) {
        dates.push(toPacificDateString(cur));
        cur.setDate(cur.getDate() + interval);
      }
      break;
    }
  }

  return dates;
}


/** Human-readable recurrence summary, e.g. "Every Saturday" */
export function recurrenceSummary(t: Pick<RecurringEventRow, 'recurrence_type' | 'day_of_week' | 'day_of_month' | 'custom_interval_days'>): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  switch (t.recurrence_type) {
    case 'weekly':
      return `Every ${dayNames[t.day_of_week ?? 0]}`;
    case 'biweekly':
      return `Every other ${dayNames[t.day_of_week ?? 0]}`;
    case 'monthly':
      return `Monthly on the ${ordinal(t.day_of_month ?? 1)}`;
    case 'custom':
      return `Every ${t.custom_interval_days} days`;
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
