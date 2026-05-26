export type FilterChip = 'everyone' | 'kids' | 'seniors' | 'visitors' | 'new-residents' | 'outdoors';

const VALID_FILTERS: FilterChip[] = ['everyone', 'kids', 'seniors', 'visitors', 'new-residents', 'outdoors'];

/** Server-safe: reads a cookie string and returns a valid FilterChip */
export function getFilterFromCookie(cookieValue: string | undefined): FilterChip {
  if (!cookieValue) return 'everyone';
  if (VALID_FILTERS.includes(cookieValue as FilterChip)) return cookieValue as FilterChip;
  // Old persona values don't map — fall back
  return 'everyone';
}
