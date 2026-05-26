import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { ALLOWED_LISTING_CATEGORIES } from '@/lib/validate';

export async function POST(request: NextRequest) {
  try {
    const { email, category } = await request.json();

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email address required.' }, { status: 400 });
    }

    // Validate category if provided
    if (category && category !== 'All' && !ALLOWED_LISTING_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Upsert so re-subscribing the same email+category is idempotent.
    // unsubscribe_token is included so new rows get a token; on conflict it
    // regenerates the token, which is acceptable since it's only used for unsubscribing.
    const { error } = await supabase
      .from('listing_alerts')
      .upsert(
        {
          email: email.trim().toLowerCase(),
          // null category = all listings; specific string = that category only
          category: category && category !== 'All' ? category : null,
          unsubscribe_token: randomUUID(),
        },
        { onConflict: 'email,category', ignoreDuplicates: false }
      );

    if (error) {
      console.error('listing_alerts upsert error:', error);
      return NextResponse.json({ error: 'Could not save your subscription.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
