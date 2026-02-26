import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { firstName, email, tags, frequency } = await request.json();

    if (!firstName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tagList = tags.length > 0
      ? tags.join(', ')
      : 'all island news';

    const frequencyLabel = frequency === 'immediate' ? 'as news breaks' : 'every Monday morning';

    const { error } = await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to: email,
      subject: `Welcome to the WhidbeyWave Weekly, ${firstName} 🌊`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to WhidbeyWave Weekly</title>
        </head>
        <body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(101,65,20,0.10);">

                  <!-- Header -->
                  <tr>
                    <td style="background:#1a4a33;padding:28px 36px;">
                      <table width="100%">
                        <tr>
                          <td>
                            <span style="font-size:28px;">🌊</span>
                            <span style="font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#fdfaf3;margin-left:10px;">WhidbeyWave Weekly</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:4px;">
                            <span style="font-size:13px;color:#6b9e82;">Your island digest</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:36px;">
                      <p style="font-size:22px;color:#1c3d2c;font-family:Georgia,serif;margin:0 0 16px;">
                        Welcome to the island, ${firstName}. 🌿
                      </p>
                      <p style="font-size:15px;color:#57534e;line-height:1.7;margin:0 0 20px;">
                        You&rsquo;re all set. Here&rsquo;s what you&rsquo;ve signed up for:
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfaf3;border-radius:12px;border:1px solid #e8dfc8;margin-bottom:24px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#255c42;margin:0 0 8px;">Your preferences</p>
                            <p style="font-size:14px;color:#44403c;margin:0 0 6px;">
                              <strong>Topics:</strong> ${tagList}
                            </p>
                            <p style="font-size:14px;color:#44403c;margin:0;">
                              <strong>Delivery:</strong> ${frequencyLabel}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size:15px;color:#57534e;line-height:1.7;margin:0 0 20px;">
                        Each digest is short — a handful of events, a story or two, and maybe something
                        quietly beautiful happening on the island that week. Nothing you didn&rsquo;t ask for.
                      </p>

                      <p style="font-size:15px;color:#57534e;line-height:1.7;margin:0 0 28px;">
                        Until then, take a look around the site.
                      </p>

                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#255c42;border-radius:10px;padding:12px 24px;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color:#fdfaf3;text-decoration:none;font-size:14px;font-weight:bold;">
                              Visit WhidbeyWave.com →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#fdfaf3;border-top:1px solid #e8dfc8;padding:20px 36px;">
                      <p style="font-size:12px;color:#a8a29e;margin:0;text-align:center;">
                        You&rsquo;re receiving this because you signed up at WhidbeyWave.com &nbsp;&middot;&nbsp;
                        Whidbey Island, WA
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
