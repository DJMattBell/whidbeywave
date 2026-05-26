import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if ('error' in auth) return auth.error;

    const { id, published } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('news_posts')
      .update({ published: Boolean(published) })
      .eq('id', id);

    if (error) {
      console.error('News toggle error:', error);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('News toggle error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
