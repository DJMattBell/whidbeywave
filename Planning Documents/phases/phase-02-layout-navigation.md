# Phase 2 — Layout & Navigation

**Status: in progress.** BottomTabBar, FloatingActionButton, Navbar, and Footer exist and use Phase 1 tokens. Remaining work focused on token alignment passes and small UX refinements.

## Goal

Align Navbar, Footer, BottomTabBar, and shell components with Phase 1 design tokens. Consistent border-radius, active-state colors, semantic improvements, and animated hamburger.

## Files to Read

- `components/Navbar.tsx`
- `components/Footer.tsx`
- `components/BottomTabBar.tsx`
- `components/FloatingActionButton.tsx`
- `components/BackToTop.tsx`
- `components/FeedbackButton.tsx`
- `app/layout.tsx`
- `Planning Documents/design/DESIGN.md` (layout, buttons, animations sections)

## Planning Prompt

```
Phase 2 polish: align nav and shell components with Phase 1 tokens.

Changes:
- Active nav items: any forest-500 → forest-600
- Dropdowns: rounded-xl → rounded-lg
- Mobile drawer buttons: rounded-xl → rounded-lg, forest-500 → forest-600
- Footer: remove inline font-family styles (h3 inherits from CSS)
- BottomTabBar more sheet: rounded-2xl → rounded-xl
- FeedbackButton inputs: rounded-xl → rounded-lg, switch to .input-base
- Layout skip-link: rounded-xl → rounded-lg
- Hamburger: animated bars → X transform on open

Keep the 5-tab structure (Home / Events / Community / Marketplace / More). The FAB stays. Do not restructure navigation in this phase.

Plan output: list every file touched and what changed in each. Note any places where the Phase 1 token isn't a clean replacement.
```

## Iteration Checklist

- [ ] No structural nav changes — only token alignment
- [ ] Hamburger animation is subtle (bars → X), not flashy
- [ ] FeedbackButton inputs use `.input-base`
- [ ] No new components introduced

## Definition of Done

- All five files use Phase 1 tokens consistently
- Hamburger animates smoothly on mobile
- Skip-link still visible on keyboard focus
- `npm run build` passes
- Manual QA: BottomTabBar visible at 375×812, FAB doesn't overlap content

## Why No Tab Restructure

Earlier roadmap versions proposed dropping to 4 tabs with a Today tab. After review, the current 5-tab structure (Home / Events / Community / Marketplace / More) is fine and changing it would require deleting working code for marginal benefit. The Today block on the home and the existing Ferry page cover the commuter use case. If a Today tab is wanted later, it gets proposed as a Phase 18 (or later) restructure, not folded into polish work.
