import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('confirmed', true);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
