# Phase 11 — Admin & Dashboard

## Goal

Admin moderation experience: bulk actions, stats, content management, feedback review.

## Files to Read

- `app/admin/` (all)
- `app/dashboard/`
- `lib/adminAuth.ts`
- `Planning Documents/design/DESIGN.md` (dashboard max-w, card pattern)

## Planning Prompt

```
Phase 11 goal: admin tools that make moderation fast on mobile and desktop.

Specs:

1. /admin home:
   - Stats at top (pending events, pending listings, pending guides, recent forum reports)
   - Quick links to each moderation queue

2. Moderation queues (events, listings, guides):
   - Card list with title, submitter, town, submission time
   - Inline actions: Approve, Reject, Edit
   - Bulk selection (checkboxes) with bulk Approve / Reject
   - Empty state per empty-states.md

3. Feedback review (/admin/feedback):
   - List of feedback items with timestamp, page, user (if signed in)
   - Mark as resolved button

4. Content management:
   - Existing news/guide admin surfaces aligned with Phase 1 tokens
   - Use .card, .input-base, .btn-* classes consistently

Constraints:
- Do not change RLS policies
- Do not add new admin capabilities beyond what's listed
- Mobile usability matters — admins moderate from their phones

Plan output: list files, surfaces, and any places where existing admin code uses ad-hoc styles.
```

## Iteration Checklist

- [ ] Mobile-usable (admins moderate from phones)
- [ ] Bulk actions work for events and listings
- [ ] No RLS changes
- [ ] All admin surfaces use Phase 1 tokens

## Definition of Done

- /admin renders cleanly at 375×812
- Bulk approve/reject works
- Feedback queue actionable
- `npm run build` passes
