-- ──────────────────────────────────────────────
-- NEWS POSTS: Add post_type, image_url, tags
-- ──────────────────────────────────────────────

-- Post type: 'news' (default) or 'guide'
alter table news_posts
  add column if not exists post_type text not null default 'news';

-- Featured image URL (optional)
alter table news_posts
  add column if not exists image_url text;

-- Tags for cross-referencing (e.g. {'ferries','housing','nature'})
alter table news_posts
  add column if not exists tags text[] not null default '{}';

-- Index for filtering by type
create index if not exists news_posts_type_idx
  on news_posts(post_type, published, published_at desc);


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

-- Anyone can read comments
create policy "Anyone can read news comments"
  on news_comments for select
  using (true);

-- Anyone can post a comment (rate limiting handled at API level)
create policy "Anyone can post news comments"
  on news_comments for insert
  with check (true);
