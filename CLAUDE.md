# WhidbeyWave — Claude Code Instructions

## Model selection

Use the newest Opus (claude-opus-4-6) for planning, grilling, architecture decisions, code review, and migration review. Use Sonnet for implementation and routine coding. Use Haiku for bulk searches, scraper triage, log filtering, and low-ambiguity automation. When spawning subagents, default to Sonnet and promote to Opus only for review or planning subagents.

## Plan mode

Make plans extremely concise. Sacrifice grammar for brevity. At the end of each plan, list unresolved questions. Do not produce a wall of text — produce a scannable, actionable checklist.

## Session hygiene

Monitor token usage. The effective "smart zone" is ~100–140k tokens — beyond that, quality degrades. When approaching 120k, wrap up the current task and suggest a fresh session.

## Code review

Always review in a separate subagent with fresh context. The agent that wrote the code must not review it in the same session. Review checks two axes: (1) does it follow this repo's rules? (2) does it match the phase spec?

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
3. Produce a **written plan only** — no code changes — covering file operations, risks, ambiguities, and DESIGN.md sections applied. Keep it concise with unresolved questions at the end
4. Wait for explicit user approval (e.g., "Proceed with the plan") before executing
5. After approval, execute autonomously per the plan
6. Run `npm run build` and any phase smoke test before declaring done
7. If verification fails after one fix attempt, stop and apply the rollback contract in `Planning Documents/WORKFLOW.md` — do not loop on fixes

The planning gate is non-negotiable when a phase file is in the prompt. It exists because skipping it produces audit-item-altitude work instead of strategic phase work.

## Project

Repo location: /Users/papa/code/whidbeywave (moved out of iCloud 2026-05-28; never put back in iCloud).

WhidbeyWave.com — a local news, events, and community hub for Whidbey Island, Washington. Warm, small-town Pacific Northwest aesthetic.

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
- Mobile-first always; touch targets >= 44px

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
  - Upstream outage: "On Island Time" framing
  - Our own bug: "Something's broken on our end"
  - User offline: "You're offline. Showing cached data"
- RLS is enabled on all Supabase tables
- Admin email: use `ADMIN_EMAIL` env variable
- After Phase 15 ships: all per-user event notifications route through `lib/notifications.ts` `notify()`; no direct Resend calls for event notifications
- **When Claude makes a mistake, update this file.** Every error is a chance to improve future sessions.

## Event Scraper Strategy

When adding a new event source, choose the best approach in this priority order:

1. **Fix HTML selectors** — if the site serves events in static HTML, use cheerio with the correct CSS selectors for that specific site
2. **Platform API** — Squarespace (append `?format=json`), WordPress with The Events Calendar (`/wp-json/tribe/events/v1/events`), or other structured JSON/RSS endpoints
3. **iCal/ICS feed** — most reliable when available

Never copy-paste selectors from one scraper to another — always inspect the actual site. Wix sites render client-side and cannot be scraped without a headless browser; skip them.

After Phase 14: every scraper writes a row to `scrape_log` on every run (success or failure) so `/admin/scrapers` reflects health.

## Deployment Discipline (added May 2026 after broken-deploy recovery)

**Current live deploy**: `dpl_HY2CkPDLerTnj9PQQejauMnyAG5g` (commit 6e5b0ac)

After a two-month period of failed deploys went undetected, the following practices became mandatory:

### Before every commit
- Run `npm run build` locally. Phase 18 introduced a build break that ran undetected for 2 months because builds were never run locally before pushing.
- One logical change per commit. Phase 20 was shipped in 6 commits, not 1. Each was independently revertable.

### Infrastructure facts
- **Vercel tier**: Pro ($20/month). Cron limit: 40. Currently using 5.
- **Supabase tier**: Free (no auto-backups, no point-in-time recovery). Manual `pg_dump` backups weekly minimum.
- **Repo location**: `~/code/whidbeywave/`. NEVER place in iCloud, Dropbox, or any sync folder — git index files conflict with sync daemons and corrupt the repo. iCloud caused 173 duplicate files and multiple `.git/index` corruption events before this was caught.
- **Deploy webhook**: GitHub App -> Vercel. The GitHub App must have "Repository access" granted to `whidbeywave` specifically (not just "all repositories" at org level).

### If pushes stop deploying
Check in this order:
1. GitHub App "Repository access" includes whidbeywave
2. Most recent commit's check status on the GitHub branches page
3. `vercel.json` cron count vs plan limit
4. Vercel project's git connection (Settings -> Git)

### Production database operations
- Migrations may be applied via Supabase MCP, but only after the user has reviewed the SQL.
- For ANY migration touching existing tables (ALTER, DROP, DELETE FROM), explicitly pause and require user approval before applying.
- Take a `pg_dump` backup before applying any migration that isn't a pure additive CREATE TABLE.
- Never apply a migration in the same commit chunk as the code that depends on it. Migration commit -> manual review -> apply -> then code commit. This ordering prevents "code deployed against a table that doesn't exist yet" errors.

### Chunked commit pattern for new features
When shipping a phase that touches database + API + components + pages + docs:
1. Migration SQL only (commit, push, deploy, apply manually)
2. API routes
3. Frontend components + hooks (unwired)
4. Frontend page(s)
5. Integration into existing pages (the user-visible commit)
6. Documentation

Each chunk: `npm run build` -> commit -> push -> wait for Vercel READY -> verify on live site -> only then proceed.

## Agent skills

### Issue tracker

GitHub Issues on this repo (`DJMattBell/whidbeywave`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at root). See `docs/agents/domain.md`.
