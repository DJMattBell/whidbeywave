# Phase 9 — Visitor Experience

## Goal

Landing pages for visitors: this weekend, restaurants, ferry guide, farmers markets. Curated and welcoming. Includes the Coast Salish land acknowledgment surfaces (`/lands` page, footer mention, /about prominence).

## Files to Read

- `app/visit/` (existing structure)
- `app/about/` (Coast Salish acknowledgment goes here too)
- `components/Footer.tsx` (footer acknowledgment line)
- `Planning Documents/design/DESIGN.md` (layout, type)

## Planning Prompt

```
Phase 9 goal: visitor surfaces polished and curated. Coast Salish acknowledgment given the seriousness it deserves.

Specs:

1. /visit as a one-pager (not a directory hub):
   Sections in order:
   - Hero: "Visiting Whidbey? Start here."
   - Getting here: 3 bullets compressed from ferry guide, link to /visit/ferry-guide for detail
   - How to visit conscientiously: 4–5 short paragraphs on ferry-line etiquette, when to come/avoid, leave-no-trace basics, support-local
   - This weekend: live preview of 3 visitor-friendly events
   - Top 5 don't-miss: editorially curated, hardcoded in lib/visit-highlights.ts (admin UI is future)
   - Where to eat: brief intro, link to /visit/restaurants if exists, else stub
   - Where to stay: brief, with explicit "we don't take ads" line
   - Coast Salish acknowledgment block at bottom, with link to /lands

2. /visit/this-weekend:
   - Auto-populates with events in next 72 hours (Fri–Sun default; ?days=N override)
   - Audience filter chips: kids, adults, free, outdoor (map to existing event tags)
   - Empty state per empty-states.md "/visit/this-weekend"

3. /lands page (NEW):
   - Brief, accurate
   - "WhidbeyWave operates on the ancestral lands of the Coast Salish peoples, including the Lower Skagit, Snohomish, Suquamish, and Swinomish tribes. We are committed to ongoing learning."
   - Link to authoritative external resources: Burke Museum, the respective tribal nations' official websites
   - Make clear this is ongoing learning, not a one-time statement
   - We do not write the history ourselves — we point to authoritative sources

4. Footer:
   - Add a small acknowledgment line above the copyright: "On the ancestral lands of the Coast Salish peoples. [Learn more]"
   - Link goes to /lands

5. /about:
   - Add an acknowledgment block prominently (not buried)
   - Link to /lands

6. /visit/ferry-guide, /visit/restaurants, /visit/farmers-markets:
   - Polish each per DESIGN.md
   - Card pattern, type scale, empty states

Constraints:
- Do not fabricate tribal history. Always point to authoritative sources.
- Acknowledgment is respectful and substantive, not bolted-on
- Do not translate /lands or /visit content to Spanish yet (future phase)

Plan output: list files, the acknowledgment copy used in each location, and the external resource links you'll include on /lands.
```

## Iteration Checklist

- [ ] /lands page exists with respectful tone and authoritative external links
- [ ] Footer acknowledgment line present
- [ ] /about has prominent acknowledgment
- [ ] /visit reads as one coherent page
- [ ] /visit/this-weekend filters work correctly
- [ ] No fabricated tribal history; only links to authoritative sources

## Definition of Done

- /lands renders with substantive copy and working external links
- Footer shows acknowledgment line on every page
- /about acknowledgment is prominent
- /visit/this-weekend updates as events approach (test Friday vs Sunday)
- `npm run build` passes
- A first-time visitor lands on /visit and can plan a day trip from that page alone
