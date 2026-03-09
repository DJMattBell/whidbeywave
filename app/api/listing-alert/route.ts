import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    const listing = payload?.record;

    if (!listing?.id || listing.status !== 'approved') {
      // Only fire alerts for approved listings; ignore pending/rejected inserts
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    // Deduplicate by email (a subscriber might match both null + specific category).
    // Keep the first occurrence so we retain the unsubscribe_token.
    const seen = new Set<string>();
    const uniqueSubscribers = subscribers.filter((s: { email: string }) => {
      if (seen.has(s.email)) return false;
      seen.add(s.email);
      return true;
    });

    const photoUrl = listing.images?.[0] ?? null;
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';
    const listingUrl = `${siteUrl}/marketplace`;
    const priceText = listing.is_free
      ? 'Free'
      : listing.price != null
        ? `$${listing.price % 1 === 0 ? listing.price : listing.price.toFixed(2)}`
        : 'Price not listed';
    const photoHtml = photoUrl
      ? `<div style="margin:16px 0;text-align:center;">
           <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(listing.title)}"
             style="max-width:100%;max-height:240px;object-fit:cover;border-radius:10px;border:1px solid #e8dfc8;" />
         </div>`
      : `<div style="margin:16px 0;text-align:center;font-size:48px;">${escapeHtml(listing.emoji || '🏷️')}</div>`;

    let sent = 0;
    for (const sub of uniqueSubscribers) {
      const unsubscribeUrl = `${siteUrl}/api/listings/unsubscribe?token=${encodeURIComponent(sub.unsubscribe_token)}`;
      const emailHtml = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
          <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;">🌊</span>
            <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
            <p style="color:#78716c;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">New listing · Island Marketplace</p>
            <h2 style="color:#1c3d2c;margin:0 0 4px;font-size:22px;line-height:1.3;">${escapeHtml(listing.title)}</h2>
            <p style="color:#b45309;font-size:17px;font-weight:bold;margin:0 0 4px;">${escapeHtml(priceText)}</p>
            <p style="color:#78716c;font-size:13px;margin:0 0 12px;">${escapeHtml(listing.category)} · ${escapeHtml(listing.location)}</p>
            ${photoHtml}
            ${listing.description ? `<p style="color:#57534e;font-size:14px;line-height:1.7;margin:12px 0 20px;border-left:3px solid #e8dfc8;padding-left:12px;">${escapeHtml(listing.description)}</p>` : ''}
            <a href="${listingUrl}"
               style="display:inline-block;background:#1a4a33;color:#fdfaf3;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:15px;font-weight:bold;">
              View on Marketplace →
            </a>
            <p style="font-size:12px;color:#a8a29e;margin-top:28px;border-top:1px solid #f0e8d8;padding-top:16px;">
              You're getting this because you signed up for marketplace alerts on WhidbeyWave.<br/>
              <a href="${unsubscribeUrl}" style="color:#a8a29e;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: sub.email,
          subject: `New listing: ${listing.title}`,
          html: emailHtml,
        });
        sent++;
      } catch {
        // Non-fatal — keep sending to remaining subscribers
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error('listing-alert webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
