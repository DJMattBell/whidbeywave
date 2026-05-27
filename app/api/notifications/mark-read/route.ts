import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  const { error } = await supabase
    .from('notification_log')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .is('read_at', null);

  if (error) {
    console.error('mark-read error:', error);
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
