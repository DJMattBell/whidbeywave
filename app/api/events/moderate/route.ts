import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = getResend();
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if ('error' in auth) return auth.error;

    const { id, action, admin_notes } = await request.json();

    if (!id || !action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Update submission status
    const { data: submission, error } = await supabase
      .from('event_submissions')
      .update({ status: action, admin_notes: admin_notes || null, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

    // Email submitter on approval (non-fatal — DB update already succeeded)
    if (action === 'approved' && submission.submitter_email) {
      const eventDate = new Date(submission.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      try { await resend.emails.send({
        from: 'WhidbeyWave <hello@whidbeywave.com>',
        to: submission.submitter_email,
        subject: `Your event "${submission.title}" is live on WhidbeyWave 🌊`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8" /></head>
          <body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
              <tr><td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(101,65,20,0.10);">
                  <tr>
                    <td style="background:#1a4a33;padding:24px 32px;">
                      <span style="font-size:24px;">🌊</span>
                      <span style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#fdfaf3;margin-left:10px;">WhidbeyWave</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <h1 style="font-size:22px;color:#1c3d2c;margin:0 0 12px;">Your event is live! 🌿</h1>
                      <p style="font-size:15px;color:#57534e;line-height:1.7;margin:0 0 20px;">
                        Good news, ${escapeHtml(submission.submitter_name)} — your event has been approved
                        and is now showing on the WhidbeyWave events calendar.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfaf3;border-radius:10px;border:1px solid #e8dfc8;margin-bottom:24px;">
                        <tr><td style="padding:20px 24px;">
                          <p style="font-size:18px;font-weight:bold;color:#1c3d2c;margin:0 0 8px;">${escapeHtml(submission.title)}</p>
                          <p style="font-size:14px;color:#57534e;margin:0 0 4px;">📅 ${escapeHtml(eventDate)}</p>
                          <p style="font-size:14px;color:#57534e;margin:0 0 4px;">🕐 ${escapeHtml(submission.time)}</p>
                          <p style="font-size:14px;color:#57534e;margin:0;">📍 ${escapeHtml(submission.location)}, ${escapeHtml(submission.town)}</p>
                        </td></tr>
                      </table>
                      ${admin_notes ? `<p style="font-size:14px;color:#57534e;background:#f7f0e2;padding:12px 16px;border-radius:8px;margin-bottom:20px;"><strong>Note from our team:</strong> ${escapeHtml(admin_notes)}</p>` : ''}
                      <table cellpadding="0" cellspacing="0">
                        <tr><td style="background:#255c42;border-radius:10px;padding:12px 24px;">
                          <a href="${siteUrl}/events" style="color:#fdfaf3;text-decoration:none;font-size:14px;font-weight:bold;">
                            View on WhidbeyWave →
                          </a>
                        </td></tr>
                      </table>
                      <p style="font-size:13px;color:#a8a29e;margin-top:24px;">
                        Thank you for contributing to our community calendar.
                        WhidbeyWave · Whidbey Island, WA
                      </p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      }); } catch (emailErr) {
        console.error('Approval email failed (non-fatal):', emailErr);
      }
    }

    return NextResponse.json({ ok: true, status: action });
  } catch (err) {
    console.error('Moderate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
