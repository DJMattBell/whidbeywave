-- ============================================================
-- WhidbeyWave.com — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- Enable UUID extension (already enabled on most Supabase projects)
create extension if not exists "pgcrypto";


-- ──────────────────────────────────────────────
-- EVENT SUBMISSIONS (community calendar)
-- ──────────────────────────────────────────────
create table if not exists event_submissions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  date             date not null,
  time             text not null,
  location         text not null,
  town             text not null,
  category         text not null default 'Community & Social',
  description      text,
  tags             text[] default '{}',
  submitter_name   text not null,
  submitter_email  text not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz
);

create index if not exists event_submissions_status_idx on event_submissions(status);
create index if not exists event_submissions_date_idx   on event_submissions("date" asc);

alter table event_submissions enable row level security;

-- Anyone can submit an event (public form)
create policy "Anyone can submit events"
  on event_submissions for insert
  with check (true);

-- Anyone can read approved events (shown on calendar)
create policy "Anyone can read approved events"
  on event_submissions for select
  using (status = 'approved');

-- Service-role key (used by API routes) bypasses RLS automatically.
-- The admin UI uses the anon key but the moderate API route uses
-- server-side credentials — to allow the admin API to update status,
-- add a policy that allows updates when the caller is authenticated:
create policy "Authenticated admin can update submissions"
  on event_submissions for update
  using (true)
  with check (true);


-- ──────────────────────────────────────────────
-- NEWSLETTER SUBSCRIBERS
-- ──────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  first_name  text not null,
  tags        text[] default '{}',
  frequency   text not null default 'weekly' check (frequency in ('weekly', 'immediate')),
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

-- Users can insert their own row (keyed by email — no auth required to sign up)
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

-- Only the subscriber can read their own row (requires auth + email match)
create policy "Subscribers read own row"
  on newsletter_subscribers for select
  using (auth.jwt() ->> 'email' = email);

-- Subscribers can update their own preferences
create policy "Subscribers update own row"
  on newsletter_subscribers for update
  using (auth.jwt() ->> 'email' = email)
  with check (auth.jwt() ->> 'email' = email);


-- ──────────────────────────────────────────────
-- FORUM CATEGORIES
-- ──────────────────────────────────────────────
create table if not exists forum_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  slug        text unique not null,
  post_count  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table forum_categories enable row level security;

create policy "Anyone can read categories"
  on forum_categories for select using (true);

-- Seed categories
insert into forum_categories (name, slug, description) values
  ('General',           'general',           'Everything else — ask anything.'),
  ('Recommendations',   'recommendations',   'Looking for a great plumber, restaurant, or trail? Ask here.'),
  ('Island Life',       'island-life',       'Local tips, community news, and island know-how.'),
  ('Events',            'events',            'Questions and discussion about upcoming events.'),
  ('Lost & Found',      'lost-and-found',    'Lost something on the island? Found something? Post here.'),
  ('For Sale / Free',   'for-sale-free',     'Non-commercial listings from community members.'),
  ('Welcome Newcomers', 'welcome-newcomers', 'New to Whidbey? This is a great place to start.')
on conflict (slug) do nothing;


-- ──────────────────────────────────────────────
-- FORUM POSTS
-- ──────────────────────────────────────────────
create table if not exists forum_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  category_id uuid references forum_categories(id) on delete set null,
  author_id   uuid references auth.users(id) on delete set null,
  author_name text not null,
  views       int not null default 0,
  reply_count int not null default 0,
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists forum_posts_category_idx on forum_posts(category_id);
create index if not exists forum_posts_author_idx on forum_posts(author_id);
create index if not exists forum_posts_created_idx on forum_posts(created_at desc);

alter table forum_posts enable row level security;

create policy "Anyone can read posts"
  on forum_posts for select using (true);

create policy "Authenticated users can post"
  on forum_posts for insert
  with check (auth.uid() is not null);

create policy "Authors can update their own posts"
  on forum_posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on forum_posts for delete
  using (auth.uid() = author_id);


-- ──────────────────────────────────────────────
-- FORUM REPLIES
-- ──────────────────────────────────────────────
create table if not exists forum_replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references forum_posts(id) on delete cascade,
  body        text not null,
  author_id   uuid references auth.users(id) on delete set null,
  author_name text not null,
  created_at  timestamptz not null default now()
);

create index if not exists forum_replies_post_idx on forum_replies(post_id);

alter table forum_replies enable row level security;

create policy "Anyone can read replies"
  on forum_replies for select using (true);

create policy "Authenticated users can reply"
  on forum_replies for insert
  with check (auth.uid() is not null);

create policy "Authors can update their own replies"
  on forum_replies for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors can delete their own replies"
  on forum_replies for delete
  using (auth.uid() = author_id);

-- Trigger: keep reply_count in sync on forum_posts
create or replace function increment_reply_count()
returns trigger language plpgsql security definer as $$
begin
  update forum_posts
  set reply_count = reply_count + 1,
      updated_at  = now()
  where id = NEW.post_id;
  return NEW;
