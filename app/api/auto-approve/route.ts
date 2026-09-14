import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getResend } from '@/lib/resend';
import { verifyCronRequest } from '@/lib/cronAuth';
import { escapeHtml } from '@/lib/escapeHtml';

export const dynamic = 'force-dynamic';

const resend = getResend();

/**
 * Monday-morning auto-approve cron.
 *
 * Approves all pending event submissions and marketplace listings that are NOT
 * duplicates of already-approved items. The admin reviews Sunday night and
 * deletes anything they don't want approved before this runs.
 *
 * Duplicate detection:
 *   Events  — same title (case-insensitive) AND same date as an approved event
 *   Listings — same title (case-insensitive) as an active approved listing
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const supabase = createServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';
  const now = new Date().toISOString();

  const results = { events: { approved: 0, skippedDuplicates: 0 }, listings: { approved: 0, skippedDuplicates: 0 } };

  // ── Events ──────────────────────────────────────────────────────────
  const { data: pendingEvents } = await supabase
    .from('event_submissions')
    .select('id, title, date, time, location, town, submitter_name, submitter_email')
    .eq('status', 'pending');

  if (pendingEvents && pendingEvents.length > 0) {
    // Get all approved events for duplicate checking
    const { data: approvedEvents } = await supabase
      .from('event_submissions')
      .select('title, date')
      .eq('status', 'approved');

    const approvedSet = new Set(
      (approvedEvents ?? []).map(e => `${e.title.toLowerCase().trim()}|${e.date}`)
    );

    // Collect approved events grouped by submitter email for batched emails
    const approvedBySubmitter = new Map<string, typeof pendingEvents>();

    for (const event of pendingEvents) {
      const key = `${event.title.toLowerCase().trim()}|${event.date}`;
      if (approvedSet.has(key)) {
        results.events.skippedDuplicates++;
        continue;
      }

      const { error } = await supabase
        .from('event_submissions')
        .update({ status: 'approved', reviewed_at: now })
        .eq('id', event.id);

      if (error) {
        console.error(`Auto-approve event ${event.id} failed:`, error);
        continue;
      }

      approvedSet.add(key);
      results.events.approved++;

      // Group by submitter email for batched notifications
      if (event.submitter_email) {
        const emailKey = event.submitter_email.toLowerCase().trim();
        const group = approvedBySubmitter.get(emailKey) ?? [];
        group.push(event);
        approvedBySubmitter.set(emailKey, group);
      }
    }

    // Send one email per submitter with all their approved events
    for (const [, events] of approvedBySubmitter) {
      const first = events[0];
      const isBatch = events.length > 1;

      const eventRows = events.map(e => {
        const d = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        return `
          <tr><td style="padding:12px 20px;border-bottom:1px solid #e8dfc8;">
            <strong style="color:#1c3d2c;">${escapeHtml(e.title)}</strong><br/>
            <span style="font-size:14px;color:#57534e;">${escapeHtml(d)} · ${escapeHtml(e.time)} · ${escapeHtml(e.location)}, ${escapeHtml(e.town)}</span>
          </td></tr>`;
      }).join('');

      const subject = isBatch
        ? `Your ${events.length} events are live on WhidbeyWave`
        : `Your event "${first.title}" is live on WhidbeyWave`;

      const heading = isBatch ? 'Your events are live!' : 'Your event is live!';
      const body = isBatch
        ? `Good news, ${escapeHtml(first.submitter_name)} — your ${events.length} events have been approved and are now showing on the WhidbeyWave events calendar.`
        : `Good news, ${escapeHtml(first.submitter_name)} — your event has been approved and is now showing on the WhidbeyWave events calendar.`;

      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: first.submitter_email,
          subject,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
              <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
                <span style="font-size:24px;">🌊</span>
                <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
              </div>
              <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
                <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">${heading}</h2>
                <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 16px;">${body}</p>
                <table width="100%" style="background:#fdfaf3;border-radius:10px;border:1px solid #e8dfc8;margin-bottom:20px;">
                  ${eventRows}
                </table>
                <a href="${siteUrl}/events" style="display:inline-block;background:#255c42;color:#fdfaf3;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
                  View on WhidbeyWave →
                </a>
                <p style="font-size:13px;color:#a8a29e;margin-top:20px;">WhidbeyWave · Whidbey Island, WA</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Auto-approve event email failed (non-fatal):', emailErr);
      }
    }
  }

  // ── Listings ────────────────────────────────────────────────────────
  const { data: pendingListings } = await supabase
    .from('listings')
    .select('id, title, seller_name, contact_email')
    .eq('status', 'pending');

  if (pendingListings && pendingListings.length > 0) {
    // Get approved listings for duplicate checking
    const { data: approvedListings } = await supabase
      .from('listings')
      .select('title')
      .eq('status', 'approved');

    const approvedTitles = new Set(
      (approvedListings ?? []).map(l => l.title.toLowerCase().trim())
    );

    // Collect approved listings grouped by seller email for batched emails
    const approvedBySeller = new Map<string, typeof pendingListings>();

    for (const listing of pendingListings) {
      const titleKey = listing.title.toLowerCase().trim();
      if (approvedTitles.has(titleKey)) {
        results.listings.skippedDuplicates++;
        continue;
      }

      const { error } = await supabase
        .from('listings')
        .update({ status: 'approved' })
        .eq('id', listing.id);

      if (error) {
        console.error(`Auto-approve listing ${listing.id} failed:`, error);
        continue;
      }

      approvedTitles.add(titleKey);
      results.listings.approved++;

      if (listing.contact_email) {
        const emailKey = listing.contact_email.toLowerCase().trim();
        const group = approvedBySeller.get(emailKey) ?? [];
        group.push(listing);
        approvedBySeller.set(emailKey, group);
      }
    }

    // Send one email per seller with all their approved listings
    for (const [, listings] of approvedBySeller) {
      const first = listings[0];
      const isBatch = listings.length > 1;

      const listingRows = listings.map(l => `
        <tr><td style="padding:12px 20px;border-bottom:1px solid #e8dfc8;">
          <strong style="color:#1c3d2c;">${escapeHtml(l.title)}</strong>
        </td></tr>`).join('');

      const subject = isBatch
        ? `Your ${listings.length} listings are live on WhidbeyWave`
        : `Your listing "${first.title}" is live on WhidbeyWave`;

      const heading = isBatch ? 'Your listings are live!' : 'Your listing is live!';
      const body = isBatch
        ? `Great news, ${escapeHtml(first.seller_name)} — your ${listings.length} listings are now on the WhidbeyWave marketplace.`
        : `Great news, ${escapeHtml(first.seller_name)} — your listing for <strong>${escapeHtml(first.title)}</strong> is now on the WhidbeyWave marketplace.`;

      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: first.contact_email,
          subject,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
              <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
                <span style="font-size:24px;">🌊</span>
                <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
              </div>
              <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
                <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">${heading}</h2>
                <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 16px;">${body}</p>
                <table width="100%" style="background:#fdfaf3;border-radius:10px;border:1px solid #e8dfc8;margin-bottom:20px;">
                  ${listingRows}
                </table>
                <a href="${siteUrl}/marketplace" style="display:inline-block;background:#255c42;color:#fdfaf3;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
                  View the Marketplace →
                </a>
                <p style="font-size:13px;color:#a8a29e;margin-top:20px;">WhidbeyWave · Whidbey Island, WA</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Auto-approve listing email failed (non-fatal):', emailErr);
      }
    }
  }

  console.log('Auto-approve results:', JSON.stringify(results));
  return NextResponse.json({ ok: true, ...results });
}
