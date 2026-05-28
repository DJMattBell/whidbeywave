# Phase 22 — Admin Recommendations UI

**Status: queued. Closes the Phase 17 retro #1 properly.**

Depends on Phase 19a (admin mobile QA pass already done) and Phase 19b (notify() spine complete).

## Why this matters

Phase 17 shipped /recommendations as a community-facing surface but skipped the admin side. Currently the only way to flag a problematic recommendation or merge duplicate business entries is via the Supabase dashboard. That's fine for one admin but unsustainable as the surface grows. Phase 22 builds the proper admin UI.

## Scope

### Pages

1. **/admin/recommendations — index**
   - Table (desktop) / card list (mobile) of all recommendations, newest first
   - Columns: business name, recommender (with town + Local badge), reason excerpt, created, flag count, actions
   - Filters: by category, town, flagged-only, claim_status
   - Quick actions per row: remove (soft delete), unflag, view full

2. **/admin/recommendations/businesses — business index**
   - Table of businesses with recommendation counts
   - Actions: merge into another (resolve duplicates), edit name/category/town
   - Merge flow: select source + target, confirm, all recommendations re-pointed, source business soft-deleted

3. **/admin/recommendations/[id] — recommendation detail**
   - Full text, recommender profile link
   - Flag history (who flagged, when, reason)
   - Remove with reason; remove logged to audit table

### Data model

```sql
-- migration: add_admin_recommendation_audit.sql
ALTER TABLE recommendations
  ADD COLUMN removed_at timestamptz,
  ADD COLUMN removed_by uuid REFERENCES auth.users(id),
  ADD COLUMN removal_reason text;

CREATE TABLE recommendation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES recommendations(id) ON DELETE CASCADE,
  flagged_by uuid REFERENCES auth.users(id),
  reason text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

CREATE TABLE business_merges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_business_id uuid,
  target_business_id uuid REFERENCES businesses(id),
  merged_at timestamptz DEFAULT now(),
  merged_by uuid REFERENCES auth.users(id),
  recommendation_count_moved int
);
```

### Public flagging

- Add a small "Flag" affordance on each recommendation card (only visible to authenticated Whidbey-local users)
- Tapping opens a tiny modal with a reason dropdown: "Spam", "Inappropriate", "Inaccurate", "Other (specify)"
- Submits to flag table; recommendation continues to display but appears in /admin queue

### Notifications

- When admin removes a recommendation, fire `your_recommendation_was_removed` to recommender with reason
- New event_type; opt-in default ON (transparency matters)
- Uses notify() spine

### Out of scope

- Business claim and reply (separate phase; claim_status field continues as placeholder)
- Automated abuse detection
- Bulk operations beyond merge

## Files to Read

- `app/recommendations/page.tsx`, `app/recommendations/[id]/page.tsx`
- `app/admin/layout.tsx`, `app/admin/page.tsx`
- All other `app/admin/*` pages for layout consistency
- `lib/notifications.ts`
- `Planning Documents/design/DESIGN.md` (admin patterns, modals — but use bottom sheet on mobile, not modal)

## Planning Prompt

```
Phase 22 goal: proper admin UI for the recommendations surface.

Specs:

1. Migration add_admin_recommendation_audit.sql per spec (soft-delete columns + flags + merges tables)
2. /admin/recommendations: index with filters, quick actions, mobile card list
3. /admin/recommendations/businesses: merge + edit
4. /admin/recommendations/[id]: detail with flag history and remove
5. Public flagging affordance on recommendation cards (Whidbey-local auth required)
6. notify() integration for your_recommendation_was_removed
7. New event_type registered in notification_preferences defaults (opt-in default ON)

Constraints:
- No business claim/reply yet
- No automated abuse detection
- Soft delete only (preserve audit trail)
- Mobile uses bottom sheet for flag modal, not a centered modal (per DESIGN.md)
- Merge operation must be atomic (transaction) — if it fails, source and target unchanged
- Removed recommendations stay hidden from public surfaces but visible in admin

Plan output: migration SQL, file list, flag modal UX, merge confirmation UX, the new notification event_type wiring.
```

## Iteration Checklist

- [ ] Migration includes all three audit tables
- [ ] Soft delete preserves audit trail
- [ ] Merge is atomic
- [ ] Flag modal is bottom sheet on mobile
- [ ] notify() handles removal notification with reason payload
- [ ] Default-on opt-in for removal notification (transparency)

## Definition of Done

End-to-end:
- [ ] Local user flags a recommendation → row in recommendation_flags
- [ ] Admin opens /admin/recommendations → sees flagged row at top
- [ ] Admin removes with reason → recommendation hidden from /recommendations; recommender receives notification with the reason
- [ ] Admin merges Business A into Business B → all recommendations re-pointed; Business A soft-deleted; business_merges audit row created
- [ ] /admin/recommendations is usable at 375×812 (Phase 19a gave us this baseline)
- [ ] Removed recommendations don't appear in /recommendations or [id] pages
- [ ] Re-running merge with same source fails cleanly (idempotency)

Codebase:
- [ ] Migration applies and is reversible
- [ ] `npm run build` passes
- [ ] `npm run smoke` passes including flag and remove flow
- [ ] Retrospective written
