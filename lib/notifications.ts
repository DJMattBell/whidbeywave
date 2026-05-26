/**
 * Notification engine — the single path for all per-user event notifications.
 *
 * Usage:
 *   await notify(userId, 'forum_reply_to_my_post', {
 *     postTitle: 'Best hiking trails?',
 *     replierName: 'Alice',
 *     replyBody: 'Penn Cove is great...',
 *     threadUrl: 'https://whidbeywave.com/forum/abc123',
 *   });
 *
 * Newsletter, contact-to-admin, scraper emails stay direct Resend — not per-user events.
 */

import { createServiceClient } from '@/lib/supabase';
import { getResend } from './resend';
import { emailForumReply } from './email';

type NotifyPayload = Record<string, string>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

async function logNotification(
  userId: string,
  eventType: string,
  channel: string,
  status: 'sent' | 'failed' | 'skipped',
  error?: string
) {
  const supabase = createServiceClient();
  await supabase.from('notification_log').insert({
    user_id: userId,
    event_type: eventType,
    channel,
    status,
    error: error ?? null,
  });
}

async function sendPush(userId: string, eventType: string, payload: NotifyPayload) {
  try {
    const webPush = await import('web-push');

    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublic || !vapidPrivate || !vapidSubject) {
      await logNotification(userId, eventType, 'push', 'skipped', 'VAPID keys not configured');
      return;
    }

    webPush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const supabase = createServiceClient();
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (!subs || subs.length === 0) {
      await logNotification(userId, eventType, 'push', 'skipped', 'No push subscriptions');
      return;
    }

    const pushPayload = JSON.stringify({
      title: payload.pushTitle ?? 'WhidbeyWave',
      body: payload.pushBody ?? 'You have a new notification',
      url: payload.threadUrl ?? payload.url ?? SITE_URL,
    });

    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload
        );
        await logNotification(userId, eventType, 'push', 'sent');
      } catch (err) {
        await logNotification(userId, eventType, 'push', 'failed',
          err instanceof Error ? err.message : String(err));
        // If subscription is expired, remove it
        if (err instanceof Error && (err.message.includes('410') || err.message.includes('404'))) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
    }
  } catch (err) {
    await logNotification(userId, eventType, 'push', 'failed',
      err instanceof Error ? err.message : String(err));
  }
}

async function sendEmail(userId: string, eventType: string, payload: NotifyPayload) {
  try {
    const supabase = createServiceClient();
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    const email = user?.user?.email;
    if (!email) {
      await logNotification(userId, eventType, 'email', 'skipped', 'No email on user');
      return;
    }

    const resend = getResend();
    let html: string;
    let subject: string;

    switch (eventType) {
      case 'forum_reply_to_my_post':
        subject = 'Someone replied to your question on WhidbeyWave';
        html = emailForumReply({
          postTitle: payload.postTitle ?? '',
          replierName: payload.replierName ?? '',
          replyBody: payload.replyBody ?? '',
          threadUrl: payload.threadUrl ?? SITE_URL,
        });
        break;
      default:
        await logNotification(userId, eventType, 'email', 'skipped', `No email template for ${eventType}`);
        return;
    }

    await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to: email,
      subject,
      html,
    });

    await logNotification(userId, eventType, 'email', 'sent');
  } catch (err) {
    await logNotification(userId, eventType, 'email', 'failed',
      err instanceof Error ? err.message : String(err));
  }
}

/**
 * Check if a notification scope matches the payload.
 * Empty arrays = match all. Null scope = match all.
 */
function scopeMatches(
  scope: { categories?: string[]; towns?: string[] } | null,
  payload: NotifyPayload
): boolean {
  if (!scope) return true;

  if (scope.categories && scope.categories.length > 0 && payload.category) {
    const categorySet = new Set(scope.categories.map(c => c.toLowerCase()));
    if (!categorySet.has(payload.category.toLowerCase())) return false;
  }

  if (scope.towns && scope.towns.length > 0 && payload.town) {
    const townSet = new Set(scope.towns.map(t => t.toLowerCase()));
    if (!townSet.has(payload.town.toLowerCase())) return false;
  }

  return true;
}

/**
 * Send a notification to a user through all their enabled channels.
 * Looks up preferences, fans out to email and/or push, logs everything.
 */
export async function notify(
  recipientUserId: string,
  eventType: string,
  payload: NotifyPayload
): Promise<void> {
  const supabase = createServiceClient();

  // Look up preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('channel, enabled, scope')
    .eq('user_id', recipientUserId)
    .eq('event_type', eventType);

  // Default: email enabled for forum_reply_to_my_post if no prefs exist
  const channels: Record<string, boolean> = {};
  if (prefs && prefs.length > 0) {
    for (const p of prefs) {
      // Check scope filtering
      if (p.enabled && scopeMatches(p.scope as { categories?: string[]; towns?: string[] } | null, payload)) {
        channels[p.channel] = true;
      }
    }
  } else if (eventType === 'forum_reply_to_my_post') {
    channels.email = true;
  }

  // Add push context to payload
  if (eventType === 'forum_reply_to_my_post') {
    payload.pushTitle = `${payload.replierName ?? 'Someone'} replied to your question`;
    payload.pushBody = (payload.replyBody ?? '').slice(0, 100);
  } else if (eventType === 'flash_give_in_my_area') {
    payload.pushTitle = 'Free on Whidbey!';
    payload.pushBody = payload.title ?? 'A neighbor is giving something away';
  }

  const promises: Promise<void>[] = [];

  if (channels.email) {
    promises.push(sendEmail(recipientUserId, eventType, payload));
  }
  if (channels.push) {
    promises.push(sendPush(recipientUserId, eventType, payload));
  }

  await Promise.allSettled(promises);
}

/**
 * Broadcast a notification to all users with matching preferences and scope.
 * Used for events like flash_give_in_my_area where recipients aren't known upfront.
 */
export async function notifyAll(
  eventType: string,
  payload: NotifyPayload
): Promise<number> {
  const supabase = createServiceClient();

  const { data: allPrefs } = await supabase
    .from('notification_preferences')
    .select('user_id, channel, enabled, scope')
    .eq('event_type', eventType)
    .eq('enabled', true);

  if (!allPrefs || allPrefs.length === 0) return 0;

  // Group by user_id, check scope
  const userChannels: Record<string, Set<string>> = {};
  for (const p of allPrefs) {
    if (scopeMatches(p.scope as { categories?: string[]; towns?: string[] } | null, payload)) {
      if (!userChannels[p.user_id]) userChannels[p.user_id] = new Set();
      userChannels[p.user_id].add(p.channel);
    }
  }

  const userIds = Object.keys(userChannels);
  const promises = userIds.map(userId => notify(userId, eventType, payload));
  await Promise.allSettled(promises);

  return userIds.length;
}
