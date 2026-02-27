import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, category } = await request.json();

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email address required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Upsert so re-subscribing the same email+category is idempotent
    const { error } = await supabase
      .from('listing_alerts')
      .upsert(
        {
          email: email.trim().toLowerCase(),
          // null category = all listings; specific string = that category only
          category: category && category !== 'All' ? category : null,
        },
        { onConflict: 'email,category' }
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
