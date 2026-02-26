-- ============================================================
-- WhidbeyWave Community Database Schema
-- Run this in your Supabase project → SQL Editor → New Query
-- ============================================================

-- ── Newsletter Subscribers ───────────────────────────────────
create table if not exists newsletter_subscribers (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  email      text not null unique,
  zip_code   text,
  tags       text[] default '{}',
  created_at timestamptz default now()
);

-- ── Forum Posts ──────────────────────────────────────────────
create table if not exists forum_posts (
  id          uuid default gen_random_uuid() primary key,
  category    text not null default 'General',
  title       text not null,
  body        text not null,
  author_name text not null,
  zip_code    text not null,
  created_at  timestamptz default now()
);

-- ── Forum Replies ────────────────────────────────────────────
create table if not exists forum_replies (
  id          uuid default gen_random_uuid() primary key,
  post_id     uuid references forum_posts(id) on delete cascade not null,
  body        text not null,
  author_name text not null,
  zip_code    text not null,
  created_at  timestamptz default now()
);

-- ── Recommendations ──────────────────────────────────────────
create table if not exists recommendations (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  category     text not null,
  description  text,
  town         text,
  address      text,
  website      text,
  avg_rating   numeric(2,1) default 0,
  review_count integer default 0,
  created_at   timestamptz default now()
);

-- ── Reviews ──────────────────────────────────────────────────
create table if not exists reviews (
  id                uuid default gen_random_uuid() primary key,
  recommendation_id uuid references recommendations(id) on delete cascade not null,
  rating            integer check (rating >= 1 and rating <= 5) not null,
  body              text not null,
  author_name       text not null,
  zip_code          text not null,
  created_at        timestamptz default now()
);

-- ── Trigger: keep avg_rating + review_count current ──────────
create or replace function update_recommendation_stats()
returns trigger as $$
begin
  update recommendations
  set
    avg_rating   = (select round(avg(rating)::numeric, 1) from reviews where recommendation_id = new.recommendation_id),
    review_count = (select count(*) from reviews where recommendation_id = new.recommendation_id)
  where id = new.recommendation_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_rec_stats on reviews;
create trigger trg_update_rec_stats
  after insert on reviews
  for each row execute function update_recommendation_stats();

-- ── Row Level Security ───────────────────────────────────────
alter table newsletter_subscribers enable row level security;
alter table forum_posts            enable row level security;
alter table forum_replies          enable row level security;
alter table recommendations        enable row level security;
alter table reviews                enable row level security;

-- Public can read everything
create policy "public read"   on newsletter_subscribers for select using (true);
create policy "public read"   on forum_posts            for select using (true);
create policy "public read"   on forum_replies          for select using (true);
create policy "public read"   on recommendations        for select using (true);
create policy "public read"   on reviews               for select using (true);

-- Public can insert (community-driven content)
create policy "public insert" on newsletter_subscribers for insert with check (true);
create policy "public insert" on forum_posts            for insert with check (true);
create policy "public insert" on forum_replies          for insert with check (true);
create policy "public insert" on recommendations        for insert with check (true);
create policy "public insert" on reviews               for insert with check (true);

-- ── Seed: Sample Recommendations ────────────────────────────
insert into recommendations (name, category, description, town, avg_rating, review_count) values
  (
    'Coupeville Wharf',
    'Outdoor & Recreation',
    'Historic 1905 wharf stretching into Penn Cove. Perfect for a slow walk any season — watch for herons, harbor seals, and the occasional whale. Free and open daily.',
    'Coupeville',
    4.9,
    0
  ),
  (
    'Toby''s Tavern',
    'Restaurants & Cafés',
    'Beloved waterfront tavern known for its Penn Cove mussels and local craft beers. Cozy in winter, lively in summer. Cash-friendly and never pretentious.',
    'Coupeville',
    4.7,
    0
  ),
  (
    'Spoiled Dog Winery',
    'Restaurants & Cafés',
    'Small family winery in the south island with estate wines and a dog-friendly patio overlooking the vineyard. Relaxed tastings, no appointment needed on weekends.',
    'Langley',
    4.8,
    0
  ),
  (
    'Greenbank Farm',
    'Farms & Food',
    'Historic 150-acre farm with a wine and loganberry liqueur shop, walking trails through fields, and a great spot for a picnic. The barn is a community treasure.',
    'Greenbank',
    4.8,
    0
  ),
  (
    'Bayview Corner Farmers Market',
    'Farms & Food',
    'Saturday morning market with local produce, handmade goods, live music, and the best people-watching on the island. Bring a bag and take your time.',
    'Langley',
    4.9,
    0
  ),
  (
    'South Whidbey State Park',
    'Outdoor & Recreation',
    'Old-growth forest, beachfront campsites, and miles of trails. One of the most beautiful spots on the island — uncrowded even in summer.',
    'Freeland',
    5.0,
    0
  )
on conflict do nothing;
