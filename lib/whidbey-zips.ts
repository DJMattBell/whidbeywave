// Whidbey Island zip codes
export const WHIDBEY_ZIPS = new Set([
  '98236', // Clinton
  '98239', // Coupeville
  '98249', // Freeland
  '98253', // Greenbank
  '98260', // Langley
  '98277', // Oak Harbor
  '98278', // Oak Harbor / NAS Whidbey Island
]);

export function isWhidbeyLocal(zip: string | null | undefined): boolean {
  if (!zip) return false;
  return WHIDBEY_ZIPS.has(zip.trim());
}
