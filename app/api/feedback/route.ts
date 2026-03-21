import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';

const resend   = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function POST(request: NextRequest) {
  try {
    const { message, email, page } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Insert into site_feedback (anon key — table allows public inserts)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from('site_feedback').insert({
      message: message.trim(),
      email:   email?.trim() || null,
      page:    page || '/',
    });

    // Notify admin via email (non-fatal)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        const timestamp = new Date().toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
          weekday: 'short', month: 'short', day: 'numeric',
          hour: 'numeric', minute: '2-digit',
        });
        await resend.emails.send({
          from:    'WhidbeyWave <hello@whidbeywave.com>',
          to:      adminEmail,
          replyTo: email?.trim() || undefined,
          subject: `New site feedback from ${page || '/'} — WhidbeyWave`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f0e2;">
              <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
                <span style="font-size:24px;">💬</span>
                <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">Site Feedback</span>
              </div>
              <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;color:#44403c;">
                  <tr>
                    <td style="padding:8px 0;color:#888;width:80px;vertical-align:top;">Page</td>
                    <td style="padding:8px 0;">
                      <a href="${SITE_URL}${escapeHtml(page || '/')}" style="color:#255c42;">
                        ${SITE_URL}${escapeHtml(page || '/')}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#888;vertical-align:top;">From</td>
                    <td style="padding:8px 0;">${escapeHtml(email?.trim() || 'Anonymous')}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#888;vertical-align:top;">When</td>
                    <td style="padding:8px 0;">${timestamp} PT</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#888;vertical-align:top;">Message</td>
                    <td style="padding:8px 0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message.trim())}</td>
                  </tr>
                </table>
                ${email?.trim() ? `<p style="font-size:13px;color:#a8a29e;margin-top:16px;">Reply to this email to respond directly.</p>` : ''}
              </div>
            </div>
          `,
        });
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Always return ok — don't surface errors to users for minor feedback submissions
    return NextResponse.json({ ok: true });
  }
}
