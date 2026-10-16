-- ──────────────────────────────────────────────────────────────
-- FIX: Langley Whale Center hours
-- Reported by LWC manager: correct hours are Wed-Sun, 11 AM – 4 PM
-- Old template was Thursday only, 11 AM – 5 PM
-- ──────────────────────────────────────────────────────────────

-- 1. Update the existing Thursday template in place (fix time + description)
UPDATE recurring_events
SET time = '11:00 AM – 4:00 PM',
    description = 'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
    updated_at = now()
WHERE title = 'Langley Whale Center: Open Hours'
  AND recurrence_type = 'weekly'
  AND day_of_week = 4;

-- 2. Insert the 4 additional days: Wed=3, Fri=5, Sat=6, Sun=0
INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 3, '2026-05-25', '2026-09-30', true),

  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 5, '2026-05-25', '2026-09-30', true),

  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-09-30', true),

  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 0, '2026-05-25', '2026-09-30', true);

-- 3. Fix time on already-generated future events from the old template
UPDATE event_submissions
SET time = '11:00 AM – 4:00 PM',
    description = 'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.'
WHERE title = 'Langley Whale Center: Open Hours'
  AND date >= CURRENT_DATE
  AND time = '11:00 AM – 5:00 PM';
