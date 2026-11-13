import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getResend } from '@/lib/resend';
import { verifyCronRequest } from '@/lib/cronAuth';
import { emailApprovalBatch } from '@/lib/email';

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
 *   Events  — same title + date + location (case-insensitive, matching DB unique constraint)
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
      .select('title, date, location')
      .eq('status', 'approved');

    const approvedSet = new Set(
      (approvedEvents ?? []).map(e => `${e.title.toLowerCase().trim()}|${e.date}|${(e.location ?? '').toLowerCase().trim()}`)
    );

    // Collect approved events grouped by submitter email for batched emails
    const approvedBySubmitter = new Map<string, typeof pendingEvents>();

    for (const event of pendingEvents) {
      const key = `${event.title.toLowerCase().trim()}|${event.date}|${(event.location ?? '').toLowerCase().trim()}`;
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

      // Group by submitter email for batched notifications.
      // Skip scraper-submitted events — no real recipient.
      if (event.submitter_email && event.submitter_email !== 'noreply@whidbeywave.com') {
        const emailKey = event.submitter_email.toLowerCase().trim();
        const group = approvedBySubmitter.get(emailKey) ?? [];
        group.push(event);
        approvedBySubmitter.set(emailKey, group);
      }
    }

    // Send one email per submitter with all their approved events,
    // using the shared emailApprovalBatch template.
    for (const [, events] of approvedBySubmitter) {
      const first = events[0];

      const items = events.map(e => {
        const d = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        return { title: e.title, detail: `${d} · ${e.time} · ${e.location}, ${e.town}` };
      });

      const subject = events.length > 1
        ? `Your ${events.length} events are live on WhidbeyWave`
        : `Your event "${first.title}" is live on WhidbeyWave`;

      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: first.submitter_email,
          subject,
          html: emailApprovalBatch({
            type: 'event',
            items,
            recipientName: first.submitter_name,
            viewUrl: `${siteUrl}/events`,
          }),
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

    // Send one email per seller with all their approved listings,
    // using the shared emailApprovalBatch template.
    for (const [, listings] of approvedBySeller) {
      const first = listings[0];

      const items = listings.map(l => ({ title: l.title }));

      const subject = listings.length > 1
        ? `Your ${listings.length} listings are live on WhidbeyWave`
        : `Your listing "${first.title}" is live on WhidbeyWave`;

      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: first.contact_email,
          subject,
          html: emailApprovalBatch({
            type: 'listing',
            items,
            recipientName: first.seller_name,
            viewUrl: `${siteUrl}/marketplace`,
          }),
        });
      } catch (emailErr) {
        console.error('Auto-approve listing email failed (non-fatal):', emailErr);
      }
    }
  }

  console.log('Auto-approve results:', JSON.stringify(results));
  return NextResponse.json({ ok: true, ...results });
}
