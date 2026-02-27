export type MarketplaceListing = {
  id: string;
  title: string;
  price: number | null;
  is_free: boolean;
  category: string;
  location: string;
  description: string | null;
  seller_name: string;
  emoji: string;
  images: string[];
  sold: boolean;
  expires_at: string | null;
  created_at: string;
  user_id: string | null;
  contact_method: string | null;
};

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatPrice(price: number | null, is_free: boolean): string {
  if (is_free) return 'Free';
  if (price === null || price === undefined) return 'Contact for price';
  return `$${price % 1 === 0 ? price.toString() : price.toFixed(2)}`;
}

/** Returns whole days until expiry (negative = already expired). Null if no expiry set. */
export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}
