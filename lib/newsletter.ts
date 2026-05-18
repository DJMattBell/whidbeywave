import { createHmac } from 'crypto';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

/** Generate an HMAC-based unsubscribe token for a given email. */
export function unsubscribeToken(email: string): string {
  const secret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'whidbeywave';
  return createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex').slice(0, 32);
}

/** Build a full unsubscribe URL for a given subscriber email. */
export function unsubscribeUrl(email: string): string {
  const token = unsubscribeToken(email);
  return `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
