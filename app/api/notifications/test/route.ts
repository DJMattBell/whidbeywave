import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { notify, KNOWN_EVENT_TYPES } from '@/lib/notifications';

/**
 * POST /api/notifications/test
 * Admin-only endpoint to trigger a test notification.
 *
 * Body: { userId: string, eventType: string, payload: Record<string, string> }
 *
 * Example (forum reply):
 *   curl -X POST /api/notifications/test \
 *     -H "Authorization: Bearer <admin-token>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"userId":"<uuid>","eventType":"forum_reply_to_my_post","payload":{"postTitle":"Test thread","replierName":"Admin","replyBody":"Test reply body","threadUrl":"https://whidbeywave.com/forum/test"}}'
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if ('error' in auth) return auth.error;

  let userId: string, eventType: string, payload: Record<string, string>;

  try {
    const json = await request.json();
    userId = json.userId;
    eventType = json.eventType;
    payload = json.payload ?? {};
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  if (!eventType || typeof eventType !== 'string') {
    return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
  }
  if (!(KNOWN_EVENT_TYPES as readonly string[]).includes(eventType)) {
    return NextResponse.json(
      { error: `Unknown eventType "${eventType}"`, validTypes: KNOWN_EVENT_TYPES },
      { status: 400 }
    );
  }

  try {
    await notify(userId, eventType, payload);
    return NextResponse.json({ ok: true, userId, eventType });
  } catch (err) {
    return NextResponse.json(
      { error: 'Notification failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
