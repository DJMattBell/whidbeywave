import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  let endpoint: string;
  try {
    const json = await request.json();
    endpoint = json.endpoint;
    if (!endpoint) throw new Error('Missing endpoint');
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await auth.supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
