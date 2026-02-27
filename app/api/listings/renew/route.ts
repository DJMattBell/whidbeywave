import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RENEWAL_DAYS = 60;

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
      .select('id, user_id, status, sold, expires_at')
      .eq('id', id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }
    if (listing.status !== 'approved' || listing.sold) {
      return NextResponse.json({ error: 'Cannot renew this listing' }, { status: 400 });
    }

    const newExpiresAt = new Date(
      Date.now() + RENEWAL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error } = await supabase
      .from('listings')
      .update({ expires_at: newExpiresAt })
      .eq('id', id);

    if (error) {
      console.error('Renew error:', error);
      return NextResponse.json({ error: 'Could not renew listing' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, expires_at: newExpiresAt });
  } catch (err) {
    console.error('Renew error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
