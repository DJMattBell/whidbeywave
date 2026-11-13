# Skill: Phase Retrospective

Invoke at the end of a completed phase.

## Flow

1. Ask: "Phase N is complete and verified. What would you do differently if you ran it again? Three points max, be specific."

2. Log the response to `Planning Documents/phases/retro-fixes.md`:
   ```
   ## Phase N — [phase name]
   Date: YYYY-MM-DD

   1. [point]
   2. [point]
   3. [point]

   Commit: [commit hash]
   ```

3. If any point identifies a recurring issue, propose a concrete fix:
   - New rule → add to .claude/rules/
   - Process change → update CLAUDE.md or WORKFLOW.md
   - Code guard → implement immediately

4. Commit retro-fixes.md update: `retro(phase-N): [summary]`
