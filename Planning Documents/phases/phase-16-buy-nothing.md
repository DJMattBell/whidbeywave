# Phase 16 — Buy Nothing & Flash Gives

## Goal

Replace the local Facebook Buy Nothing group with a clean mobile flash-give flow, a "Neighbors are giving" home section, and opt-in push alerts scopable by category/town. Add barter offers reusing the existing contact flow.

**Why this matters:** Buy Nothing groups are the single biggest reason locals stay on Facebook. This is the wedge.

## Files to Read

- `app/marketplace/`, `app/submit-listing/`
- `components/Listing*.tsx`, `components/Marketplace*.tsx`
- `components/ListingAlertSubscription.tsx`
- `lib/marketplace.ts`
- `lib/notifications.ts` (from Phase 15)
- `Planning Documents/design/DESIGN.md` (card pattern, flash-give variant)

## Planning Prompt

```
Phase 16 goal: replace the local Facebook Buy Nothing group, tighten marketplace.

Specs:

1. Flash give flow:
   - submit-listing form gets a prominent "Free / gifting" toggle at the top
   - When toggled: form simplifies to title + photo + pickup location + duration (24h / 48h / week). Hides price, barter, contact-method-other-than-default
   - Free listings: verify is_free flag exists; add via migration if not
   - "Flash give" badge using .badge-free in lists
   - On approval, notify() fires flash_give_in_my_area to subscribers matching scope

2. notify() scope filtering:
   - Extend Phase 15 notify() to honor notification_preferences.scope JSON ({ categories: [...], towns: [...] })
   - Only fires if event payload matches the scope (empty arrays = match all)
   - Returns count of recipients matched for logging

3. Home "Neighbors are giving" section:
   - Renders only if ≥2 active free listings; otherwise hidden
   - Horizontal scroll with snap on mobile, grid on desktop
   - Each card uses the flash-give variant from DESIGN.md (thin gift-icon strip across top instead of plain title row)
   - End-of-scroll CTA: "Notify me of new free items" → opens subscription bottom sheet with category/town scope chips

4. Subscription sheet:
   - Categories: multi-select chips
   - Towns: multi-select chips
   - "All categories" / "All towns" quick toggles
   - Channel: push (default if available), email (default)
   - Saves to notification_preferences with scope JSON

5. Barter:
   - Migration: add barter_open boolean and barter_seeking text to listings
   - Submit-listing: when not flash give, optional "Open to barter" toggle reveals barter_seeking textarea
   - Listing detail: when barter_open=true, "Make a barter offer" button alongside contact button
   - Tapping opens MarketplaceContactButton's existing message flow with "[Barter offer]" prefix — no parallel system

6. ListingAlertSubscription refactor:
   - Switch from direct Resend to notify()
   - Migrate existing subscribers to notification_preferences with scope

Constraints:
- ONE listings table with flags (is_free, barter_open), not parallel tables
- Barter reuses MarketplaceContactButton, no parallel messaging
- All alerts via Phase 15 notify()
- "Neighbors are giving" hides itself when empty (no sad empty state)
- Scope filtering implemented in notify(), not duplicated per subscriber

Plan output: full migration SQL, list of files modified, the subscription sheet UX, and confirmation that scope filtering lives in notify().
```

## Iteration Checklist

- [ ] One listings table with flags, not parallel tables
- [ ] Barter reuses existing contact flow
- [ ] All alerts via notify()
- [ ] "Neighbors are giving" hides when empty
- [ ] Scope filtering in notify(), not duplicated
- [ ] Flash-give variant card uses gift-icon strip per DESIGN.md
- [ ] Migration plan accounts for existing ListingAlertSubscription users

## Definition of Done

End-to-end flash give:
- [ ] User A taps FAB → Flash Give → submits gift
- [ ] Admin approves
- [ ] User B (subscribed to "all free items, Langley") gets push within 60s
- [ ] User C (subscribed to "Oak Harbor only") does NOT get push
- [ ] User B taps push → listing → "I want this" → message via contact flow

End-to-end barter:
- [ ] User submits listing with barter_open=true
- [ ] Listing detail shows barter button
- [ ] Tap barter button → message sheet pre-fills with "[Barter offer]"

Codebase:
- [ ] Migration applies cleanly
- [ ] Existing ListingAlertSubscription users migrated
- [ ] `npm run smoke` passes
- [ ] `npm run build` passes
