import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';

export async function GET(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from('notification_preferences')
    .select('channel, event_type, enabled, scope')
    .eq('user_id', auth.user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }

  return NextResponse.json({ preferences: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  let updates: { channel: string; event_type: string; enabled: boolean; scope?: Record<string, unknown> }[];
  try {
    const json = await request.json();
    updates = json.updates;
    if (!Array.isArray(updates)) throw new Error('Invalid');
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  for (const u of updates) {
    const row: Record<string, unknown> = {
      user_id: auth.user.id,
      channel: u.channel,
      event_type: u.event_type,
      enabled: u.enabled,
    };
    if (u.scope !== undefined) row.scope = u.scope;
    await auth.supabase.from('notification_preferences').upsert(
      row,
      { onConflict: 'user_id,channel,event_type' }
    );
  }

  return NextResponse.json({ ok: true });
}
