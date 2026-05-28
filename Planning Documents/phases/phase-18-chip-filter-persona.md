# Phase 18 — Chip-Filter Persona (Proposal)

**Status: proposal. Requires explicit sign-off before starting.**

## Goal

Replace the current PersonaSelector ("I live here" / "I'm visiting" / "Ferry info" / "Quick view") with a chip-filter row at the top of the home: "Show me what's good for: kids · seniors · visitors · new residents · everyone."

Default is "everyone." Selecting a chip persists in cookie. Selecting reorders home sections rather than gatekeeping them.

## Why This Is a Proposal, Not a Default

The chip-filter idea came from team-meeting discussion and is genuinely better than the current persona doors *if you want a more flexible community model*. But:

1. PersonaSelector currently works. Replacing it is real work for marginal user-facing benefit.
2. The chip-filter model assumes locals overlap with multiple identities (parent, senior, visitor host). Whether that's true on Whidbey or whether locals self-identify cleanly as "local" is an empirical question.
3. The mystery roadmap rewrote things once already because the team-meeting v5 plan was too restructure-heavy. This is one of those restructures.

So: read this proposal, decide if you want it, sign off before any work starts.

## Files to Read (if proceeding)

- `components/PersonaSelector.tsx`
- `app/page.tsx`
- Cookie usage of `ww-persona` across the codebase
- `Planning Documents/design/DESIGN.md`

## Planning Prompt (if approved)

```
Phase 18 goal: replace persona doors with chip-filter row.

Specs:

1. New component components/ChipFilters.tsx:
   - Horizontal row of chips: Everyone (default), Kids, Seniors, Visitors, New residents, Outdoors
   - Selection persists in 'whidbey-filter' cookie (rename from 'ww-persona', migrate existing values to 'everyone')
   - "Why am I seeing this?" affordance: small text-caption inline link beside the chip row, opens a tooltip/sheet explaining what each chip does
   - All chips ≥44px touch target with ≥8px gap

2. Home reordering logic:
   - Selecting a chip reorders sections (not gatekeeps them)
   - For example: "Kids" puts kid-friendly events first in the events section; "Seniors" surfaces guides for accessibility
   - Default "Everyone" shows current home order

3. Delete components/PersonaSelector.tsx and PersonaBar after migration verified

4. Cookie migration:
   - On every request, check for old 'ww-persona' cookie; write 'whidbey-filter=everyone' and delete old cookie
   - One-time migration; remove after 90 days

Constraints:
- Do NOT remove PersonaSelector until ChipFilters is in place and tested
- Cookie migration must be silent — no user-visible churn
- The home should look very similar; only the persona row changes

Plan output: explicit migration plan with rollback path.
```

## Iteration Checklist (if proceeding)

- [ ] ChipFilters in place before PersonaSelector deletion
- [ ] Cookie migration is silent
- [ ] "Why am I seeing this?" affordance present
- [ ] All chips meet touch-target rules

## Definition of Done

- 375×812: chip row replaces persona doors cleanly
- Tapping a chip reorders events section visibly
- Old cookie users see 'everyone' selected after one visit
- No regression on home performance
- `npm run build` passes

## If Not Approved

Park this as a permanent note in `phases/future.md` and remove this file.
