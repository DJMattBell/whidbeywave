import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getResend } from '@/lib/resend';

const resend = getResend();


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: sub, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, first_name, email, confirmed')
      .eq('confirmation_token', token)
      .single();

    if (fetchError || !sub) {
      return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
    }

    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ confirmed: true, confirmation_token: null })
      .eq('id', sub.id);

    if (updateError) {
      return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
    }

    // Send welcome email (non-fatal)
    try {
      await resend.emails.send({
        from: 'WhidbeyWave <hello@whidbeywave.com>',
        to: sub.email,
        subject: `You're in, ${sub.first_name} — welcome to the WhidbeyWave Weekly 🌊`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
            <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
              <span style="font-size:24px;">🌊</span>
              <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
            </div>
            <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
              <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">
                Welcome to the neighborhood, ${sub.first_name}. 🌿
              </h2>
              <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Your subscription is confirmed. You'll receive the WhidbeyWave Weekly every Monday morning —
                upcoming events, island news, and a little of what makes this place worth living in.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:#255c42;border-radius:10px;padding:12px 24px;">
                    <a href="${SITE_URL}" style="color:#fdfaf3;text-decoration:none;font-size:14px;font-weight:bold;">
                      Visit WhidbeyWave.com →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;color:#a8a29e;margin:0;line-height:1.6;">
                WhidbeyWave.com — Written for Whidbey, by Whidbey.
              </p>
            </div>
          </div>
        `,
      });
    } catch {
      // Non-fatal — subscriber is confirmed regardless
    }

    return NextResponse.redirect(new URL('/newsletter?confirmed=true', SITE_URL));
  } catch {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }
}
