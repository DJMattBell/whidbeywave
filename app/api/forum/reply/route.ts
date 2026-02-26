import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function POST(request: NextRequest) {
  let postId: string, body: string;

  try {
    const json = await request.json();
    postId = json.postId;
    body = json.body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!postId || typeof postId !== 'string') {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }
  if (!body || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Reply body is required' }, { status: 400 });
  }

  // Validate the user via their Bearer token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim() ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'Anonymous';

  // Insert the reply (RLS requires auth.uid() is not null — satisfied by the token override)
  const { error: insertError } = await supabaseUser.from('forum_replies').insert({
    post_id:     postId,
    body:        body.trim(),
    author_id:   user.id,
    author_name: displayName,
    zip_code:    user.user_metadata?.zip_code ?? null,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }

  // Fetch the original post's author_email and title (using anon client — public read)
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabaseAnon
    .from('forum_posts')
    .select('author_email, title')
    .eq('id', postId)
    .single();

  // Send notification if the post has an author email and it's not the same person replying
  if (post?.author_email && post.author_email !== user.email) {
    const snippet = body.trim().length > 200
      ? body.trim().slice(0, 200) + '…'
      : body.trim();

    try {
      await resend.emails.send({
        from: 'WhidbeyWave <hello@whidbeywave.com>',
        to: post.author_email,
        subject: `Someone replied to your question on WhidbeyWave`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:#1a4a33;padding:28px 36px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#f5efe0;letter-spacing:-0.3px;">
              🌊 WhidbeyWave
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 24px;">
            <h2 style="margin:0 0 12px;font-size:22px;color:#1c3d2c;font-family:Georgia,serif;">
              Someone replied to your question
            </h2>
            <p style="margin:0 0 20px;font-size:16px;color:#57534e;line-height:1.6;">
              <strong>${displayName}</strong> added a reply to a question you posted on WhidbeyWave.
            </p>

            <!-- Post title + snippet block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfaf3;border:1px solid #e8dfc8;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;color:#6b7280;">
                    Re: your question
                  </p>
                  <p style="margin:0 0 12px;font-size:16px;font-weight:bold;color:#1c3d2c;font-family:Georgia,serif;">
                    ${post.title}
                  </p>
                  <p style="margin:0;font-size:15px;color:#57534e;line-height:1.6;font-style:italic;">
                    "${snippet}"
                  </p>
                  <p style="margin:8px 0 0;font-size:13px;color:#9ca3af;">
                    — ${displayName}
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#255c42;border-radius:10px;">
                  <a href="${SITE_URL}/forum/${postId}"
                     style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#f5efe0;text-decoration:none;">
                    View the reply →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fdfaf3;border-top:1px solid #e8dfc8;padding:20px 36px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You received this because you posted a question on
              <a href="${SITE_URL}" style="color:#255c42;text-decoration:none;">WhidbeyWave.com</a>.
              Whidbey Island, WA.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
    } catch {
      // Non-fatal — reply was already saved successfully
    }
  }

  return NextResponse.json({ ok: true });
}
