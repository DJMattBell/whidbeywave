# Phase 17 — Trusted Services

## Goal

A recommendations directory where Whidbey locals recommend businesses under their real names. "Recommended by N neighbors" surfaces. Soft local verification (Whidbey zip = local).

**Design philosophy:** Locals trust "Sarah from Langley recommends this electrician" more than three anonymous stars. Identity is exposed. Verification is soft.

## Files to Read

- `app/recommendations/`
- `components/recommendations/` (existing)
- `lib/whidbey-zips.ts`
- `lib/notifications.ts` (from Phase 15)
- Existing recommendations table schema in supabase/migrations/
- `Planning Documents/design/DESIGN.md` (card pattern with recommendation variant)
- `Planning Documents/design/error-states.md` (Locals Only pattern)

## Planning Prompt

```
Phase 17 goal: trusted services done in a way that beats anonymous-Yelp via social trust.

Specs:

1. Data model (extend existing recommendations table — verify what exists first):
   - business_name, category, town, recommender (user_id), short_reason (140 char), longer_story (optional markdown), created_at
   - Each business: many recommendations
   - Computed "neighbors recommending" count per business (dedup by user_id)
   - businesses table if not present: id, name, category, town, claim_status (nullable; Phase 18+ wires claims)

2. "Neighbors recommending" surface:
   - Business detail page: "Recommended by N neighbors" header with tappable avatars + first names + town
   - Browse cards use card pattern with terra accent (exchange-of-trust)

3. Verification (soft launch):
   - Local-verified = user has a Whidbey zip stored in profile. That's it.
   - No activity/submission thresholds in this phase
   - Local-verified can recommend; non-local can read
   - Non-local taps "Recommend this business" → ErrorState "Locals only" per error-states.md with link to /lands or explainer
   - "Local" badge (small, forest color) on each recommendation
   - First-time recommender: one-time prompt "We use real names so neighbors trust each other. Your name and town will appear on this recommendation."

4. Browse and detail:
   - /recommendations index: card grid, filterable by category and town, sortable by most-recommended (default) and most-recent
   - /recommendations/[business-id]: detail with recommendations feed, recommender avatars, expandable longer stories
   - Empty state per empty-states.md "Recommendations — No reviews"

5. Notifications (via Phase 15 notify()):
   - business_you_recommended_got_recommended: weekly digest, email-only, default OFF
   - business_you_recommended_hit_milestone: 5/10/25 totals, one-time per milestone, push default ON
   - new_recommendation_in_my_town: opt-in, default OFF

6. /admin/recommendations:
   - Flag/remove inappropriate recommendations
   - Merge duplicate business entries (preserve recommendations on merge)

7. Verification explainer page (linked from "Locals only" error state):
   - Small page explaining: "WhidbeyWave verifies locals by zip code on your profile. If you live on Whidbey Island, update your zip in /profile to recommend businesses."
   - Honest about the limitations of this verification model

Constraints:
- Do NOT add ratings or stars (the recommendation IS the rating)
- Do NOT let businesses claim or reply yet (future phase; businesses.claim_status is placeholder)
- Do NOT allow anonymous recommendations
- Do NOT tighten verification beyond Whidbey zip — if abuse appears, that's a retro fix

Plan output: list files, migration SQL if needed, the verification UX, and confirmation that all notifications route through Phase 15 notify().
```

## Iteration Checklist

- [ ] Not building anonymous-Yelp
- [ ] Verification is soft (Whidbey zip only)
- [ ] Reuses existing recommendations table
- [ ] Notifications via Phase 15 engine
- [ ] Business claim/reply deferred
- [ ] All UI follows DESIGN.md
- [ ] "Locals only" uses error-states.md pattern

## Definition of Done

End-to-end:
- [ ] User with Whidbey zip recommends a business in <60s
- [ ] User without Whidbey zip sees browse but submit replaced with "Locals only" notice with helpful link
- [ ] Submitting recommendation #5 for a business triggers milestone notification to prior recommenders
- [ ] No anonymous recommendations anywhere in UI
- [ ] /admin/recommendations lets you remove and merge

Codebase:
- [ ] `npm run smoke` passes
- [ ] `npm run build` passes
- [ ] No anonymous-write paths in /api/recommendations/*
