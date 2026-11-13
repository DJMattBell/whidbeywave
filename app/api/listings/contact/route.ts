import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { createServiceClient } from '@/lib/supabase';
import { isValidEmail } from '@/lib/validate';
import { emailListingContact } from '@/lib/email';

const resend = getResend();
export async function POST(req: NextRequest) {
  try {
    const { listingId, buyerName, buyerEmail, buyerPhone, message } = await req.json();

    if (!listingId || !buyerName?.trim() || !buyerEmail?.trim() || !message?.trim()) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidEmail(buyerEmail.trim())) {
      return NextResponse.json({ ok: false, error: 'Invalid email address' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ ok: false, error: 'Message must be 5,000 characters or fewer' }, { status: 400 });
    }

    // Fetch listing to get seller email + title
    const supabase = createServiceClient();

    const { data: listing } = await supabase
      .from('listings')
      .select('title, seller_name, contact_email')
      .eq('id', listingId)
      .single();

    if (!listing?.contact_email) {
      return NextResponse.json({ ok: false, error: 'Listing not found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

    await resend.emails.send({
      from: 'WhidbeyWave Marketplace <noreply@whidbeywave.com>',
      to: listing.contact_email,
      replyTo: buyerEmail,
      subject: `Someone is interested in "${listing.title}"`,
      html: emailListingContact({
        listingTitle: listing.title,
        buyerName,
        buyerEmail,
        buyerPhone,
        message,
        listingUrl: `${siteUrl}/marketplace/${listingId}`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact seller error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