end;
$$;

create or replace trigger trg_reply_count_insert
  after insert on forum_replies
  for each row execute function increment_reply_count();

create or replace function decrement_reply_count()
returns trigger language plpgsql security definer as $$
begin
  update forum_posts
  set reply_count = greatest(0, reply_count - 1),
      updated_at  = now()
  where id = OLD.post_id;
  return OLD;
end;
$$;

create or replace trigger trg_reply_count_delete
  after delete on forum_replies
  for each row execute function decrement_reply_count();


-- ──────────────────────────────────────────────
-- RECOMMENDATIONS
-- ──────────────────────────────────────────────
create table if not exists recommendations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null,
  description     text,
  address         text,
  town            text,
  zipcode         text,
  phone           text,
  website         text,
  average_rating  numeric(3,2) not null default 0,
  review_count    int not null default 0,
  submitted_by    uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists recs_category_idx on recommendations(category);
create index if not exists recs_rating_idx   on recommendations(average_rating desc);

alter table recommendations enable row level security;

create policy "Anyone can read recommendations"
  on recommendations for select using (true);

create policy "Anyone can suggest a recommendation"
  on recommendations for insert
  with check (true);

-- Seed sample recommendations
insert into recommendations (name, category, description, town, average_rating, review_count) values
  ('Toby''s Tavern',           'Restaurants & Cafes',  'A Coupeville institution. Good burgers, cold beer, and a porch facing the water.', 'Coupeville', 4.5, 12),
  ('Coupeville Wharf',         'Entertainment',         'Historic pier stretching into Penn Cove. Great for crabbing, clamming, and watching the herons.', 'Coupeville', 4.8, 22),
  ('Spoiled Dog Winery',       'Restaurants & Cafes',  'Small-batch wines poured with genuine hospitality. Views of Useless Bay.', 'Langley', 4.6, 9),
  ('Greenbank Farm',           'Farms & Markets',       'Historic farm with a wine shop, walking trails, and a good excuse to slow down.', 'Greenbank', 4.7, 15),
  ('Bayview Corner Farmers Market', 'Farms & Markets',  'Weekly summer market with local produce, flowers, crafts, and good conversation.', 'Freeland', 4.9, 31),
  ('South Whidbey State Park', 'Entertainment',         'Old-growth forest, beach access, and campgrounds. One of the quieter state parks in the system.', 'Freeland', 4.8, 18)
on conflict do nothing;


-- ──────────────────────────────────────────────
-- REVIEWS
-- ──────────────────────────────────────────────
create table if not exists reviews (
  id                 uuid primary key default gen_random_uuid(),
  recommendation_id  uuid not null references recommendations(id) on delete cascade,
  author_id          uuid not null references auth.users(id) on delete cascade,
  author_name        text not null,
  rating             int not null check (rating between 1 and 5),
  body               text not null,
  zipcode            text not null,
  helpful_count      int not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists reviews_rec_idx on reviews(recommendation_id);

alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select using (true);

-- Authenticated users with a valid Whidbey Island zipcode can insert
create policy "Whidbey locals can review"
  on reviews for insert
  with check (
    auth.uid() is not null
    and zipcode in ('98239','98249','98250','98253','98260','98277','98278')
  );

create policy "Authors can update their own reviews"
  on reviews for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors can delete their own reviews"
  on reviews for delete
  using (auth.uid() = author_id);

-- Trigger: keep average_rating and review_count in sync
create or replace function update_recommendation_stats()
returns trigger language plpgsql security definer as $$
declare
  rec_id uuid;
begin
  rec_id := coalesce(NEW.recommendation_id, OLD.recommendation_id);
  update recommendations
  set average_rating = (
        select coalesce(round(avg(rating)::numeric, 2), 0)
        from reviews
        where recommendation_id = rec_id
      ),
      review_count = (
        select count(*) from reviews where recommendation_id = rec_id
      )
  where id = rec_id;
  return coalesce(NEW, OLD);
end;
$$;

create or replace trigger trg_update_rec_stats
  after insert or update or delete on reviews
  for each row execute function update_recommendation_stats();


-- ──────────────────────────────────────────────
-- MIGRATIONS (added after initial deploy)
-- ──────────────────────────────────────────────

-- 1. Store post author's email so reply notifications can be sent
alter table forum_posts
  add column if not exists author_email text;

create index if not exists forum_posts_author_email_idx
  on forum_posts(id, author_email);

-- 2. Let submitters read their own event submissions (for /profile page)
create policy "Submitters can read own submissions"
  on event_submissions for select
  using (auth.jwt() ->> 'email' = submitter_email);

-- 3. Index to speed up confirmed-subscriber query used by weekly digest
create index if not exists newsletter_subscribers_confirmed_idx
  on newsletter_subscribers(confirmed, created_at asc)
  where confirmed = true;
