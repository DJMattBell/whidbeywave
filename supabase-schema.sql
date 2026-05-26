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
  source           text not null default '',
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
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text,
  category_id   uuid references forum_categories(id) on delete set null,
  category_name text,
  author_id     uuid references auth.users(id) on delete set null,
  author_name   text not null,
  author_email  text,
  zip_code      text,
  views         int not null default 0,
  reply_count   int not null default 0,
  is_pinned     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists forum_posts_category_idx on forum_posts(category_id);
create index if not exists forum_posts_author_idx on forum_posts(author_id);
create index if not exists forum_posts_created_idx on forum_posts(created_at desc);
create index if not exists forum_posts_author_email_idx on forum_posts(id, author_email);
create index if not exists idx_forum_posts_category_name on forum_posts(category_name);

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
  zip_code    text,
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
    and zipcode in ('98236','98239','98249','98250','98253','98260','98277','98278')
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

-- 4. weekend_digest preference column on newsletter_subscribers
alter table newsletter_subscribers
  add column if not exists weekend_digest boolean not null default false;

-- 5. confirmation_token for secure email confirmation (replaces timestamp-based token)
alter table newsletter_subscribers
  add column if not exists confirmation_token text;

create unique index if not exists newsletter_subscribers_confirmation_token_idx
  on newsletter_subscribers(confirmation_token)
  where confirmation_token is not null;

-- 6. Allow service-role unsubscribe (service key bypasses RLS, but document intent)
-- No additional policy needed — service role key used by /api/newsletter/unsubscribe.


-- ──────────────────────────────────────────────
-- MARKETPLACE LISTINGS
-- ──────────────────────────────────────────────
create table if not exists marketplace_listings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  price        text not null default 'Contact for price',
  category     text not null default 'General',
  location     text not null default 'Whidbey Island',
  description  text,
  seller_name  text not null,
  seller_email text not null,
  emoji        text not null default '🏷️',
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

create index if not exists marketplace_listings_status_idx
  on marketplace_listings(status);
create index if not exists marketplace_listings_created_idx
  on marketplace_listings(created_at desc);

alter table marketplace_listings enable row level security;

-- Public can submit listings via the form
create policy "Anyone can submit a listing"
  on marketplace_listings for insert
  with check (true);

-- Public can read approved listings (shown on /marketplace)
create policy "Anyone can read approved listings"
  on marketplace_listings for select
  using (status = 'approved');

-- Authenticated users (admin) can read all listings regardless of status
create policy "Authenticated users can read all listings"
  on marketplace_listings for select
  using (auth.uid() is not null);

-- Service-role key used by moderation API routes bypasses RLS automatically.
-- To allow status updates from authenticated admin sessions (anon key + session):
create policy "Authenticated users can update listing status"
  on marketplace_listings for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);


-- ──────────────────────────────────────────────
-- NEWS POSTS
-- ──────────────────────────────────────────────
create table if not exists news_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique not null,
  emoji        text not null default '📰',
  category     text not null default 'Community',
  read_minutes int not null default 3,
  excerpt      text not null,
  body         text not null default '',
  author       text not null default 'WhidbeyWave',
  published_at date not null default current_date,
  published    boolean not null default false,
  post_type    text not null default 'news',
  image_url    text,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create index if not exists news_posts_published_idx
  on news_posts(published, published_at desc);
create index if not exists news_posts_slug_idx
  on news_posts(slug);
create index if not exists news_posts_type_idx
  on news_posts(post_type, published, published_at desc);

alter table news_posts enable row level security;

-- Public can read published posts (shown on /news and homepage)
create policy "Anyone can read published posts"
  on news_posts for select
  using (published = true);

-- Authenticated users (admin) can read all posts including drafts
create policy "Authenticated users can read all posts"
  on news_posts for select
  using (auth.uid() is not null);

-- Service-role key used by /api/news/create and /api/news/toggle bypasses RLS.
-- To allow toggle via authenticated admin session (anon key + session):
create policy "Authenticated users can update news posts"
  on news_posts for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Authenticated users can insert news posts"
  on news_posts for insert
  with check (auth.uid() is not null);


