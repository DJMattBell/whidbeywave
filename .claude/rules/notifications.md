# Notification Rules

Applies when editing: lib/notifications.ts, app/api/notifications/, app/api/forum/reply, app/api/events/moderate

- All per-user notifications route through `notify()` from `lib/notifications.ts`
- Never call `resend.emails.send()` directly for per-user event notifications
- Valid event types: `forum_reply_to_my_post`, `new_listing_in_my_area`, `flash_give_in_my_area`, `business_you_recommended_hit_milestone`, `event_approved`, `listing_contact`
- `listing_alerts` table is deprecated — use `notification_preferences` with `event_type = 'new_listing_in_my_area'`
- Check `notification_log` for delivery status
- Test pipeline: `POST /api/notifications/test` with admin Bearer token
