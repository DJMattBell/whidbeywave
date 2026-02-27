import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = new Resend(process.env.RESEND_API_KEY);

const TOPIC_LABELS: Record<string, string> = {
  event:       'Sharing an Event',
  news:        'News Tip',
  listing:     'Marketplace Listing',
  advertising: 'Working Together',
  general:     'Just Saying Hello',
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, topic, phone, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const topicLabel = TOPIC_LABELS[topic] ?? 'General';

    await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to: adminEmail,
      replyTo: email.trim(),
      subject: `New message from ${name.trim()} — ${topicLabel}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8" /></head>
        <body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(101,65,20,0.10);">
                <tr>
                  <td style="background:#1a4a33;padding:24px 32px;">
                    <span style="font-size:24px;">🌊</span>
                    <span style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#fdfaf3;margin-left:10px;">WhidbeyWave</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h1 style="font-size:20px;color:#1c3d2c;margin:0 0 16px;">New message from ${escapeHtml(name.trim())}</h1>
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#44403c;margin-bottom:24px;">
                      <tr>
                        <td style="padding:8px 0;color:#888;width:120px;vertical-align:top;">Topic</td>
                        <td style="padding:8px 0;font-weight:bold;">${escapeHtml(topicLabel)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#888;vertical-align:top;">From</td>
                        <td style="padding:8px 0;">${escapeHtml(name.trim())} &lt;${escapeHtml(email.trim())}&gt;</td>
                      </tr>
                      ${phone ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top;">Phone</td><td style="padding:8px 0;">${escapeHtml(phone)}</td></tr>` : ''}
                      <tr>
                        <td style="padding:8px 0;color:#888;vertical-align:top;">Message</td>
                        <td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(message.trim())}</td>
                      </tr>
                    </table>
                    <p style="font-size:13px;color:#a8a29e;margin-top:24px;">
                      Hit reply to respond directly to ${escapeHtml(name.trim())}.
                      WhidbeyWave · Whidbey Island, WA
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