-- ──────────────────────────────────────────────
-- NEWS COMMENTS
-- ──────────────────────────────────────────────
create table if not exists news_comments (
  id            uuid primary key default gen_random_uuid(),
  article_slug  text not null,
  author_name   text not null,
  body          text not null,
  created_at    timestamptz not null default now()
);

create index if not exists news_comments_slug_idx
  on news_comments(article_slug, created_at asc);

alter table news_comments enable row level security;

create policy "Anyone can read news comments"
  on news_comments for select
  using (true);

create policy "Anyone can post news comments"
  on news_comments for insert
  with check (true);


-- ──────────────────────────────────────────────
-- SITE FEEDBACK
-- ──────────────────────────────────────────────
create table if not exists site_feedback (
  id         uuid primary key default gen_random_uuid(),
  message    text not null,
  email      text,
  page       text default '/',
  created_at timestamptz not null default now()
);

create index if not exists site_feedback_created_idx
  on site_feedback(created_at desc);

alter table site_feedback enable row level security;

-- Anyone can submit feedback (uses anon key in /api/feedback route)
create policy "Anyone can submit feedback"
  on site_feedback for insert
  with check (true);

-- Authenticated users (admin) can read all feedback
create policy "Authenticated users can read feedback"
  on site_feedback for select
  using (auth.uid() is not null);


-- ──────────────────────────────────────────────
-- MIGRATION: marketplace photo-forward redesign
-- Run these statements in the Supabase SQL editor
-- ──────────────────────────────────────────────

-- 1. Photos column (array of public storage URLs)
alter table marketplace_listings
  add column if not exists photos text[] not null default '{}';

-- 2. Seller phone (was collected in form but not stored)
alter table marketplace_listings
  add column if not exists seller_phone text;

-- 3. Allow 'sold' as a valid status
alter table marketplace_listings
  drop constraint if exists marketplace_listings_status_check;
alter table marketplace_listings
  add constraint marketplace_listings_status_check
  check (status in ('pending', 'approved', 'rejected', 'sold'));

-- 4. Update public read policy to include sold listings
drop policy if exists "Anyone can read approved listings" on marketplace_listings;
create policy "Anyone can read approved or sold listings"
  on marketplace_listings for select
  using (status in ('approved', 'sold'));

-- 5. Supabase Storage bucket for listing photos (public, 10 MB per file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
)
on conflict (id) do nothing;

-- 6. Storage policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Public read listing photos'
  ) then
    create policy "Public read listing photos"
      on storage.objects for select
      using (bucket_id = 'listing-photos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Anyone can upload listing photos'
  ) then
    create policy "Anyone can upload listing photos"
      on storage.objects for insert
      with check (bucket_id = 'listing-photos');
  end if;
end $$;


-- ──────────────────────────────────────────────
-- MIGRATION: sold boolean + expires_at + ownership
-- Run in the Supabase SQL editor
-- ──────────────────────────────────────────────

-- 1. sold boolean (replaces using status='sold')
alter table marketplace_listings
  add column if not exists sold boolean not null default false;

-- 2. expires_at — 60 days from creation for new rows; backfill existing rows
alter table marketplace_listings
  add column if not exists expires_at timestamptz
  default (now() + interval '60 days');

update marketplace_listings
  set expires_at = created_at + interval '60 days'
  where expires_at is null;

-- 3. Remove 'sold' from the status constraint (sold is now its own column)
--    Re-apply constraint with only the approval-workflow values.
alter table marketplace_listings
  drop constraint if exists marketplace_listings_status_check;
alter table marketplace_listings
  add constraint marketplace_listings_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- 4. Update RLS so the public can only read approved listings
--    (sold=true rows are still approved, so they remain visible)
drop policy if exists "Anyone can read approved or sold listings" on marketplace_listings;
drop policy if exists "Anyone can read approved listings" on marketplace_listings;
create policy "Anyone can read approved listings"
  on marketplace_listings for select
  using (status = 'approved');

