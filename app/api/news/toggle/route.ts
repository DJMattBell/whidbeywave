import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { id, published } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('news_posts')
      .update({ published: Boolean(published) })
      .eq('id', id);

    if (error) {
      console.error('News toggle error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('News toggle error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
