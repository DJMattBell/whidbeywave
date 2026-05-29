# Session Preamble

Paste this at the start of every Claude Code session for this project, immediately before the phase's kickoff prompt.

```
Project: WhidbeyWave at /Users/papa/code/whidbeywave.

All planning docs live in Planning Documents/ at the project root.

Read these silently before responding to the prompt that follows:
- Planning Documents/ROADMAP.md (current phase list and cross-cutting principles)
- Planning Documents/WORKFLOW.md (rollback contract — this is in effect)
- Planning Documents/design/DESIGN.md (design system)
- Planning Documents/design/empty-states.md and Planning Documents/design/error-states.md (canonical UX patterns)
- CLAUDE.md (project rules — planning gate takes precedence when a phase file is referenced)
- AGENTS.md (architecture)
- CONTRIBUTING.md (conventions)
- The phase file in Planning Documents/phases/ referenced by the prompt below
- The "Files to read" list inside that phase file

For all planning prompts in this project: produce a written plan only, no code. The plan covers (a) file operations, (b) risks and ambiguities, (c) which sections of DESIGN.md are relevant. I will approve before you execute.

After execution, you will run `npm run build` and any phase-specific verification before declaring done. If verification fails after one fix attempt, stop and apply the rollback contract from Planning Documents/WORKFLOW.md — do not loop on fix attempts.
```

## Kickoff prompt (one line, per phase)

After pasting the preamble, paste this:

```
Begin Phase N. Read Planning Documents/phases/phase-NN-name.md and produce the plan as instructed.
```

Examples:
- `Begin Phase 3. Read Planning Documents/phases/phase-03-homepage.md and produce the plan as instructed.`
- `Begin Phase 14. Read Planning Documents/phases/phase-14-observability.md and produce the plan as instructed.`

## Retrospective prompt (at end of every phase)

```
Phase N is complete and verified. Look at what shipped. What would you do differently if you ran it again? Three points max, be specific.
```

Log the response to `Planning Documents/phases/retro-fixes.md`.
