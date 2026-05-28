# Phase 7 — Forum & Community

## Goal

Forum thread design, reply UX, post creation, category navigation, and community engagement patterns. Polished and mobile-app-feeling.

## Files to Read

- `app/forum/` (index, thread, new post)
- `components/forum/` (all)
- `components/QuickReactions.tsx`
- `components/AuthModal.tsx`
- `Planning Documents/design/DESIGN.md` (card pattern with forum variant)

## Planning Prompt

```
Phase 7 goal: forum feels app-like on mobile.

Specs:

1. /forum index:
   - Card list using canonical card pattern (forest accent strip on left)
   - Each card: title (truncate 1 line), author town badge if Whidbey zip, time-ago, reply count
   - Sort: most recent activity first
   - Top: chip-filter row for category
   - "Ask the island" prompt card that opens new-post sheet

2. /forum/[id] thread:
   - Original post styled with h3 title, body text
   - Replies chronological with author name, town badge, time-ago, body
   - Reply trigger fixed at bottom on mobile (single-line tap target ≥48px) opens a bottom-sheet
   - Bottom-sheet has textarea, send button. Respects iOS safe-area-inset

3. New post (from sticky card or FAB):
   - Same bottom-sheet pattern
   - Adds category picker and title field above body
   - First-time posters see one-time inline note: "Your name and town will appear on this post. We use real names so neighbors trust each other."

4. Reactions (QuickReactions stays):
   - Already exists; ensure it sits cleanly within the new card pattern
   - Do NOT add per-reaction notifications (Phase 15 will add a weekly digest opt-in instead)

Constraints:
- Do not add DMs, mentions, or multi-level threading (future phases)
- Do not add anonymous posting
- Do not wire reply-notification emails yet (Phase 15 wires them through the notification engine)
- For now, the existing forum-reply email flow keeps working as-is; Phase 15 will refactor it

Plan output: list files, the visual diff per surface, and how the bottom-sheet pattern is implemented (component name, accessibility).
```

## Iteration Checklist

- [ ] All cards use canonical forum-variant pattern
- [ ] Bottom-sheet handles iOS safe-area
- [ ] First-time-poster note appears once per user
- [ ] No DMs, mentions, or multi-level threading
- [ ] Reply-notification email flow preserved (don't break it; Phase 15 refactors)

## Definition of Done

- 375×812: forum index reads as a clean card list; tap a card opens thread
- Reply bottom-sheet opens, doesn't obscure the post being replied to
- New post sheet has category, title, body
- First-time-poster note appears exactly once
- `npm run build` passes
