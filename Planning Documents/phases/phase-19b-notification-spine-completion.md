# Phase 19b — Notification Spine Completion

**Status: queued. Second phase in the consolidation track. Depends on 19a (which lands the ListingAlertSubscription migration).**

## Goal

Finish what Phases 15, 16, and 17 promised about notifications. The engine exists. The discoverability and trigger surfaces don't. Phase 20 (community ferry waits) and Phase 21 (event audience filtering) both depend on a complete notification spine.

## Scope (six items)

1. **Bell icon in navbar.** Spec from Phase 15; never built. Bell icon links to /profile/notifications, badge shows count of `notification_log` rows where user_id matches and read_at is null. Add `read_at` column if not present. Tapping `/profile/notifications` marks the badge count as zero. The bell is visible only to authenticated users.

2. **First-reply notification prompt.** Spec from Phase 15. After a user posts their first forum reply, render an inline card: "Want a heads-up when someone replies to you? Turn on notifications." with a single Enable button that triggers the NotificationOptIn flow. Tracking: user_metadata.first_reply_prompt_shown boolean. One-time. Use the empty-states.md inline-prompt pattern, not a modal.

3. **POST /api/notifications/test endpoint.** Admin-only. Body: `{ recipient_user_id, channel, event_type }`. Useful for debugging push pipeline issues in production. Returns the notification_log row created. Document in CONTRIBUTING.md.

4. **Milestone notification triggers for recommendations.** Phase 17 spec. When a recommendation is submitted, count existing recommendations for the same business. If new count is 5, 10, or 25, fire `business_you_recommended_hit_milestone` notification to all *prior* recommenders for that business with `{ businessId, businessName, count }` payload. notify() handles per-recipient channel routing.

5. **Subscription bottom sheet on home "Neighbors are giving".** Phase 16 spec. After the horizontal card scroll, add a CTA card: "Notify me of new free items." Tapping opens a bottom sheet with multi-select chips for categories and towns, "All categories"/"All towns" quick toggles, push/email channel defaults. Saves to notification_preferences with scope JSON. Use the bottom-sheet pattern from DESIGN.md (not a modal).

6. **First-time recommender prompt.** Phase 17 spec, but skipped. Before submitting the first recommendation: one-time inline note "We use real names so neighbors trust each other. Your name and town will appear on this recommendation." Track via user_metadata.first_recommendation_prompt_shown. Continue to submit on click.

## Out of scope

- New event types beyond those above
- Notification batching (digest aggregation) — separate future phase
- Push notification grouping on the device (OS-level concern)
- iOS-specific UX beyond what NotificationOptIn already handles

## Files to Read

- `components/Navbar.tsx`
- `app/profile/notifications/page.tsx`
- `lib/notifications.ts`, `notification_log` schema
- `app/api/forum/reply/route.ts`
- `app/recommendations/[id]/page.tsx` (or wherever the review-submit form lives)
- `app/page.tsx` "Neighbors are giving" section
- `components/NotificationOptIn.tsx`
- `Planning Documents/design/DESIGN.md` (badge, bottom sheet, inline prompt patterns)

## Planning Prompt

```
Phase 19b goal: complete the notification spine.

Specs (all six must complete — no deferrals):

1. Bell icon in navbar
   - Add Lucide Bell icon to Navbar.tsx between user menu and search
   - Badge: small terra-600 dot with count if >0; "9+" if >9
   - Click → /profile/notifications
   - Add notification_log.read_at column (migration)
   - On visiting /profile/notifications, update read_at=now() for unread rows for this user
   - Bell only visible when user is authenticated

2. First-reply prompt
   - In api/forum/reply/route.ts (or client after success): check user_metadata.first_reply_prompt_shown
   - If false, set true and return a flag in the response
   - Client renders inline NotificationOptIn-style card with copy from spec
   - Single Enable button; on success or dismiss, card hides; no further prompts ever

3. /api/notifications/test
   - Auth: admin only (check ADMIN_EMAIL)
   - Validate event_type is a known type
   - Calls notify() directly; returns the created notification_log row
   - Document in CONTRIBUTING.md under "Debugging push"

4. Milestone notification
   - In recommendation-submit API route: after insert, query count for businessId
   - If count in {5, 10, 25}: fetch all distinct prior recommender user_ids
   - notify(each, 'business_you_recommended_hit_milestone', { businessId, businessName, count })
   - One-time per milestone — guard against re-firing if a recommendation is deleted then re-added

5. Subscription bottom sheet
   - New component components/FlashGiveSubscriptionSheet.tsx
   - Triggered from "Notify me of new free items" CTA in app/page.tsx
   - Multi-select chips for categories (from a static list of free-listing categories) and towns (from a static list of 6 Whidbey towns)
   - Push/email channel toggles (push default on if available)
   - Submit → POST /api/notifications/preferences with new row scope = { categories, towns }
   - Bottom sheet pattern per DESIGN.md, not a modal

6. First-time recommender prompt
   - Same one-time pattern as item 2 but for recommendations
   - Renders before form submission; user clicks Continue to proceed
   - Track via user_metadata.first_recommendation_prompt_shown

Constraints:
- No new event types beyond what's listed
- No notification batching or digest aggregation in this phase
- Bell badge logic should be cheap (single query)
- Bottom sheet must work at 375×812 with bottom safe area inset
- All one-time prompts must guarantee one-time across devices (user_metadata, not localStorage)

Plan output: file list per item, migration SQL for notification_log.read_at, the bottom sheet UX described in detail.
```

## Iteration Checklist

- [ ] All six items in plan, none reduced
- [ ] Migration adds read_at column with default null and a partial index
- [ ] Bell badge query is bounded (LIMIT) so it can't degrade
- [ ] One-time prompts use user_metadata, not localStorage
- [ ] Milestone notification doesn't refire on delete+readd
- [ ] Bottom sheet honors mobile safe area

## Definition of Done

End-to-end:
- [ ] Authenticated user sees bell with badge after receiving any notification
- [ ] Visiting /profile/notifications zeroes the badge
- [ ] Post your first forum reply → next page load shows inline opt-in prompt; dismissing it stays dismissed
- [ ] Admin POSTs to /api/notifications/test → push arrives within 60s
- [ ] Submit recommendation #5 for a business with 4 existing recommenders → all 4 receive milestone push
- [ ] Open home, scroll to "Neighbors are giving", tap "Notify me of new free items" → bottom sheet opens at 375×812 with chips and toggles; submit creates a notification_preferences row with scope
- [ ] Submit your first recommendation → inline prompt appears before form submission

Codebase:
- [ ] `npm run build` passes
- [ ] `npm run smoke` passes
- [ ] No new direct Resend calls for per-user event notifications
- [ ] Retrospective written
