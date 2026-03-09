import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const {
      title, slug, emoji, category, read_minutes,
      excerpt, body: postBody, author,
      published_at, published,
    } = body;

    if (!title?.trim() || !slug?.trim() || !excerpt?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('news_posts')
      .insert({
        title:        title.trim(),
        slug:         slug.trim(),
        emoji:        emoji || '📰',
        category:     category || 'Community',
        read_minutes: Number(read_minutes) || 3,
        excerpt:      excerpt.trim(),
        body:         postBody?.trim() ?? '',
        author:       author?.trim() || 'WhidbeyWave',
        published_at: published_at || new Date().toISOString().split('T')[0],
        published:    Boolean(published),
      })
      .select('id')
      .single();

    if (error) {
      console.error('News create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('News create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
