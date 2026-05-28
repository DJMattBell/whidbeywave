# Phase 6 — Marketplace & Listings

## Goal

Improve the marketplace grid, listing cards, contact flow, image gallery, and seller experience.

## Files to Read

- `app/marketplace/`
- `components/ListingCard.tsx`, `components/ListingDetailModal.tsx`, `components/ListingOwnerActions.tsx`
- `components/MarketplaceGrid.tsx`, `components/MarketplaceCategoryFilter.tsx`, `components/MarketplaceLocationFilter.tsx`, `components/MarketplaceSearch.tsx`
- `components/MarketplaceContactButton.tsx`
- `components/ImageGallery.tsx`
- `Planning Documents/design/DESIGN.md` (card pattern, marketplace grid)

## Planning Prompt

```
Phase 6 goal: marketplace polish.

Specs:

1. Listing cards:
   - Use canonical card pattern with image variant (aspect-4:3 image above title)
   - Terra accent color (small label or border-left strip) since marketplace = exchange
   - Free listings get the existing badge-free style
   - Card is fully tappable

2. Grid:
   - Mobile: single column (`grid-cols-1`)
   - Tablet+: 2–3 columns per DESIGN.md grid rules
   - Generous gap

3. Listing detail (modal or page — pick whichever exists):
   - ImageGallery with swipe between photos and tap-to-zoom
   - Contact button uses .btn-primary
   - Owner actions (edit, mark sold, delete) clearly distinct from contact

4. Filters:
   - Category and Location as chip rows
   - Search input uses .input-base
   - "Clear filters" link visible when filters active
   - Empty-result state per empty-states.md "Marketplace — Search returns nothing"

5. Photo upload on submit-listing:
   - Remove-photo button ≥32px touch target
   - Clear visual feedback during upload

Constraints:
- Do not add price negotiation features (future phase if requested)
- Do not add seller ratings (Phase 17 trusted services is for businesses, not casual sellers)
- Do not add barter offers yet — that's Phase 16

Plan output: list files, visual changes, and how filter state is preserved across navigation.
```

## Iteration Checklist

- [ ] Single-column mobile grid with comfortable card sizes
- [ ] ImageGallery handles 1, 2, and many photos correctly
- [ ] Contact button distinct from owner actions
- [ ] Filter chips work; clear-filters link appears when active
- [ ] No barter, no negotiation, no ratings (saved for later phases)

## Definition of Done

- 375×812: marketplace grid is one column with generous cards
- Tap a card → detail with gallery; swipe between photos works
- Contact seller flow ends in confirmation toast
- Empty filter result shows correct empty state
- `npm run build` passes
