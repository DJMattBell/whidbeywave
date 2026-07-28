-- ──────────────────────────────────────────────
-- MIGRATION: Tighten RLS policies for admin-only tables
-- Run in Supabase SQL editor
-- ──────────────────────────────────────────────
-- Context: The UPDATE policy on event_submissions allowed any authenticated
-- user to update any submission. The API routes already enforce admin checks
-- via verifyAdminRequest() + service role key (which bypasses RLS), but this
-- policy should be tightened as defense-in-depth.

-- event_submissions: restrict UPDATE to service role only
drop policy if exists "Authenticated admin can update submissions" on event_submissions;
create policy "Service role can update submissions"
  on event_submissions for update
  using (false)
  with check (false);
-- Note: service role key bypasses RLS entirely, so admin API routes
-- continue to work. This policy blocks non-admin authenticated users
-- from updating submissions via the Supabase client directly.

-- recurring_events: lock all CRUD to service-role only (applied)
drop policy if exists "Authenticated users can read recurring events" on recurring_events;
drop policy if exists "Authenticated users can insert recurring events" on recurring_events;
drop policy if exists "Authenticated users can update recurring events" on recurring_events;
drop policy if exists "Authenticated users can delete recurring events" on recurring_events;
create policy "Service role manages recurring events (select)"
  on recurring_events for select using (false);
create policy "Service role manages recurring events (insert)"
  on recurring_events for insert with check (false);
create policy "Service role manages recurring events (update)"
  on recurring_events for update using (false) with check (false);
create policy "Service role manages recurring events (delete)"
  on recurring_events for delete using (false);
