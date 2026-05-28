# Phase 5 — News & Guides

## Goal

Refine the news listing and article pages: reading experience, typography, comment section, related content. Polish the guides surface similarly.

## Files to Read

- `app/news/` (listing and detail pages)
- `app/guides/`
- `components/MarkdownBody.tsx`
- `components/NewsCommentSection.tsx`
- `Planning Documents/design/DESIGN.md` (typography, layout max-widths, card pattern)
- `Planning Documents/design/empty-states.md`

## Planning Prompt

```
Phase 5 goal: news/guides reading experience.

Specs:

1. Article detail page (/news/[slug], /guides/[slug]):
   - Body uses .prose-ww styles (already in globals.css)
   - Max width max-w-4xl for reading
   - Date, author, read time in body-sm muted
   - Hero image (if present) full-bleed at top with rounded corners on desktop, edge-to-edge on mobile
   - Related content block at bottom (3 cards) — wired to existing related logic if any

2. News listing (/news):
   - Card grid using card pattern
   - Category badge on each card uses categoryColors from lib/data.ts
   - Empty state per empty-states.md

3. Guides listing (/guides):
   - Same card pattern; differentiated by type badge (Hike / Art Walk / Food / etc.)
   - Filter by type as chip row

4. Comments (NewsCommentSection):
   - Use card pattern for each comment
   - Reply form uses .input-base
   - "Sign in to comment" pattern uses the auth-gate pattern from error-states.md

Constraints:
- Audit doc item #17 (article body spacing + max-width) folds in here
- Do not change underlying data model
- Comment posting still routes through existing API

Plan output: list files, visual changes, and confirm prose-ww classes match DESIGN.md typography rules.
```

## Iteration Checklist

- [ ] Article reading width is generous but not too wide (max-w-4xl)
- [ ] Body type uses .prose-ww
- [ ] Date/author/read time muted, not competing with body
- [ ] Hero image full-bleed at appropriate breakpoints
- [ ] Empty state for news listing per canonical pattern

## Definition of Done

- 375×812: an article reads comfortably with proper line length and rhythm
- News listing grid feels generous, not cramped
- Comments use card pattern
- `npm run build` passes
