/** Browser-only — never import at the top level of a server module. */

const STORAGE_KEY = 'ww_my_listings';

type OwnedListing = { id: string; email: string; title: string };

function readAll(): OwnedListing[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/** Call after a listing is successfully submitted. */
export function storeOwnedListing(id: string, email: string, title: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = [
      ...readAll().filter(l => l.id !== id),
      { id, email, title },
    ].slice(-30); // cap at 30 entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

/**
 * Returns the stored seller email for a listing, or null if this browser
 * has no ownership record for it.
 */
export function getOwnerEmail(listingId: string): string | null {
  return readAll().find(l => l.id === listingId)?.email ?? null;
}
