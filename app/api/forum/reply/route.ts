import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyUserRequest } from '@/lib/userAuth';
import { notify } from '@/lib/notifications';

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
  if (body.length > 10000) {
    return NextResponse.json({ error: 'Reply must be 10,000 characters or fewer' }, { status: 400 });
  }

  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;
  const { user, displayName, supabase: supabaseUser } = auth;

  // Insert the reply (RLS requires auth.uid() is not null — satisfied by the token override)
  const { error: insertError } = await supabaseUser.from('forum_replies').insert({
    post_id:     postId,
    body:        body.trim(),
    author_id:   user.id,
    author_name: displayName,
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

  // Send notification through the notification engine
  // notify() handles preference lookup, channel fan-out, and logging
  if (post?.author_email && post.author_email !== user.email) {
    const snippet = body.trim().length > 200
      ? body.trim().slice(0, 200) + '…'
      : body.trim();

    // We need the author's user_id — look it up by email
    const { data: authorUser } = await supabaseAnon
      .from('forum_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (authorUser?.author_id) {
      try {
        await notify(authorUser.author_id, 'forum_reply_to_my_post', {
          postTitle: post.title,
          replierName: displayName,
          replyBody: snippet,
          threadUrl: `${SITE_URL}/forum/${postId}`,
        });
      } catch {
        // Non-fatal — reply was already saved successfully
      }
    }
  }

  return NextResponse.json({ ok: true });
}
