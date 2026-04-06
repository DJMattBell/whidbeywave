-- ──────────────────────────────────────────────
-- RECURRING EVENTS
-- Templates that auto-generate event_submissions
-- ──────────────────────────────────────────────

create table if not exists recurring_events (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  time                 text not null,
  location             text not null,
  town                 text not null,
  category             text not null default 'Community & Social',
  description          text,
  tags                 text[] default '{}',
  recurrence_type      text not null check (recurrence_type in ('weekly','biweekly','monthly','custom')),
  day_of_week          int check (day_of_week between 0 and 6),
  day_of_month         int check (day_of_month between 1 and 31),
  custom_interval_days int check (custom_interval_days > 0),
  start_date           date not null,
  end_date             date,          -- null = perpetual
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Indexes
create index if not exists recurring_events_active_idx
  on recurring_events(is_active);

-- RLS
alter table recurring_events enable row level security;

-- Only authenticated users (admin) can manage recurring events
create policy "Authenticated users can read recurring events"
  on recurring_events for select
  using (auth.uid() is not null);

create policy "Authenticated users can insert recurring events"
  on recurring_events for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update recurring events"
  on recurring_events for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Authenticated users can delete recurring events"
  on recurring_events for delete
  using (auth.uid() is not null);

-- FK on event_submissions to link generated events back to the template
alter table event_submissions
  add column if not exists recurring_event_id uuid references recurring_events(id) on delete set null;

create index if not exists event_submissions_recurring_idx
  on event_submissions(recurring_event_id);
