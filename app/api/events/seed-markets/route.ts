import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { seedFarmersMarkets } from '@/lib/scrapers/seed-markets';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const hasValidSecret =
    cronSecret &&
    request.headers.get('authorization') === `Bearer ${cronSecret}`;

  if (!hasValidSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[seed-markets] SUPABASE_SERVICE_ROLE_KEY is not set');
    return NextResponse.json({ error: 'Supabase service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { inserted, skipped } = await seedFarmersMarkets(supabase);
    console.log(`[seed-markets] inserted ${inserted}, skipped ${skipped} existing`);
    return NextResponse.json({ ok: true, inserted, skipped });
  } catch (err: any) {
    console.error('[seed-markets] error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
