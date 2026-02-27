import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { title, price, category, location, description, name, email, phone } = await request.json();

    if (!title?.trim() || !name?.trim() || !email?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Save to Supabase (non-fatal if DB is down)
    let insertedId: string | null = null;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { data, error } = await supabase
          .from('marketplace_listings')
          .insert({
            title: title.trim(),
            price: price || 'Contact for price',
            category: category || 'General',
            location: location || 'Whidbey Island',
            description: description.trim(),
            seller_name: name.trim(),
            seller_email: email.trim(),
            emoji: '🏷️',
            status: 'pending',
          })
          .select('id')
          .single();

        if (error) {
          if (error.message?.includes('does not exist') || error.code === '42P01') {
            console.error('ERROR: marketplace_listings table not found. Run the SQL migration in Supabase first.');
          } else {
            console.error('Supabase insert error:', error);
          }
        } else {
          insertedId = data?.id ?? null;
        }
      }
    } catch (dbErr) {
      console.error('Supabase insert error:', dbErr);
    }

    // Email admin
    await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to: adminEmail,
      replyTo: email.trim(),
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
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Price</td><td style="padding:8px 0;">${escapeHtml(price || 'Not specified')}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Category</td><td style="padding:8px 0;">${escapeHtml(category || 'Not specified')}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Location</td><td style="padding:8px 0;">${escapeHtml(location || 'Not specified')}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Description</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(description.trim())}</td></tr>
              <tr><td style="padding:8px 0;color:#888;vertical-align:top;">Seller</td><td style="padding:8px 0;">${escapeHtml(name.trim())} &lt;${escapeHtml(email.trim())}&gt;${phone ? ` · ${escapeHtml(phone)}` : ''}</td></tr>
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
        to: email.trim(),
        subject: `We received your listing: "${title.trim()}"`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
            <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
              <span style="font-size:24px;">🌊</span>
              <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
            </div>
            <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
              <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">Got it — thanks, ${escapeHtml(name.trim())}!</h2>
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Listing submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
