import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { createServiceClient } from '@/lib/supabase';
import { escapeHtml } from '@/lib/escapeHtml';
import { emailNewListing } from '@/lib/email';
import { formatPrice } from '@/lib/marketplace';
import { verifyCronRequest } from '@/lib/cronAuth';

// Supabase webhook payload wraps the new row under `record`
type WebhookPayload = {
  record: {
    id: string;
    title: string;
    price: number | null;
    is_free: boolean;
    category: string;
    location: string;
    description: string | null;
    images: string[];
    emoji: string;
    status: string;
  };
};

// Auth: This endpoint uses verifyCronRequest which checks for either the
// x-vercel-cron header or an Authorization: Bearer <CRON_SECRET> header.
// When configuring the Supabase webhook, set the HTTP header to:
//   Authorization: Bearer <CRON_SECRET>
// where CRON_SECRET matches the environment variable on the server.
export async function POST(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  try {
    const payload: WebhookPayload = await request.json();
    const listing = payload?.record;

    if (!listing?.id || listing.status !== 'approved') {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabase = createServiceClient();
    const resend = getResend();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

    // Query subscribers who want this category OR "All" (null category = all)
    const { data: subscribers, error } = await supabase
      .from('listing_alerts')
      .select('email, category, unsubscribe_token')
      .or(`category.is.null,category.eq.${listing.category}`);

    if (error) {
      console.error('listing_alerts query error:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    // Deduplicate by email (a subscriber might match both null + specific category)
    const seen = new Set<string>();
    const uniqueSubscribers = subscribers.filter((s: { email: string }) => {
      if (seen.has(s.email)) return false;
      seen.add(s.email);
      return true;
    });

    const priceText = formatPrice(listing.price, listing.is_free);
    const listingUrl = `${siteUrl}/marketplace`;

    let sent = 0;
    for (const sub of uniqueSubscribers) {
      const unsubscribeUrl = `${siteUrl}/api/listings/unsubscribe?token=${encodeURIComponent(sub.unsubscribe_token)}`;
      const html = emailNewListing({
        title: listing.title,
        priceText,
        category: listing.category,
        location: listing.location,
        description: listing.description,
        photoUrl: listing.images?.[0] ?? null,
        emoji: listing.emoji,
        listingUrl,
        unsubscribeUrl,
      });

      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: sub.email,
          subject: `New listing: ${escapeHtml(listing.title)}`,
          html,
        });
        sent++;
      } catch {
        // Non-fatal — keep sending to remaining subscribers
      }
    }

    // Log to notification_log for observability
    try {
      await supabase.from('notification_log').insert(
        uniqueSubscribers.map((sub: { email: string }) => ({
          user_id: '00000000-0000-0000-0000-000000000000', // anonymous subscriber
          event_type: 'new_listing_alert',
          channel: 'email',
          status: 'sent' as const,
          error: null,
        })).slice(0, sent)
      );
    } catch {
      // Non-fatal — logging failure doesn't block alert delivery
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error('listing-alert webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
