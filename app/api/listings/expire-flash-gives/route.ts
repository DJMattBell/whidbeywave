import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyCronRequest } from '@/lib/cronAuth';

const DURATION_MS: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
  'week': 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  try {
    const supabase = createServiceClient();

    // Fetch all active free listings with a flash-give duration
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, created_at, flash_give_duration')
      .eq('is_free', true)
      .eq('status', 'approved')
      .eq('sold', false)
      .not('flash_give_duration', 'is', null);

    if (error) {
      console.error('expire-flash-gives query error:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({ ok: true, expired: 0 });
    }

    const now = Date.now();
    const toExpire: string[] = [];

    for (const listing of listings) {
      const durationMs = DURATION_MS[listing.flash_give_duration];
      if (!durationMs) continue;
      const createdAt = new Date(listing.created_at).getTime();
      if (createdAt + durationMs < now) {
        toExpire.push(listing.id);
      }
    }

    if (toExpire.length === 0) {
      return NextResponse.json({ ok: true, expired: 0 });
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .in('id', toExpire);

    if (updateError) {
      console.error('expire-flash-gives update error:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, expired: toExpire.length });
  } catch (err) {
    console.error('expire-flash-gives error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
