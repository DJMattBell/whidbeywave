import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { createServiceClient } from '@/lib/supabase';
import { escapeHtml } from '@/lib/escapeHtml';
import {
  Validator,
  ALLOWED_TOWNS,
  ALLOWED_EVENT_CATEGORIES,
  ALLOWED_EVENT_TAGS,
} from '@/lib/validate';

const resend = getResend();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, date, time, location, town, category,
      description, tags, submitter_name, submitter_email,
    } = body;

    const v = new Validator();
    v.required(title, 'Event title')
     .minLength(title, 3, 'Event title')
     .maxLength(title, 120, 'Event title')
     .required(date, 'Event date')
     .date(date, 'Event date')
     .required(time, 'Event time')
     .maxLength(time, 50, 'Event time')
     .required(location, 'Location')
     .maxLength(location, 200, 'Location')
     .required(town, 'Town')
     .oneOf(town, ALLOWED_TOWNS, 'Town')
     .oneOf(category, ALLOWED_EVENT_CATEGORIES, 'Category')
     .minLength(submitter_name, 2, 'Your name')
     .maxLength(submitter_name, 100, 'Your name')
     .required(submitter_email, 'Your email')
     .email(submitter_email, 'Your email')
     .maxLength(description, 2000, 'Description')
     .maxItems(tags, 10, 'Tags')
     .eachOneOf(tags, ALLOWED_EVENT_TAGS, 'Tags');

    if (!v.ok()) {
      return NextResponse.json({ error: v.firstError() }, { status: 400 });
    }

    // Save to Supabase (service role — RLS blocks anon inserts)
    const supabase = createServiceClient();

    const { data: submission, error: dbError } = await supabase
      .from('event_submissions')
      .insert({
        title, date, time, location, town, category,
        description: description || null,
        tags: tags || [],
        submitter_name: submitter_name?.trim() || 'Anonymous',
        submitter_email,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB error:', dbError);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com'}/admin/events`;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Email admin (non-fatal — submission is already saved)
    if (adminEmail) {
      try {
      await resend.emails.send({
        from: 'WhidbeyWave <hello@whidbeywave.com>',
        to: adminEmail,
        subject: `New event submission: "${title}"`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#fdfaf3;">
            <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
              <span style="font-size:24px;">🌊</span>
              <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
            </div>
            <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
              <h2 style="color:#1c3d2c;margin:0 0 16px;font-size:20px;">New Event Submission</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px;color:#44403c;">
                <tr><td style="padding:8px 0;color:#888;width:120px;">Title</td><td style="padding:8px 0;font-weight:bold;">${escapeHtml(title)}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;">${escapeHtml(date)}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;">${escapeHtml(time)}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Location</td><td style="padding:8px 0;">${escapeHtml(location)}, ${escapeHtml(town)}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Category</td><td style="padding:8px 0;">${escapeHtml(category)}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Tags</td><td style="padding:8px 0;">${escapeHtml((tags || []).join(', ') || 'None')}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Description</td><td style="padding:8px 0;">${escapeHtml(description || '—')}</td></tr>
                <tr><td style="padding:8px 0;color:#888;">Submitted by</td><td style="padding:8px 0;">${escapeHtml(submitter_name?.trim() || 'Anonymous')} &lt;${escapeHtml(submitter_email)}&gt;</td></tr>
              </table>
              <div style="margin-top:24px;">
                <a href="${adminUrl}" style="background:#255c42;color:#fdfaf3;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:bold;display:inline-block;">
                  Review in Admin →
                </a>
              </div>
            </div>
          </div>
        `,
      });
      } catch {
        // Non-fatal — submission is already saved
      }
    }

    // Email the submitter a receipt so they know it was received
    try {
      const eventDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      await resend.emails.send({
        from: 'WhidbeyWave <hello@whidbeywave.com>',
        to: submitter_email,
        subject: `We received your event: "${title}"`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
            <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
              <span style="font-size:24px;">🌊</span>
              <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
            </div>
            <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
              <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:20px;">Got it — thanks${submitter_name?.trim() ? `, ${escapeHtml(submitter_name.trim())}` : ''}!</h2>
              <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 20px;">
                We received your event submission and will review it shortly.
                You'll get another email from us once it's approved and live on the calendar —
                usually within 48 hours.
              </p>
              <table style="width:100%;background:#fdfaf3;border-radius:10px;border:1px solid #e8dfc8;margin-bottom:24px;border-collapse:collapse;">
                <tr><td style="padding:20px 24px;">
                  <p style="font-size:17px;font-weight:bold;color:#1c3d2c;margin:0 0 8px;">${escapeHtml(title)}</p>
                  <p style="font-size:14px;color:#57534e;margin:0 0 4px;">📅 ${escapeHtml(eventDate)}</p>
                  <p style="font-size:14px;color:#57534e;margin:0 0 4px;">🕐 ${escapeHtml(time)}</p>
                  <p style="font-size:14px;color:#57534e;margin:0;">📍 ${escapeHtml(location)}, ${escapeHtml(town)}</p>
                </td></tr>
              </table>
              <p style="font-size:13px;color:#a8a29e;margin:0;">
                Questions? Just reply to this email.<br />
                WhidbeyWave · Whidbey Island, WA
              </p>
            </div>
          </div>
        `,
      });
    } catch {
      // Non-fatal — submission is saved, receipt email is best-effort
    }

    return NextResponse.json({ ok: true, id: submission?.id });
  } catch (err) {
    console.error('Submit event error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
