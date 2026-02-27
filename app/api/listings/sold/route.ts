import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Verify auth token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { data: listing } = await supabase
      .from('listings')
      .select('id, user_id, sold, status')
      .eq('id', id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }
    if (listing.sold) {
      return NextResponse.json({ ok: true }); // idempotent
    }
    if (listing.status !== 'approved') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 });
    }

    const { error } = await supabase
      .from('listings')
      .update({ sold: true })
      .eq('id', id);

    if (error) {
      console.error('Mark sold error:', error);
      return NextResponse.json({ error: 'Could not update listing' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Mark sold error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
