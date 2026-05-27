import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';

export async function GET(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  const { count, error } = await supabase
    .from('notification_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .is('read_at', null);

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: Math.min(count ?? 0, 99) });
}
