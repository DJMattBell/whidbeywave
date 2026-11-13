# Skill: Database Migration

Invoke when making schema changes to the Supabase database.

## Chunked Commit Pattern

Never combine migration SQL and dependent code in one commit.

1. **Backup**: `pg_dump` before any migration that isn't a pure additive `CREATE TABLE`. Supabase free tier — no auto-backups.

2. **Migration commit**: SQL file only in `supabase/`. Commit and push.
   - `ALTER`, `DROP`, `DELETE FROM` on existing tables → pause and require explicit user approval before applying.

3. **Manual review**: User reviews SQL before production apply.

4. **Apply**: Run via Supabase MCP or dashboard.

5. **Code commit**: API routes, components, pages that depend on new schema. Commit and push.

6. **Verify**: Confirm deploy succeeds and code works against updated schema.

## Rules

- Update `supabase-schema.sql` (root) — authoritative schema file.
- One logical change per migration file.
- `npm run build` must pass at every commit boundary.
