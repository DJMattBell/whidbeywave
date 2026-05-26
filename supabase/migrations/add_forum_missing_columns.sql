-- ──────────────────────────────────────────────
-- FORUM POSTS: Add author_email, zip_code
-- These columns are used by code but were never
-- added to the base schema or any migration.
-- ──────────────────────────────────────────────

-- author_email: used by /api/forum/reply to send
-- notification emails when someone replies
alter table forum_posts
  add column if not exists author_email text;

-- zip_code: used by NewPostForm for "Local" badge
alter table forum_posts
  add column if not exists zip_code text;

-- Index for efficient reply notification lookups
create index if not exists forum_posts_author_email_idx
  on forum_posts(id, author_email);


-- ──────────────────────────────────────────────
-- FORUM REPLIES: Add zip_code
-- Used by ReplyForm for "Local" badge display
-- ──────────────────────────────────────────────
alter table forum_replies
  add column if not exists zip_code text;
