# Auth Rules

Applies when editing: app/api/, lib/adminAuth.ts, lib/userAuth.ts, lib/cronAuth.ts

- Three auth helpers — use the right one:
  - `verifyAdminRequest` (`@/lib/adminAuth`) — admin email required (moderation, news CRUD)
  - `verifyUserRequest` (`@/lib/userAuth`) — any logged-in user (forum, reviews)
  - `verifyCronRequest` (`@/lib/cronAuth`) — Vercel Cron or Bearer token
- API routes create fresh Supabase clients per request — never use the browser singleton
- RLS always on. Service role key only for admin/cron operations
- All API keys from env vars only — never hardcode
