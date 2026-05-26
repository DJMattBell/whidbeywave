# WhidbeyWave — Claude Code Instructions

## Behavior

### Default mode (no phase file referenced)
- Never ask for permission or confirmation
- Never pause between steps waiting for approval
- Make all changes autonomously start to finish
- Give a brief summary only when completely done
- Be concise — do not narrate what you are doing

### Planning-gate mode (a phase file IS referenced)
**When a prompt references a file in `Planning Documents/phases/`, the planning gate overrides the default autonomous mode.** Specifically:

1. Read the phase file end-to-end before doing anything else
2. Read `Planning Documents/ROADMAP.md`, `Planning Documents/WORKFLOW.md`, `Planning Documents/design/DESIGN.md`, and the phase's "Files to read" list
3. Produce a **written plan only** — no code changes — covering file operations, risks, ambiguities, and DESIGN.md sections applied
4. Wait for explicit user approval (e.g., "Proceed with the plan") before executing
5. After approval, execute autonomously per the plan
6. Run `npm run build` and any phase smoke test before declaring done
7. If verification fails after one fix attempt, stop and apply the rollback contract in `Planning Documents/WORKFLOW.md` — do not loop on fixes

The planning gate is non-negotiable when a phase file is in the prompt. It exists because skipping it produces audit-item-altitude work instead of strategic phase work.

## Project
WhidbeyWave.com — a local news, events, and
community hub for Whidbey Island, Washington.
Warm, small-town Pacific Northwest aesthetic.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Resend (email)
- WSDOT API (ferry status)
- NOAA + Open-Meteo (tides + weather)

## Commands
```
npm run dev       — start dev server
npm run build     — production build
npm run lint      — lint check
npm run smoke     — Playwright smoke tests (added in Phase 14)
```

## Design Rules
- Color palette per `Planning Documents/design/DESIGN.md`
- Color encodes meaning: forest=brand, sound=utility, amber=events/warmth, terra=marketplace/urgent
- Fonts: Playfair Display headings, Lora body
- Tone: warm, unhurried, small-town neighbor
- Never use sharp gradients, glowing effects, or anything that reads "SaaS" or "startup"
- Mobile-first always; touch targets ≥44px

## Architecture
- `/app` — Next.js app router pages
- `/components` — shared components
- `/lib` — utilities, data fetching, Supabase client
- `/supabase` — migrations and schema
- `/Planning Documents` — roadmap, workflow, design system, phase prompts

## Key Conventions
- All API keys come from environment variables only
- Never hardcode sensitive values
- External APIs (ferry, weather, tides) degrade per `Planning Documents/design/error-states.md`:
  - Upstream outage → "On Island Time" framing
  - Our own bug → "Something's broken on our end"
  - User offline → "You're offline. Showing cached data"
- RLS is enabled on all Supabase tables
- Admin email: use `ADMIN_EMAIL` env variable
- After Phase 15 ships: all per-user event notifications route through `lib/notifications.ts` `notify()`; no direct Resend calls for event notifications

## Event Scraper Strategy
When adding a new event source, choose the best approach in this priority order:

1. **Fix HTML selectors** — if the site serves events in static HTML, use cheerio with the correct CSS selectors for that specific site
2. **Platform API** — Squarespace (append `?format=json`), WordPress with The Events Calendar (`/wp-json/tribe/events/v1/events`), or other structured JSON/RSS endpoints
3. **iCal/ICS feed** — most reliable when available

Never copy-paste selectors from one scraper to another — always inspect the actual site. Wix sites render client-side and cannot be scraped without a headless browser; skip them.

After Phase 14: every scraper writes a row to `scrape_log` on every run (success or failure) so `/admin/scrapers` reflects health.
