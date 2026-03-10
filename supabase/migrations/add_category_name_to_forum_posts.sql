-- Add denormalized category_name to forum_posts for efficient server-side filtering
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS category_name text;

-- Backfill from the forum_categories join
UPDATE forum_posts fp
SET category_name = fc.name
FROM forum_categories fc
WHERE fp.category_id = fc.id;

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_name ON forum_posts(category_name);
