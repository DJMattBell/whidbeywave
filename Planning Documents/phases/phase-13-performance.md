# Phase 13 — Performance & Polish

## Goal

Loading states, skeleton screens, image optimization, bundle analysis, Lighthouse audit, final QA pass before strategic-track phases begin.

## Files to Read

- All pages under `app/`
- `next.config.js`
- `tailwind.config.ts`
- `package.json`

## Planning Prompt

```
Phase 13 goal: production polish before strategic phases begin. Two-stage: discovery, then prioritized execution.

DISCOVERY:

1. Lighthouse mobile on /, /events, /ferry, /tides, /forum, /marketplace, /news, /visit. Record scores.
2. Identify client components that should be server components.
3. Identify unoptimized images, oversized bundles, slow API routes.
4. axe a11y check on every public route. List violations.
5. Manually: keyboard-navigate, VoiceOver home and a forum thread, 200% browser zoom.
6. Confirm error boundaries on every layout.

TARGETS:
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- LCP < 2.5s on slow 3G
- CLS < 0.05 on all routes
- axe: 0 critical, 0 serious violations
- Initial JS < 200KB per page

EXECUTION (top 10–15 items, prioritized by impact):

- Add skeleton placeholders matching final dimensions everywhere async data loads
- Lazy-load below-fold images
- Convert client components to server components where possible
- Tighten Tailwind purge to drop unused classes
- Add error boundaries where missing
- Fix accessibility violations: aria-labels, focus traps, keyboard nav, contrast
- Optimize bundle: dynamic imports for heavy components (ImageGallery, charts)

Constraints:
- No new features
- No notification engine work (Phase 15)
- No restructuring IA

Plan output: prioritized list with effort estimates. Execute top items; defer rest to future.md.
```

## Iteration Checklist

- [ ] Lighthouse targets measurable, not vibes
- [ ] List is prioritized by impact, not exhaustive
- [ ] No new features
- [ ] axe violations addressed

## Definition of Done

- All routes meet Lighthouse mobile targets
- axe: 0 critical/serious violations
- VoiceOver navigates / and a forum thread without confusion
- At 200% zoom, no content clipped or hidden
- `npm run build` passes with zero warnings
- Bundle size hasn't ballooned (compare to pre-Phase-13)
