import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { createServiceClient } from '@/lib/supabase';
import { Resend } from 'resend';
import { emailLayout, emailButton } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';
const TRANSITION_DEADLINE = '2026-07-25'; // 60 days from deploy
const BATCH_SIZE = 50;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildTransitionEmail(): string {
  return emailLayout({
    title: 'Action needed: sign in to keep getting marketplace alerts',
    headerSubtitle: 'Marketplace Alerts',
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#57534e;line-height:1.7;">
        Hey there — we're upgrading how WhidbeyWave marketplace alerts work.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#57534e;line-height:1.7;">
        Starting soon, listing notifications will be tied to your WhidbeyWave
        account instead of just your email. This means you'll get more control:
        filter by category, choose email vs push, and manage everything from
        your profile.
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#57534e;line-height:1.7;">
        To keep receiving alerts, <strong>sign in at whidbeywave.com/marketplace
        before ${new Date(TRANSITION_DEADLINE).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
        If you don't have an account yet, signing up takes 10 seconds.
      </p>
      ${emailButton(`${SITE_URL}/marketplace`, 'Sign in to keep alerts')}
      <p style="margin:20px 0 0;font-size:13px;color:#a8a29e;line-height:1.6;">
        If you do nothing, your subscription will quietly expire after the
        deadline. No spam, no hassle.
      </p>
    `,
  });
}

/**
 * POST /api/listings/migrate-alerts
 * Admin-only, one-time use. Sends transition emails to all listing_alerts
 * rows that haven't been migrated or already emailed.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }
  const resend = new Resend(resendKey);
  const supabase = createServiceClient();

  // Fetch all unmigrated, un-emailed rows
  const { data: rows, error: fetchError } = await supabase
    .from('listing_alerts')
    .select('id, email')
    .is('migrated_to_user_id', null)
    .is('transition_email_sent_at', null)
    .order('created_at', { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to fetch listing_alerts', detail: fetchError.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No pending rows' });
  }

  const html = buildTransitionEmail();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      await resend.emails.send({
        from: 'WhidbeyWave <noreply@whidbeywave.com>',
        to: row.email,
        subject: 'Action needed: sign in to keep getting marketplace alerts',
        html,
      });

      // Stamp the row as emailed
      await supabase
        .from('listing_alerts')
        .update({ transition_email_sent_at: new Date().toISOString() })
        .eq('id', row.id);

      sent++;
    } catch {
      failed++;
    }

    // Sleep 1s between batches of BATCH_SIZE
    if ((i + 1) % BATCH_SIZE === 0 && i + 1 < rows.length) {
      await sleep(1000);
    }
  }

  return NextResponse.json({ sent, failed, total: rows.length, deadline: TRANSITION_DEADLINE });
}
