# Workflow & Rollback Contract

## Execution Flow

1. **Plan** — Read the phase file, produce a written plan covering file operations, risks, ambiguities, and which DESIGN.md sections apply. **No code at this step.**
2. **Approve** — User reviews and confirms. Iterate on the plan until correct.
3. **Execute** — Implement changes autonomously per the approved plan.
4. **Verify** — Run `npm run build` to confirm no build errors. If the phase has additional verification (e.g., `npm run smoke:phase-N` after Phase 14), run those too.
5. **Manual QA** — User checks the Definition of Done on QA viewports (375×812, 1280px, real phone where needed).
6. **Retrospective** — Paste the retrospective prompt; log the response to `phases/retro-fixes.md`.
7. **Commit** — One git commit per phase (or series for large phases). Format: `Phase N: [short description]`.

The planning step exists because skipping it produces audit-item-altitude work, not strategic phase work. The planning step is the discipline.

## Rollback Contract

If execution fails (build errors that can't be resolved in one fix attempt, or Definition of Done can't be met):

1. **Stop immediately** — Do not continue making changes.
2. **Report** — Explain what failed and why.
3. **Rollback** — `git checkout -- .` to discard all uncommitted changes.
4. **Reassess** — Propose an alternative approach or smaller scope. Do not loop on fix attempts.

The rollback contract is in effect on every phase. Mention it in the session preamble.

## Rules

- Each phase gets its own git commit (or a series for large phases).
- Never leave the build broken between phases.
- If a phase touches more than 15 files, break it into sub-phases.
- Always run `npm run build` before declaring a phase complete.
- If lint errors appear, fix them before committing.
- After Phase 15 ships, no API route may call `resend.emails.send` directly for per-user event notifications — use `notify()`.

## Branch Strategy

Solo project. All work happens on `main`. Each phase commit follows:

```
Phase N: [short description]

[bullet list of key changes]
```

For retroactive fixes:

```
retro(phase-N): [short description]

[bullet list]
```

## Scope Discipline

If during a phase Claude Code wants to expand scope, **refuse**. Park the extra work in `phases/future.md`. The phased plan only works if phases stay scoped.

If the user asks Claude Code to expand scope mid-phase, ask them to confirm: "This expands scope beyond the phase plan. Do you want to park this in future.md or extend the current phase plan?" — and let the user decide explicitly.
