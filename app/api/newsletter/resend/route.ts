import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getResend } from '@/lib/resend';
import { randomUUID } from 'crypto';

const resend = getResend();


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      // Always 200 — don't reveal whether the email exists
      return NextResponse.json({ ok: true });
    }

    const normalEmail = email.trim().toLowerCase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up subscriber
    const { data: sub } = await supabase
      .from('newsletter_subscribers')
      .select('id, first_name, email, confirmed')
      .eq('email', normalEmail)
      .single();

    // If not found or already confirmed, silently succeed
    if (!sub || sub.confirmed) {
      return NextResponse.json({ ok: true });
    }

    // Rotate token and resend
    const newToken = randomUUID();

    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ confirmation_token: newToken })
      .eq('id', sub.id);

    if (updateError) {
      console.error('[newsletter/resend] token update failed:', updateError);
      return NextResponse.json({ ok: true });
    }

    const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${newToken}`;

    await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to:   normalEmail,
      subject: 'Please confirm your WhidbeyWave subscription',
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
          <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;">🌊</span>
            <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
            <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">
              One last step${sub.first_name ? `, ${sub.first_name}` : ''}.
            </h2>
            <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 20px;">
              Click the button below to confirm your subscription to the WhidbeyWave Weekly.
              You'll get island news, upcoming events, and community updates every Monday morning.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#255c42;border-radius:10px;padding:14px 28px;">
                  <a href="${confirmUrl}"
                     style="color:#fdfaf3;text-decoration:none;font-size:16px;font-weight:bold;">
                    Confirm My Subscription →
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#a8a29e;margin:0;line-height:1.6;">
              If you didn't sign up for this, just ignore this email — you won't hear from us again.<br/>
              WhidbeyWave.com — Written for Whidbey, by Whidbey.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter/resend] error:', err);
    // Always 200
    return NextResponse.json({ ok: true });
  }
}
