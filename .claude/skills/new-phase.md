# Skill: New Phase Execution

Invoke when starting a new implementation phase.

## Workflow

1. **Preamble reads** (silent — do not narrate):
   - Planning Documents/ROADMAP.md
   - Planning Documents/WORKFLOW.md
   - Planning Documents/design/DESIGN.md
   - Planning Documents/design/empty-states.md
   - Planning Documents/design/error-states.md
   - CLAUDE.md, AGENTS.md, CONTRIBUTING.md
   - The phase file in Planning Documents/phases/
   - The "Files to read" list inside that phase file

2. **Plan only** — no code. Cover:
   - File operations (create, edit, delete)
   - Risks and ambiguities
   - Which DESIGN.md sections apply
   - Unresolved questions at the end

3. **Wait for explicit approval** ("Proceed with the plan" or equivalent).

4. **Execute** autonomously per the approved plan.

5. **Verify**: `npm run build` + any phase-specific smoke test.

6. **Rollback**: If verification fails after one fix attempt → stop, report, `git checkout -- .`, reassess. Do not loop.

7. **Manual QA note**: Remind user to check Definition of Done on QA viewports (375x812, 1280px, real phone if needed).

8. **Retrospective prompt**: Ask "What would you do differently? Three points max, be specific." Log response to `Planning Documents/phases/retro-fixes.md`.

9. **Commit format**: `Phase N: [short description]` with bullet list of key changes.
