import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml } from '@/lib/escapeHtml';
import { Validator, ALLOWED_LISTING_CATEGORIES } from '@/lib/validate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      title, price, is_free, category, location,
      description, contact_method, contact_email, contact_phone, images,
      bedrooms, bathrooms, neighborhood, available_date,
    } = await request.json();

    const v = new Validator();
    v.required(title, 'Title')
     .minLength(title, 3, 'Title')
     .maxLength(title, 120, 'Title')
     .required(description, 'Description')
     .minLength(description, 10, 'Description')
     .maxLength(description, 3000, 'Description')
     .required(contact_email, 'Contact email')
     .email(contact_email, 'Contact email')
     .maxLength(contact_phone, 30, 'Phone number')
     .maxLength(location, 200, 'Location')
     .oneOf(category, ALLOWED_LISTING_CATEGORIES, 'Category')
     .maxItems(images, 8, 'Images');

    if (!is_free && price !== undefined && price !== null && price !== '') {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
      }
    }

    if (!v.ok()) {
      return NextResponse.json({ error: v.firstError() }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Verify auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Derive seller display name from user metadata
    const sellerName = (
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email ??
      'Anonymous'
    ) as string;

    // Normalise price
    const priceValue = is_free ? null : (price != null && price !== '' ? Number(price) : null);

    let insertedId: string | null = null;
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: title.trim(),
          price: priceValue,
          is_free: Boolean(is_free),
          category: category || 'Other',
          location: location || 'Whidbey Island',
          description: description.trim(),
          seller_name: sellerName,
          contact_email: contact_email.trim(),
          contact_phone: contact_phone?.trim() || null,
          contact_method: contact_method || null,
          images: Array.isArray(images) ? images.slice(0, 8) : [],
          emoji: '🏷️',
          status: 'pending',
          user_id: user.id,
          ...(category === 'Housing' && {
            bedrooms:       bedrooms || null,
            bathrooms:      bathrooms || null,
            neighborhood:   neighborhood || null,
            available_date: available_date || null,
          }),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ ok: false, error: 'Failed to save listing' }, { status: 500 });
      } else {
        insertedId = data?.id ?? null;
      }
    } catch (dbErr) {
      console.error('Supabase insert error:', dbErr);
      return NextResponse.json({ ok: false, error: 'Failed to save listing' }, { status: 500 });
    }

    // Email admin
    const priceDisplay = is_free ? 'Free' : (priceValue != null ? `$${priceValue}` : 'Contact for price');
    await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to: adminEmail,
      replyTo: contact_email.trim(),
      subject: `New marketplace listing: "${title.trim()}"`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
          <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;">🌊</span>
            <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
            <h2 style="color:#1c3d2c;margin:0 0 16px;font-size:20px;">New Marketplace Listing</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#44403c;">
              <tr><td style="padding:8px 0;color:#888;width:120px;vertical-align:top;">Item</td><td style="padding:8px 0;font-weight:bold;">${escapeHtml(title.trim())}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Price</td><td style="padding:8px 0;">${escapeHtml(priceDisplay)}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Category</td><td style="padding:8px 0;">${escapeHtml(category || 'Not specified')}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Location</td><td style="padding:8px 0;">${escapeHtml(location || 'Not specified')}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Description</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(description.trim())}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Contact</td><td style="padding:8px 0;">${escapeHtml(sellerName)} &lt;${escapeHtml(contact_email.trim())}&gt;${contact_phone ? ` · ${escapeHtml(contact_phone)}` : ''}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Submission ID</td><td style="padding:8px 0;">${insertedId ?? 'See Supabase'}</td></tr>
            </table>
            <p style="font-size:13px;color:#a8a29e;margin-top:24px;">
              Reply to this email to contact the seller directly.<br/>
              WhidbeyWave · Whidbey Island, WA
            </p>
          </div>
        </div>
      `,
    });

    // Receipt to seller
    try {
      await resend.emails.send({
        from: 'WhidbeyWave <hello@whidbeywave.com>',
        to: contact_email.trim(),
        subject: `We received your listing: "${title.trim()}"`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
            <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
              <span style="font-size:24px;">🌊</span>
              <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
            </div>
            <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
              <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">Got it — thanks!</h2>
              <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 16px;">
                We received your marketplace listing for <strong>${escapeHtml(title.trim())}</strong>.
                We'll review it and get it added to the site — usually within a day or two.
                We'll be in touch if we have any questions.
              </p>
              <p style="font-size:13px;color:#a8a29e;margin:0;">
                Questions? Just reply to this email.<br/>
                WhidbeyWave · Whidbey Island, WA
              </p>
            </div>
          </div>
        `,
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ ok: true, id: insertedId });
  } catch (err) {
    console.error('Listing submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
