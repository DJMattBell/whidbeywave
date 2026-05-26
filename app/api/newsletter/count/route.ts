import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceClient();

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
