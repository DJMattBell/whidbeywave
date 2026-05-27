# WhidbeyWave Roadmap

## Vision
WhidbeyWave should be the app Whidbey locals open every morning instead of Facebook. Two layers earn that:

1. **A site that feels like opening the morning paper on your porch.** Polished, warm, mobile-first, accessible. This is the visual and structural polish work.
2. **A platform that does what Facebook does for the island, better.** Buy Nothing, asking questions, finding services, knowing what's happening today. This is the strategic feature work.

The phases below interleave both. Polish ships first because it's the foundation everything else sits on. Strategic features ship after the surfaces they live on are polished.

---

## Current state (as of this roadmap revision)

- **Phase 1 (Design Foundation) — complete.** Tokens, buttons, cards, banners, empty-state primitives, 18px mobile body, large-text accessibility mode, animation tokens. All landed in `globals.css` and `tailwind.config.ts`. The CSS layer is solid.
- **Phase 2 (Layout & Navigation) — partial.** BottomTabBar, FloatingActionButton, Navbar, Footer exist and use Phase 1 tokens. Some token alignment passes still needed. The current 5-tab structure (Home / Events / Community / Marketplace / More) is staying.
- **Audit doc items — many shipped as tactical fixes** across multiple sessions before this roadmap version. Components like `BottomTabBar`, `FloatingActionButton`, `FerryLiveBoard`, `FerryAutoRefresh`, `FerryStatusPill`, `WelcomeSheet`, `ZipPrompt`, `LocalBadge`, `TextSizeToggle`, `SkeletonCard`, `MarkdownBody`, `ImageGallery` are in place.

Everything below assumes that work as the starting point.

---

## Phases

### Polish track (1 – 13)

These phases continue the polish work already in motion. Each takes a surface or system and aligns it with `design/DESIGN.md`.

| # | Phase | Surface |
|---|---|---|
| 1 | Design Foundation | Tokens & primitives — *complete* |
| 2 | Layout & Navigation | Navbar, Footer, BottomTabBar, FAB — *in progress* |
| 3 | Homepage & Landing | Story-first home: today, what's coming, what's local |
| 4 | Events & Calendar | Cards, date grouping, filter UX, empty states |
| 5 | News & Guides | Reading experience, typography, comments, related content |
| 6 | Marketplace & Listings | Grid, listing cards, contact flow, image gallery |
| 7 | Forum & Community | Thread design, reply UX, post creation |
| 8 | Ferry, Tides & Weather | Live board, charts, widget cohesion |
| 9 | Visitor Experience | This weekend, restaurants, ferry guide, farmers markets, /lands acknowledgment |
| 10 | Forms & Submission Flows | Validation UX, success states, progress |
| 11 | Admin & Dashboard | Moderation, bulk actions, stats |
| 12 | Newsletter & Email | Template design, subscription mgmt, digest layout |
| 13 | Performance & Polish | Loading states, skeletons, image opt, Lighthouse, final QA |

### Strategic track (14 – 18)

These phases turn a polished site into a Facebook replacement. They depend on the polish work because they live on those surfaces.

| # | Phase | Capability |
|---|---|---|
| 14 | Observability & Tooling | Sentry, Plausible, Playwright smoke tests, scraper monitor |
| 15 | Notification Engine | Web push, `notify()`, prefs page, email template extraction |
| 16 | Buy Nothing & Flash Gives | Free-listing toggle, "Neighbors are giving" home section, scoped alerts |
| 17 | Trusted Services | Recommendations by named locals, neighbor counts, soft verification |
| 18 | Chip-Filter Persona (proposal) | Replace current persona model with chip filters — *requires sign-off before starting* |

Why is 14 (Observability) so late? Honestly: the polish work doesn't need it, and inserting it earlier broke discipline last time. Once Phase 15 (Notifications) needs error tracking and Phase 16 (Flash Gives) needs analytics on alert opt-in rates, Phase 14 earns its place. Until then it's nice-to-have.

---

## Phase 1 Tracked Items

