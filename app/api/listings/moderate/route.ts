import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { id, action } = await request.json() as { id: string; action: 'approved' | 'rejected' };

    if (!id || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: listing, error: fetchError } = await supabase
      .from('marketplace_listings')
      .select('id, title, seller_name, seller_email')
      .eq('id', id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update({ status: action })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    // Send seller confirmation email when approved
    if (action === 'approved' && listing.seller_email) {
      try {
        await resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: listing.seller_email,
          subject: `Your listing "${listing.title}" is live on WhidbeyWave`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
              <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
                <span style="font-size:24px;">🌊</span>
                <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
              </div>
              <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
                <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">Great news, ${listing.seller_name}!</h2>
                <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 16px;">
                  Your listing for <strong>${listing.title}</strong> is now live on the WhidbeyWave marketplace.
                  Your neighbors can see it and get in touch with you directly.
                </p>
                <a href="https://whidbeywave.com/marketplace"
                   style="display:inline-block;background:#2d5016;color:#fdfaf3;font-weight:600;font-size:15px;padding:12px 24px;border-radius:12px;text-decoration:none;margin-bottom:20px;">
                  View the Marketplace →
                </a>
                <p style="font-size:13px;color:#a8a29e;margin:0;">
                  Questions? Just reply to this email.<br/>
                  WhidbeyWave · Whidbey Island, WA
                </p>
              </div>
            </div>
          `,
        });
      } catch {
        // Non-fatal — listing is still approved
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Listing moderate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
