import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { seedFarmersMarkets } from '@/lib/scrapers/seed-markets';
import { verifyCronRequest } from '@/lib/cronAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const supabase = createServiceClient();

  try {
    const { inserted, skipped } = await seedFarmersMarkets(supabase);
    console.log(`[seed-markets] inserted ${inserted}, skipped ${skipped} existing`);
    return NextResponse.json({ ok: true, inserted, skipped });
  } catch (err) {
    console.error('[seed-markets] error:', err);
    return NextResponse.json({ error: 'Failed to seed markets' }, { status: 500 });
  }
}
