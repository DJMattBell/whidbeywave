import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getResend } from '@/lib/resend';
import { randomUUID } from 'crypto';
import { isValidEmail } from '@/lib/validate';

const resend = getResend();


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email, tags, frequency, weekendDigest } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Insert subscriber with confirmed: false — awaits confirmation click
    const supabase = createServiceClient();

    const confirmationToken = randomUUID();

    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        first_name:          firstName?.trim() || 'Friend',
        email:               normalEmail,
        tags:                tags ?? [],
        frequency:           frequency ?? 'weekly',
        confirmed:           false,
        weekend_digest:      weekendDigest ?? false,
        confirmation_token:  confirmationToken,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        // Check if the existing subscriber is unconfirmed — they may need a resend
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .select('confirmed')
          .eq('email', normalEmail)
          .single();

        if (existing && !existing.confirmed) {
          return NextResponse.json({ error: 'unconfirmed' }, { status: 409 });
        }
        return NextResponse.json({ error: 'duplicate' }, { status: 409 });
      }
      console.error('Newsletter insert error:', insertError);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${confirmationToken}`;

    // Send confirmation email
    const { error: emailError } = await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to:   normalEmail,
      subject: `Please confirm your WhidbeyWave subscription`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
          <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;">🌊</span>
            <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
            <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">
              One last step${firstName?.trim() ? `, ${firstName.trim()}` : ''}.
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

    if (emailError) {
      console.error('Confirmation email error:', emailError);
      // Subscriber is saved — don't fail the request
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
