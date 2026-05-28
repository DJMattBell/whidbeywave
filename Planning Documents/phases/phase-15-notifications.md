# Phase 15 — Notification Engine

## Goal

Build the spine that every Facebook-replacement feature depends on: web push opt-in, `/profile/notifications` prefs page, `notify()` plumbing. Refactor the existing forum reply email to route through it.

## Files to Read

- All API routes in `app/api/forum/` (especially `reply/`)
- `app/profile/`
- `components/AuthModal.tsx`
- `lib/email.ts`, `lib/resend.ts` (after Phase 12 refactor)
- All API routes that call `resend.emails.send` directly (grep)
- The service worker (if Phase 14 added one) or `public/manifest.json`
- `Planning Documents/design/error-states.md`

## Planning Prompt

```
Phase 15 goal: notification engine. The spine of every Facebook-replacement feature after this.

Architecture target:
- lib/notifications.ts with notify(recipientUserId, eventType, payload)
- Looks up notification_preferences, fans out to enabled channels (push, email), logs to notification_log
- New channels and event types added without changing call sites

Specs:

1. Database (new migration add_notifications_engine.sql):
   - notification_preferences (user_id, channel, event_type, enabled, scope JSONB nullable, created_at, updated_at). Unique on (user_id, channel, event_type). RLS: users read/write own; service role bypasses.
   - push_subscriptions (id, user_id, endpoint, p256dh, auth, user_agent, created_at). RLS: users manage own.
   - notification_log (id, user_id, event_type, channel, status text, error text, sent_at). RLS: service role only.
   - Default preferences trigger on user creation: forum_reply_to_my_post enabled both channels; everything else disabled.

2. VAPID keys:
   - Generate via `npx web-push generate-vapid-keys`
   - Add NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT to .env.local.example
   - Document key rotation in CONTRIBUTING.md
   - Install web-push npm package

3. Service worker:
   - Add (or extend) public/sw.js with push event handler
   - Push handler: parse payload, call self.registration.showNotification
   - Notification click: focus existing tab or open URL from payload
   - Service worker registration in app/layout.tsx (client component)

4. API routes:
   - POST /api/notifications/subscribe (saves push_subscription; user auth required)
   - POST /api/notifications/unsubscribe (removes by endpoint)
   - POST /api/notifications/test (admin auth required)
   - GET/POST /api/notifications/preferences

5. Client component NotificationOptIn.tsx:
   - iOS Safari NOT installed as PWA → show error-states.md "Locals only"-style guidance ("Add WhidbeyWave to your home screen first")
   - Otherwise: requests Notification permission, registers push subscription, POSTs to /subscribe

6. Refactor api/forum/reply/route.ts:
   - Replace direct Resend call with notify(post.author_id, 'forum_reply_to_my_post', { postId, replyExcerpt, threadUrl })
   - Behavior unchanged externally — engine now in path

7. /profile/notifications:
   - Lists all event_types grouped by category (Forum, Marketplace, Recommendations, Ferry alerts)
   - Per-channel toggle for each
   - Saves on toggle
   - Uses EmptyState/ErrorState from Phase 14

8. Discoverability:
   - Bell icon in navbar links to /profile/notifications (badge based on notification_log unread count)
   - One-time inline prompt after first forum reply: "Want a heads-up when someone replies? Turn on notifications."

Constraints:
- Do NOT add notification triggers beyond the existing forum reply yet — Phases 16, 17 will add their own
- Do NOT redesign the forum (Phase 7 did)
- Newsletter welcome, contact-to-admin, etc. stay direct Resend — they're not per-user event notifications
- iOS PWA-only push limitation must have explicit UI handling
- Coexist with any service worker work from Phase 14

Plan output: full migration SQL, list of files modified, the discoverability UI, and confirmation that all per-user event notifications route through notify() after this phase.
```

## Iteration Checklist

- [ ] VAPID generation step in plan
- [ ] notify() is the only path for per-user event notifications
- [ ] Direct Resend calls for newsletter/contact stay direct (not per-user events)
- [ ] Default preferences: forum_reply_to_my_post ON, everything else OFF
- [ ] iOS PWA-only limitation handled explicitly in UI
- [ ] Service worker coexists with Phase 14 work
- [ ] Migration is reversible

## Definition of Done

End-to-end on Android Chrome:
- [ ] Visit /profile/notifications signed in
- [ ] Toggle "Forum replies — Push" → permission prompt
- [ ] Grant → trigger reply from second account → push arrives <60s
- [ ] Tap notification → opens to the thread

On iOS Safari, PWA installed: same as Android.
On iOS Safari, PWA NOT installed: shows "Add to Home Screen first" guidance, doesn't attempt to register.

Codebase:
- [ ] `grep -rE "resend\.(emails|batch)\.send" app/api/` returns only newsletter, welcome, contact-to-admin (no event notifications)
- [ ] Migration applies cleanly
- [ ] `npm run smoke` passes
- [ ] `npm run build` passes
