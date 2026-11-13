# WhidbeyWave — Claude Code Rules

Architecture, routing, schema, component inventory → AGENTS.md.
Domain rules (scrapers, design, auth, notifications, ferry) → .claude/rules/.
Human contributor guide → CONTRIBUTING.md.

## Commands
```
npm run dev              # dev server
npm run build            # production build (run before every commit)
npm run lint             # ESLint
npm run smoke            # Playwright smoke tests
npm run test:integration # Vitest integration tests
```

## Model selection
Opus for planning, review, architecture, migration review. Sonnet for implementation. Haiku for bulk search, scraper triage, log filtering. Default subagents to Sonnet; promote to Opus only for review/planning.

## Session rules
- Smart zone: ~100–140k tokens. At 120k, wrap up and suggest a fresh session.
- Code review runs in a separate subagent with fresh context — never the same session that wrote the code.
- When Claude makes a mistake, update the relevant file (this file, rules, or AGENTS.md).

## Default mode
Produce a written plan before making changes. Skip only when told "no plan needed" or for trivial fixes.

## Planning-gate mode (phase file referenced)
When a prompt references a file in `Planning Documents/phases/`:
1. Read the phase file + ROADMAP.md + WORKFLOW.md + DESIGN.md + the phase's "Files to read" list
2. Produce a plan only — no code. Cover file ops, risks, DESIGN.md sections applied
3. Wait for explicit approval before executing
4. After execution: `npm run build` + phase smoke test
5. One fix attempt on failure, then rollback contract (see WORKFLOW.md)

## Deployment discipline
- **Live deploy**: commit ae8d258 (2026-11-06)
- **Vercel Pro** ($20/mo). Cron limit: 40, currently using 6.
- **Supabase Free** — no auto-backups. Manual `pg_dump` weekly minimum.
- Chunked commits: migration SQL → API routes → components → pages → integration → docs. Each chunk: build → commit → push → verify on live.
- Never combine migration + dependent code in one commit.

## If pushes stop deploying
1. GitHub App "Repository access" includes `whidbeywave` (not just org-level)
2. Most recent commit's check status on GitHub branches page
3. `vercel.json` cron count vs plan limit
4. Vercel project git connection (Settings → Git)

## Agent skills
- Issue tracker: `docs/agents/issue-tracker.md` (GitHub Issues on `DJMattBell/whidbeywave`)
- Triage labels: `docs/agents/triage-labels.md`
- Domain docs: `docs/agents/domain.md` (`GLOSSARY.md` + `docs/adr/`)

## Critical don'ts
- No scope creep — park extras in `phases/future.md`
- Never put repo in iCloud/Dropbox/sync folders
- No direct `resend.emails.send()` for per-user notifications — use `notify()` from `lib/notifications.ts`
- Hooks in `.claude/settings.json` auto-run lint on edit and build on commit — don't duplicate

## Rollback contract
Build fails after one fix attempt → stop, report, `git checkout -- .`, reassess. Full contract in `Planning Documents/WORKFLOW.md`.