-- 5. Index for expiry filtering
create index if not exists marketplace_listings_expires_idx
  on marketplace_listings (expires_at);


-- ──────────────────────────────────────────────
-- MIGRATION: auth-based ownership, table rename,
-- column renames, new spec columns, listing_alerts
-- Run in the Supabase SQL editor
-- ──────────────────────────────────────────────

-- 1. Rename table
alter table marketplace_listings rename to listings;

-- 2. Rename columns to match spec
alter table listings rename column photos        to images;
alter table listings rename column seller_email  to contact_email;
alter table listings rename column seller_phone  to contact_phone;

-- 3. Add new spec columns
alter table listings
  add column if not exists user_id         uuid references auth.users(id) on delete set null;
alter table listings
  add column if not exists is_free         boolean not null default false;
alter table listings
  add column if not exists contact_method  text;

-- 4. Convert price from text to numeric
--    Rows with non-numeric text (e.g. "Contact for price") become NULL.
alter table listings
  alter column price type numeric
  using case
    when price ~ '^[0-9]+(\.[0-9]+)?$' then price::numeric
    else null
  end;
alter table listings alter column price drop not null;
alter table listings alter column price drop default;

-- 5. Drop all old RLS policies and replace with spec-compliant set
drop policy if exists "Anyone can submit a listing"              on listings;
drop policy if exists "Anyone can read approved listings"        on listings;
drop policy if exists "Authenticated users can read all listings" on listings;
drop policy if exists "Authenticated users can update listing status" on listings;

-- Public: browse approved listings only
create policy "Public read approved listings"
  on listings for select
  using (status = 'approved');

-- Authenticated: admin can read all statuses
create policy "Authenticated read all listings"
  on listings for select
  using (auth.uid() is not null);

-- Authenticated INSERT: user_id must equal the caller's uid
create policy "Authenticated insert own listing"
  on listings for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- Authenticated UPDATE: only own rows
create policy "Users update own listings"
  on listings for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Authenticated DELETE: only own rows
create policy "Users delete own listings"
  on listings for delete
  using (auth.uid() = user_id);

-- 6. Rename storage bucket listing-photos → listing-images
--    (Supabase does not have a RENAME for buckets; insert the new one and
--     update the existing bucket's id/name in one step via upsert.)
update storage.buckets
  set id   = 'listing-images',
      name = 'listing-images'
  where id = 'listing-photos';

-- If the bucket didn't exist yet, create it now
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif']
)
on conflict (id) do nothing;

-- 7. Drop old storage policies and replace with auth-scoped ones
do $$
begin
  -- Drop old open policies
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Public read listing photos'
  ) then
    drop policy "Public read listing photos" on storage.objects;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Anyone can upload listing photos'
  ) then
    drop policy "Anyone can upload listing photos" on storage.objects;
  end if;

  -- Public read
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Public read listing images'
  ) then
    create policy "Public read listing images"
      on storage.objects for select
      using (bucket_id = 'listing-images');
  end if;

  -- Authenticated upload, scoped to own user_id folder
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Authenticated upload listing images'
  ) then
    create policy "Authenticated upload listing images"
      on storage.objects for insert
      with check (
        bucket_id = 'listing-images'
        and auth.uid() is not null
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  -- Authenticated delete own files
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
    and policyname = 'Users delete own listing images'
  ) then
    create policy "Users delete own listing images"
      on storage.objects for delete
      using (
        bucket_id = 'listing-images'
        and auth.uid() is not null
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- 8. listing_alerts table (for marketplace email subscriptions)
create table if not exists listing_alerts (
  email      text not null,
  category   text,              -- null = all categories
  created_at timestamptz not null default now(),
  primary key (email, category)
);

alter table listing_alerts enable row level security;

create policy "Anyone can subscribe to listing alerts"
  on listing_alerts for insert
  with check (true);


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

create index if not exists recurring_events_active_idx
  on recurring_events(is_active);

alter table recurring_events enable row level security;

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
