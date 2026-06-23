import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('event_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }

  return NextResponse.json({ submissions: data });
}
