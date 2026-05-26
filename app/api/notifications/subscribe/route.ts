import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';

export async function POST(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  let subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  try {
    const json = await request.json();
    subscription = json.subscription;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    // Basic URL validation
    new URL(subscription.endpoint);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { error } = await auth.supabase.from('push_subscriptions').upsert({
    user_id: auth.user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent: request.headers.get('user-agent') ?? null,
  }, { onConflict: 'user_id,endpoint' });

  if (error) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