These are non-phase bugs or feature failures discovered during other work. They should be addressed before or during Phase 1.

| Item | Source | Problem | Impact |
|------|--------|---------|--------|
| Whidbey Telecom scraper sets `town: 'Other'` | Phase 0.7 diagnosis | `lib/scrapers/whidbey-telecom.ts:162` hardcodes `town: 'Other'` for all events. Events from this source are invisible to anyone using town filters on /events. | Feature failure — silent data loss for filtered views |

---

## Cross-Cutting Principles

These apply to every phase. Non-negotiable.

1. **Mobile-first** — every change starts at 320px and scales up
2. **Plan before code** — every phase produces a written plan first; user approves; then execute. See the Planning Gate section below.
3. **Accessibility** — WCAG 2.1 AA minimum; touch targets ≥ 44px; visible focus states
4. **Warm aesthetic** — no sharp gradients, no SaaS glow, no startup energy
5. **Fail gracefully** — external APIs degrade per `design/error-states.md`. "On Island Time" framing for upstream outages; plain "something's broken on our end" for our own bugs
6. **Design tokens** — all visual decisions flow from `design/DESIGN.md`; no one-off colors, sizes, or spacing
7. **Performance budget** — no page over 200KB initial JS; LCP < 2.5s
8. **Semantic HTML** — correct heading hierarchy, landmarks, ARIA where needed
9. **Empty and error states are designed**, not defaulted. Use the patterns in `design/empty-states.md` and `design/error-states.md`
10. **Notification routing** — after Phase 15 ships, all per-user event notifications route through `notify()`; no direct Resend calls for event notifications

---

## The Planning Gate

This is load-bearing. Read it.

Every phase from #3 onward follows this loop:

1. User pastes the **session preamble** (`phases/_preamble.md`) and a **kickoff prompt** referencing the phase file.
2. Claude Code reads the phase file, this roadmap, DESIGN.md, empty-states.md, error-states.md, AGENTS.md, CONTRIBUTING.md, and the phase's "Files to read" list — silently, no narration.
3. Claude Code produces a **written plan only**, no code. The plan covers files to modify, risks, ambiguities, and which DESIGN.md sections apply.
4. User reviews the plan against the phase's iteration checklist. Iterates with Claude Code until the plan is right.
5. User says **"Proceed with the plan."**
6. Claude Code executes, runs `npm run build`, verifies the Definition of Done.
7. User does manual QA on a 375px viewport (and real phone if the phase touches offline/performance/push).
8. User pastes the **retrospective prompt** and Claude Code's reflection goes into `phases/retro-fixes.md`.
9. Commit with `Phase N: [description]` per `WORKFLOW.md`.

The planning gate exists because shipping autonomously without it produces audit-item-altitude work, not strategic phase work. CLAUDE.md has been updated to explicitly invoke this gate when a `Planning Documents/phases/*.md` file is referenced.

---

## QA Viewports

Every Definition of Done assumes spot-checking on:

- **Mobile 375×812** (Chrome dev tools, iPhone SE — worst case)
- **Desktop 1280px**
- **A real phone on cellular** — required when a phase touches offline, push, or performance

---

## Retroactive Changes to Previous Phases

It happens. Don't fold them into the current phase.

1. Log in `phases/retro-fixes.md` with date, phase, change, commit sha.
2. Commit with `retro(phase-N): description`.
3. Resume the current phase.

This keeps phase boundaries honest.

---

## File Map

- `Planning Documents/ROADMAP.md` — this file
- `Planning Documents/WORKFLOW.md` — git workflow and rollback contract
- `Planning Documents/design/DESIGN.md` — design system
- `Planning Documents/design/empty-states.md` — empty state patterns
- `Planning Documents/design/error-states.md` — error patterns including "On Island Time"
- `Planning Documents/phases/` — per-phase prompts and verification
- `Planning Documents/phases/_preamble.md` — session preamble
- `Planning Documents/phases/future.md` — parked ideas, including Phase 18 if not adopted
- `Planning Documents/phases/retro-fixes.md` — log of retroactive changes
