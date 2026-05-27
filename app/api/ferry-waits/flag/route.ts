import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';
import { createServiceClient } from '@/lib/supabase';

/** POST — flag a ferry wait report */
export async function POST(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  let reportId: string;
  try {
    const json = await request.json();
    reportId = json.reportId;
    if (!reportId) throw new Error('Missing reportId');
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('ferry_wait_reports')
    .update({ flagged: true, flag_reason: `flagged by user ${auth.user.id}` })
    .eq('id', reportId);

  if (error) {
    return NextResponse.json({ error: 'Failed to flag report' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
