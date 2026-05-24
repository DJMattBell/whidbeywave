import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';

function calcReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const {
      title, slug, emoji, category, read_minutes,
      excerpt, body: postBody, author,
      published_at, published,
      post_type, image_url, tags,
    } = body;

    if (!title?.trim() || !slug?.trim() || !excerpt?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Auto-calculate read time from body if not manually set
    const autoReadMinutes = postBody ? calcReadMinutes(postBody) : 3;
    const finalReadMinutes = Number(read_minutes) || autoReadMinutes;

    // Parse tags: accept comma-separated string or array
    let parsedTags: string[] = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t: string) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string' && tags.trim()) {
      parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const { data, error } = await supabase
      .from('news_posts')
      .insert({
        title:        title.trim(),
        slug:         slug.trim(),
        emoji:        emoji || '📰',
        category:     category || 'Community',
        read_minutes: finalReadMinutes,
        excerpt:      excerpt.trim(),
        body:         postBody?.trim() ?? '',
        author:       author?.trim() || 'WhidbeyWave',
        published_at: published_at || new Date().toISOString().split('T')[0],
        published:    Boolean(published),
        post_type:    post_type || 'news',
        image_url:    image_url?.trim() || null,
        tags:         parsedTags,
      })
      .select('id')
      .single();

    if (error) {
      console.error('News create error:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('News create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
