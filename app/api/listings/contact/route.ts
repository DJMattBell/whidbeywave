import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { listingId, buyerName, buyerEmail, buyerPhone, message } = await req.json();

    if (!listingId || !buyerName?.trim() || !buyerEmail?.trim() || !message?.trim()) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch listing to get seller email + title
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: listing } = await supabase
      .from('listings')
      .select('title, seller_name, contact_email')
      .eq('id', listingId)
      .single();

    if (!listing?.contact_email) {
      return NextResponse.json({ ok: false, error: 'Listing not found' }, { status: 404 });
    }

    await resend.emails.send({
      from: 'WhidbeyWave Marketplace <noreply@whidbeywave.com>',
      to: listing.contact_email,
      replyTo: buyerEmail,
      subject: `Someone is interested in "${listing.title}"`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #292524;">
          <div style="background: #2d5016; color: #fefce8; padding: 28px 32px; border-radius: 16px 16px 0 0;">
            <p style="margin: 0 0 4px; font-size: 13px; color: #bbf7d0; letter-spacing: 0.05em; text-transform: uppercase;">WhidbeyWave Marketplace</p>
            <h1 style="margin: 0; font-size: 22px;">You have a new message!</h1>
          </div>

          <div style="background: #fafaf9; padding: 28px 32px; border: 1px solid #e7e5e4; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="margin: 0 0 20px; font-size: 15px; color: #57534e;">
              Someone on WhidbeyWave is interested in your listing — <strong style="color: #1c1917;">${listing.title}</strong>.
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c; width: 110px;">From</td>
                <td style="padding: 8px 0; color: #1c1917; font-weight: 600;">${buyerName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${buyerEmail}" style="color: #2d5016;">${buyerEmail}</a></td>
              </tr>
              ${buyerPhone ? `
              <tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px 0; color: #78716c;">Phone</td>
                <td style="padding: 8px 0; color: #1c1917;">${buyerPhone}</td>
              </tr>` : ''}
            </table>

            <div style="background: white; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.05em;">Their message</p>
              <p style="margin: 0; font-size: 15px; color: #292524; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="margin: 0 0 4px; font-size: 13px; color: #78716c;">
              To reply, just respond to this email — it will go directly to ${buyerName}.
            </p>
            <p style="margin: 0; font-size: 13px; color: #a8a29e;">
              — The WhidbeyWave team
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact seller error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
