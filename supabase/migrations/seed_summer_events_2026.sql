-- ============================================================
-- SEED: Summer 2026 Events (May 25 - July 31)
-- New events discovered via web research, May 2026
-- Inserts into event_submissions as approved
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. AMERICAN ROOTS CONCERT SERIES at Deception Pass
--    Every Saturday, July 12 - August 23, 7-8 PM
--    North Beach Amphitheater, Deception Pass State Park
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('American Roots Concert: ShiDaa', '2026-07-12', '7:00 PM – 8:00 PM', 'North Beach Amphitheater, Deception Pass State Park', 'Oak Harbor', 'Music & Performance',
   'Free outdoor concert featuring ShiDaa, a high-energy Ghanaian drumming and dance group whose rhythms trace the roots of American jazz. Part of the 20th annual American Roots Concert Series. Discover Pass required for parking.',
   ARRAY['Live Music', 'Family Event', 'Festival', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Deception Pass Park Foundation', 'approved'),

  ('American Roots Concert: SeaNotes Big Band', '2026-07-19', '7:00 PM – 8:00 PM', 'North Beach Amphitheater, Deception Pass State Park', 'Oak Harbor', 'Music & Performance',
   'Free outdoor concert featuring the SeaNotes Big Band, taking you back to the golden era of big band music with swinging horns and classic arrangements. Part of the American Roots Concert Series. Discover Pass required for parking.',
   ARRAY['Live Music', 'Family Event', 'Festival', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Deception Pass Park Foundation', 'approved'),

  ('American Roots Concert: Lady A Gospel Choir', '2026-07-26', '7:00 PM – 8:00 PM', 'North Beach Amphitheater, Deception Pass State Park', 'Oak Harbor', 'Music & Performance',
   'Free outdoor concert featuring Lady A Gospel Choir with powerful gospel harmonies and heartfelt storytelling at the amphitheater. Part of the American Roots Concert Series. Discover Pass required for parking.',
   ARRAY['Live Music', 'Family Event', 'Festival', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Deception Pass Park Foundation', 'approved'),

  ('American Roots Concert: Trio Guadalevin', '2026-08-02', '7:00 PM – 8:00 PM', 'North Beach Amphitheater, Deception Pass State Park', 'Oak Harbor', 'Music & Performance',
   'Free outdoor concert featuring Trio Guadalevin, weaving together Indigenous, African, and European sounds in a musical journey across continents. Part of the American Roots Concert Series. Discover Pass required for parking.',
   ARRAY['Live Music', 'Family Event', 'Festival', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Deception Pass Park Foundation', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 2. ISLAND SHAKESPEARE FESTIVAL - Summer Season
--    Wed-Sun through August 31, Langley
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Island Shakespeare Festival: Macbeth', '2026-06-03', '7:00 PM', '5476 Maxwelton Rd, Langley', 'Langley', 'Arts & Culture',
   'Island Shakespeare Festival opens its 16th summer season with Shakespeare''s thrilling Macbeth in their intimate outdoor theater. Performances run Wed-Sun through August 31. Pay What You Will pricing.',
   ARRAY['Adult Event', 'Visitor Friendly', 'Just Fun'], 'Event Seed', 'noreply@whidbeywave.com', 'Island Shakespeare Festival', 'approved'),

  ('Island Shakespeare Festival: Much Ado About Nothing', '2026-06-04', '7:00 PM', '5476 Maxwelton Rd, Langley', 'Langley', 'Arts & Culture',
   'A fresh reimagining of Shakespeare''s beloved comedy set in ''90s Italy with full MTV-era flair. Part of ISF''s summer season featuring fearless women who defy rules. Pay What You Will pricing.',
   ARRAY['Adult Event', 'Visitor Friendly', 'Just Fun'], 'Event Seed', 'noreply@whidbeywave.com', 'Island Shakespeare Festival', 'approved'),

  ('Island Shakespeare Festival: Robin Hood of Sherwood Forest', '2026-06-05', '7:00 PM', '5476 Maxwelton Rd, Langley', 'Langley', 'Arts & Culture',
   'A family-friendly adventure through Sherwood Forest, part of the Island Shakespeare Festival''s 16th summer season. Performances run Wed-Sun through August 31 in the outdoor theater. Pay What You Will pricing.',
   ARRAY['Family Event', 'Kids Event', 'Visitor Friendly', 'Just Fun'], 'Event Seed', 'noreply@whidbeywave.com', 'Island Shakespeare Festival', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 3. COUPEVILLE SUMMER MUSIC SERIES
--    Third Sunday, June-September, 2-4 PM, Town Park
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Coupeville Summer Music Series', '2026-06-21', '2:00 PM – 4:00 PM', 'Pavilion Stage, Coupeville Town Park', 'Coupeville', 'Music & Performance',
   'Free family-friendly concert on the Pavilion Stage in Coupeville Town Park. The series showcases a rotating lineup of singers, bands, and ensembles from Whidbey Island and beyond. Expect an upbeat mix of rock, jazz, brass, and more.',
   ARRAY['Live Music', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Coupeville Creative District', 'approved'),

  ('Coupeville Summer Music Series', '2026-07-19', '2:00 PM – 4:00 PM', 'Pavilion Stage, Coupeville Town Park', 'Coupeville', 'Music & Performance',
   'Free family-friendly concert on the Pavilion Stage in Coupeville Town Park. The series showcases a rotating lineup of singers, bands, and ensembles from Whidbey Island and beyond. Rain or shine.',
   ARRAY['Live Music', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Coupeville Creative District', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 4. LITTLEBIGFEST - Music & Arts Festival (just outside date range but notable)
-- ──────────────────────────────────────────────────────────────

-- (August 14-16, outside May 25-July 31 window, but included for calendar completeness)


-- ──────────────────────────────────────────────────────────────
-- 5. COUPEVILLE ARTS & CRAFTS FESTIVAL
--    August 8-9 (outside window but close)
-- ──────────────────────────────────────────────────────────────

-- (August 8-9, outside May 25-July 31 window)


-- ──────────────────────────────────────────────────────────────
-- 6. WHIDBEY ADVENTURE SWIM - Clinton
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Adventure Swim', '2026-06-07', '10:00 AM', 'Langley Marina, Saratoga Passage', 'Langley', 'Sports & Fitness',
   'Annual open-water swim along the shores of Langley in the waters of Saratoga Passage. Features 1.2-mile and 2.4-mile courses. Wetsuits required, water temp 54-60 degrees. Pre-race check-in 8:30-9:30 AM. Sold out for 2026.',
   ARRAY['Adult Event'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Adventure Swim', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 7. DECEPTION PASS JET BOAT / WHALE WATCHING TOURS
--    Fri-Sun, June through September
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Deception Pass Jet Boat Tours (Weekends)', '2026-06-06', '10:00 AM – 5:00 PM', 'Deception Pass Tours, 5596 Hwy 20, Anacortes (departs near Deception Pass)', 'Oak Harbor', 'Nature & Wildlife',
   'One-hour jet boat tours through Deception Pass and evening whale watching excursions. See bald eagles, seals, porpoises, and whales from a 360-degree open-deck boat. Runs Fri-Sun June through September. Book at deceptionpasstours.com.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Deception Pass Tours', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 8. WHIDBEY REN FAIRE
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Ren Faire', '2026-05-23', '10:00 AM – 6:00 PM', 'Beach View Farm, 1570 Wieldraayer Rd, Oak Harbor', 'Oak Harbor', 'Arts & Culture',
   'Whidbey Ren Faire returns to Whidbey Island with jousting tournaments, live performances, interactive workshops, and demonstrations. A blend of historical charm, fantasy, and community fun for all ages.',
   ARRAY['Family Event', 'Kids Event', 'Festival', 'Just Fun', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Ren Faire', 'approved'),

  ('Whidbey Ren Faire', '2026-05-24', '10:00 AM – 6:00 PM', 'Beach View Farm, 1570 Wieldraayer Rd, Oak Harbor', 'Oak Harbor', 'Arts & Culture',
   'Day two of the Whidbey Ren Faire featuring jousting tournaments, live performances, interactive workshops, costumed characters, and artisan marketplace. Fun for the whole family.',
   ARRAY['Family Event', 'Kids Event', 'Festival', 'Just Fun', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Ren Faire', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 9. DANCING FISH VINEYARDS - Live Music Nights
--    Thursdays in summer, 5:30-7:30 PM
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Dancing Fish Vineyards: Thursday Music Night', '2026-06-04', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Thursday Music Nights feature a rotating lineup of local musicians through the summer season. Tickets available at dancingfishvineyards.com.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-06-11', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Enjoy a summer evening with local musicians, good wine, and beautiful views of the Whidbey countryside.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-06-18', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Thursday Music Nights run weekly through the summer.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-06-25', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Enjoy the island''s premier winery-music experience.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-07-02', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Weekly Thursday concerts through the summer season.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-07-09', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. A perfect summer evening on Whidbey Island.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-07-16', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Weekly Thursday concerts continue through the summer season.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-07-23', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in their beautiful outdoor vineyard setting. A hallmark of Whidbey summers.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved'),

  ('Dancing Fish Vineyards: Thursday Music Night', '2026-07-30', '5:30 PM – 7:30 PM', 'Dancing Fish Vineyards, 1953 Newman Rd, Freeland', 'Freeland', 'Music & Performance',
   'Live music at Dancing Fish Vineyards with wine tasting in the outdoor vineyard setting. Enjoy local musicians paired with island-made wines.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Dancing Fish Vineyards', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 10. OTT & HUNTER WINES - Live Music Events, Langley
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Ott & Hunter: Sidemen Unleashed!', '2026-06-28', '7:00 PM', 'Ott & Hunter Wines, 5554 Langley Rd, Langley', 'Langley', 'Music & Performance',
   'Pianist David Lee Joyner and bassist Clipper Anderson, two of the Pacific Northwest''s most sought-after musicians, perform an intimate evening of jazz at Ott & Hunter''s waterfront tasting room. $25. Reservations encouraged.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Ott & Hunter Wines', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 11. LEO & LETO'S WINERY - Saturday Live Music, Freeland
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Leo & Leto''s: Saturday Night Live Music', '2026-05-31', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro in Freeland. Featuring local jazz, blues, folk, and rock performers in an intimate tasting room setting. Pair live music with island-made wines and bistro fare.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-06-07', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro in Freeland. A charming, intimate venue for top-notch local musicians paired with handcrafted wines.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-06-14', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s. Enjoy a relaxed evening of jazz, blues, or folk with wine and bistro dining on Whidbey Island.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-06-21', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro. Local musicians perform in this charming Freeland venue.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-06-28', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro in Freeland. A perfect summer evening destination on Whidbey Island.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-07-05', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro. Celebrate the holiday weekend with wine, food, and live performances.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-07-12', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s. Local artists perform jazz, blues, folk, and rock in a warm bistro setting.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-07-19', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro in Freeland. Wine, food, and live music on Whidbey Island.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved'),

  ('Leo & Leto''s: Saturday Night Live Music', '2026-07-26', '6:00 PM – 8:00 PM', 'Leo & Leto''s Winery & Bistro, 5511 Freeland Ave, Freeland', 'Freeland', 'Music & Performance',
   'Live music every Saturday night at Leo & Leto''s Winery & Bistro in Freeland. An intimate evening of local music and island wines.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Leo & Leto''s Winery', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 12. RECURRING: ORLANDO'S TRIVIA NIGHT - Oak Harbor
--     Every Thursday, 6:00 PM
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Trivia Night at Orlando''s', '6:00 PM', 'Orlando''s Bar & Southern BBQ, Oak Harbor', 'Oak Harbor', 'Community & Social',
   'Weekly trivia night at Orlando''s Bar and Southern BBQ. Themed trivia once a month, general knowledge the other weeks. Prizes for winners every week. Grab a plate of BBQ and test your knowledge.',
   ARRAY['Adult Event', 'Just Fun'], 'weekly', 4, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 13. RECURRING: PENN COVE BREWING TRIVIA NIGHT - Oak Harbor
--     Wednesdays, 7:00 PM
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Penn Cove Brewing: Trivia Night', '7:00 PM', 'Penn Cove Brewing Company, Oak Harbor Taproom', 'Oak Harbor', 'Community & Social',
   'Weekly trivia night at Penn Cove Brewing''s Oak Harbor taproom. Grab a craft beer and compete with friends on a range of trivia topics. Mid-week fun at Whidbey Island''s largest craft brewery.',
   ARRAY['Adult Event', 'Just Fun'], 'weekly', 3, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 14. RECURRING: PENN COVE BREWING LIVE MUSIC - Fri & Sat
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Penn Cove Brewing: Friday Live Music', '6:00 PM – 8:00 PM', 'Penn Cove Brewing Company, Coupeville Taproom, 103 S Main St', 'Coupeville', 'Music & Performance',
   'Live music every Friday evening at Penn Cove Brewing''s Coupeville taproom. Local musicians perform while you enjoy craft beers and waterfront views in the heart of historic Coupeville.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'weekly', 5, '2026-05-25', '2026-09-30', true),

  ('Penn Cove Brewing: Saturday Live Music', '6:00 PM – 8:00 PM', 'Penn Cove Brewing Company, Coupeville Taproom, 103 S Main St', 'Coupeville', 'Music & Performance',
   'Live music every Saturday evening at Penn Cove Brewing''s Coupeville taproom. Enjoy local artists performing in a relaxed brewery atmosphere in historic downtown Coupeville.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-09-30', true);


-- ──────────────────────────────────────────────────────────────
-- 15. RECURRING: BAILEY'S CORNER STORE TRIVIA - Clinton
--     Every Thursday, 6:30 PM
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Bailey''s Corner Store: Trivia Night', '6:30 PM', 'Bailey''s Corner Store, 7695 Cultus Bay Rd, Clinton', 'Clinton', 'Community & Social',
   'Weekly trivia night at Bailey''s Corner Store, a genuine throwback country market in Clinton built in 1909. Grab a burger and a craft beer, then test your wits with friends and neighbors.',
   ARRAY['Adult Event', 'Just Fun'], 'weekly', 4, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 16. RECURRING: BAILEY'S CORNER STORE OPEN MIC COMEDY - Clinton
--     Wednesdays
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Bailey''s Corner Store: Open Mic Comedy', '7:00 PM', 'Bailey''s Corner Store, 7695 Cultus Bay Rd, Clinton', 'Clinton', 'Arts & Culture',
   'Open mic comedy night hosted by Pat Moote at Bailey''s Corner Store in Clinton. Sign up for a set or just come to laugh. A beloved weekly tradition in a cozy 1909 country store setting.',
   ARRAY['Adult Event', 'Just Fun'], 'weekly', 3, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 17. YOGA IN THE PARK - South Whidbey Community Park
--     Summer series, Langley
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Yoga in the Park', '9:00 AM – 10:00 AM', 'South Whidbey Community Park, 5495 Maxwelton Rd, Langley', 'Langley', 'Sports & Fitness',
   'Outdoor yoga at South Whidbey Community Park offering whole-body fitness and mindful movement. Connect with your body and breath while getting stronger, with better balance and flexibility. In partnership with Island Athletic Club. Advance registration required.',
   ARRAY['Adult Event', 'Class'], 'weekly', 6, '2026-06-06', '2026-08-29', true);


-- ──────────────────────────────────────────────────────────────
-- 18. WHIDBEY AUDUBON BIRD WALKS
--     2nd Wednesday (North), biweekly Thursdays (South)
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Birding in Neighborhoods: North Whidbey', '2026-06-10', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Oak Harbor', 'Nature & Wildlife',
   'Monthly bird walk with Whidbey Audubon Society on the second Wednesday. Practice bird identification, explore habitats, and learn from fellow birders. All experience levels welcome. Check the website for the specific meeting location.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved'),

  ('Birding in Neighborhoods: North Whidbey', '2026-07-08', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Oak Harbor', 'Nature & Wildlife',
   'Monthly bird walk with Whidbey Audubon Society on the second Wednesday. Practice bird identification, explore habitats, and learn from fellow birders. All experience levels welcome.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved'),

  ('Birding in Neighborhoods: South Whidbey', '2026-06-04', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Langley', 'Nature & Wildlife',
   'Biweekly bird walk on South Whidbey led by Cathi Bower. Explore diverse habitats and identify birds by sight and sound. Great for beginners and experienced birders alike.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved'),

  ('Birding in Neighborhoods: South Whidbey', '2026-06-18', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Langley', 'Nature & Wildlife',
   'Biweekly bird walk on South Whidbey with the Whidbey Audubon Society. Discover island birdlife in meadows, forests, and shorelines.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved'),

  ('Birding in Neighborhoods: South Whidbey', '2026-07-02', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Langley', 'Nature & Wildlife',
   'Biweekly bird walk on South Whidbey led by Cathi Bower. All experience levels welcome for this casual morning of birding.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved'),

  ('Birding in Neighborhoods: South Whidbey', '2026-07-16', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Langley', 'Nature & Wildlife',
   'Biweekly bird walk on South Whidbey with the Whidbey Audubon Society. Join fellow birders for a morning of identification and habitat exploration.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved'),

  ('Birding in Neighborhoods: South Whidbey', '2026-07-30', '9:00 AM', 'Varies - check whidbeyaudubonsociety.org', 'Langley', 'Nature & Wildlife',
   'Biweekly bird walk on South Whidbey led by Cathi Bower. Explore the island''s diverse birdlife in a relaxed group setting.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Audubon Society', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 19. WHIDBEY ISLAND KAYAKING - Bioluminescence Tours
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Bioluminescence Kayak Tour', '2026-06-20', '9:30 PM', 'South Whidbey Harbor, Langley', 'Langley', 'Nature & Wildlife',
   'Guided kayak tour to experience glowing bioluminescent waters off Whidbey Island. Tours offered during new moon periods for best visibility. Equipment provided. Advance booking required at whidbeyislandkayaking.com.',
   ARRAY['Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Island Kayaking', 'approved'),

  ('Bioluminescence Kayak Tour', '2026-07-18', '9:30 PM', 'South Whidbey Harbor, Langley', 'Langley', 'Nature & Wildlife',
   'Guided kayak tour to experience the magical glow of bioluminescent waters off Whidbey Island. Limited availability during new moon periods. Equipment provided. Book at whidbeyislandkayaking.com.',
   ARRAY['Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Island Kayaking', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 20. CAPTAIN WHIDBEY - Tuesday Trivia Night
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Captain Whidbey: Tuesday Trivia Night', '7:00 PM', 'Captain Whidbey Inn, 2072 Captain Whidbey Inn Rd, Coupeville', 'Coupeville', 'Community & Social',
   'Weekly trivia night at the historic Captain Whidbey Inn. Enjoy the special trivia menu at the bar while competing for prizes worth up to $200 each week. Open to guests and locals alike in the cozy log-cabin inn on Penn Cove.',
   ARRAY['Adult Event', 'Just Fun', 'Visitor Friendly'], 'weekly', 2, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 21. EBEY'S LANDING / COUPEVILLE HISTORIC TOURS
--     Visitor Center open Memorial Day - Labor Day
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Historic Coupeville Self-Guided Walking Tour', '2026-05-25', '10:00 AM – 4:00 PM', 'Island County Historical Museum, 908 NW Alexander St, Coupeville', 'Coupeville', 'Arts & Culture',
   'Pick up a free self-guided walking tour guide at the Island County Historical Museum and explore 65 historic locations in downtown Coupeville. The museum features displays on Indigenous heritage, settler life, maritime history, and island communities. Museum open Mon-Sat 10-4, Sun 11-4. Admission by donation.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Ebey''s Landing NHR', 'approved'),

  ('Jacob & Sarah Ebey House: Open for Visitors', '2026-05-25', '10:00 AM – 4:00 PM', 'Jacob & Sarah Ebey House, Ebey''s Landing NHR, Coupeville', 'Coupeville', 'Arts & Culture',
   'The historic Jacob and Sarah Ebey House opens for the summer season. Volunteer-operated NPS Visitor Contact Station with interpretive exhibits about early Whidbey Island settlement. Open Fri-Sun, Memorial Day through Labor Day.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Ebey''s Landing NHR', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 22. WHIDBEY CAMANO LAND TRUST - Guided Nature Walks
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Camano Land Trust: Guided Walk & Talk', '2026-06-14', '10:00 AM – 12:00 PM', 'Varies - check wclt.org/events', 'Coupeville', 'Nature & Wildlife',
   'Join the Whidbey Camano Land Trust for a guided nature walk exploring protected old-growth forests, peaceful meadows, wetlands, and scenic viewpoints. Knowledgeable guides share information about native flora and fauna. Family-friendly walks also available.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Camano Land Trust', 'approved'),

  ('Whidbey Camano Land Trust: Guided Walk & Talk', '2026-07-12', '10:00 AM – 12:00 PM', 'Varies - check wclt.org/events', 'Coupeville', 'Nature & Wildlife',
   'Guided nature walk through Land Trust conservation properties. Explore native habitats with knowledgeable guides who share stories of the island''s ecology and conservation. Some walks welcome dogs. Check wclt.org for location details.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Camano Land Trust', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 23. SUMMER CAMPS - Kids/Family
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Green Arts Camp at Full Moon Rising Farm', '2026-06-22', '9:00 AM – 3:00 PM', 'Full Moon Rising Farm, Langley', 'Langley', 'Classes & Workshops',
   'Free-form creative summer camp for kids ages 4-16 at Full Moon Rising Farm. Campers create art using wood, burlap, shells, clay, and natural dyes while exploring the natural spaces of the farm. Art and science meet through earth-centered play.',
   ARRAY['Kids Event', 'Family Event', 'Class'], 'Event Seed', 'noreply@whidbeywave.com', 'Full Moon Rising Farm', 'approved'),

  ('Wild Art Explorers Camp (WILASC)', '2026-07-06', '9:00 AM – 3:00 PM', 'Whidbey Island Language Art & STEM Center, Langley', 'Langley', 'Classes & Workshops',
   'Summer camp for young artists ages 5-10 blending outdoor exploration with artistic creation. Children spend time outdoors observing and collecting inspiration from nature, then create masterpieces using various art mediums and techniques.',
   ARRAY['Kids Event', 'Class'], 'Event Seed', 'noreply@whidbeywave.com', 'WILASC', 'approved'),

  ('Meadow Adventure Camp (WILASC)', '2026-07-13', '9:00 AM – 3:00 PM', 'Whidbey Island Language Art & STEM Center, Langley', 'Langley', 'Classes & Workshops',
   'Outdoor summer camp inviting children into a week of movement, imagination, storytelling, and outdoor exploration. Each day includes movement games, nature walks, creative art projects, and storytelling adventures on South Whidbey.',
   ARRAY['Kids Event', 'Class'], 'Event Seed', 'noreply@whidbeywave.com', 'WILASC', 'approved'),

  ('Whidbey Children''s Theatre: Creative Dramatics Camp', '2026-07-06', '9:00 AM – 12:00 PM', 'Whidbey Children''s Theatre, Langley', 'Langley', 'Classes & Workshops',
   'Week-long theater camp for ages 4-8 focusing on theater games, movement, and music. Children create their own stories and costumes in a playful, creative environment. Registration at wctmagic.org.',
   ARRAY['Kids Event', 'Class'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Children''s Theatre', 'approved'),

  ('Whidbey Children''s Theatre: Stage Combat Camp', '2026-07-20', '1:00 PM – 4:00 PM', 'Whidbey Children''s Theatre, Langley', 'Langley', 'Classes & Workshops',
   'Learn the art of stage combat with mother-son duo Cait and Callum Cassee at Whidbey Children''s Theatre. Two age groups available. A unique summer theater experience for aspiring young actors.',
   ARRAY['Kids Event', 'Class'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Children''s Theatre', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 24. GREENBANK FARM WINE SHOP - Book Club & Events
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Greenbank Farm Wine Shop Book Club', '5:00 PM', 'Greenbank Farm Wine Shop, 765 Wonn Rd, Greenbank', 'Greenbank', 'Community & Social',
   'Monthly book club at the Greenbank Farm Wine Shop. Socialize over wine, discuss the month''s selection, and discover new reads with fellow island book lovers. A cozy community gathering at the heart of Greenbank Farm.',
   ARRAY['Adult Event', 'Just Fun'], 'monthly', 3, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 25. GREENBANK FARM WINE SHOP - Paint & Sip
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Paint & Sip at Greenbank Farm Wine Shop', '2026-06-13', '6:00 PM – 8:00 PM', 'Greenbank Farm Wine Shop, 765 Wonn Rd, Greenbank', 'Greenbank', 'Classes & Workshops',
   'Creative evening of painting at Greenbank Farm Wine Shop. No experience necessary -- includes apron, easel, 16x20 canvas, and step-by-step instruction. Wine available for purchase. A fun night out at the farm.',
   ARRAY['Adult Event', 'Class', 'Visual Art', 'Just Fun'], 'Event Seed', 'noreply@whidbeywave.com', 'Greenbank Farm Wine Shop', 'approved'),

  ('Paint & Sip at Greenbank Farm Wine Shop', '2026-07-11', '6:00 PM – 8:00 PM', 'Greenbank Farm Wine Shop, 765 Wonn Rd, Greenbank', 'Greenbank', 'Classes & Workshops',
   'Paint your own masterpiece while sipping wine at Greenbank Farm. No experience necessary. All supplies included: apron, easel, canvas, and step-by-step instruction from a local artist.',
   ARRAY['Adult Event', 'Class', 'Visual Art', 'Just Fun'], 'Event Seed', 'noreply@whidbeywave.com', 'Greenbank Farm Wine Shop', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 26. SPOILED DOG WINERY - Weekend Tastings
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Spoiled Dog Winery: Weekend Wine Tasting', '12:00 PM – 5:00 PM', 'Spoiled Dog Winery, 5881 Maxwelton Rd, Langley', 'Langley', 'Food & Drink',
   'Visit Spoiled Dog Winery for wine tasting in their outdoor seating area with four covered gazebos overlooking the vineyard. Sample estate pinot noir and other wines. Open Saturdays 12-5, Sundays 12-5, Fridays 2-5.',
   ARRAY['Adult Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-11-30', true);


-- ──────────────────────────────────────────────────────────────
-- 27. COMFORTS OF WHIDBEY - Summer Tasting & Music
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Comforts of Whidbey: Summer Wine Tasting', '12:00 PM – 5:00 PM', 'Comforts of Whidbey, 5045 SR 525, Langley', 'Langley', 'Food & Drink',
   'Wine tasting at Comforts of Whidbey, a family-owned winery and B&B on 22 acres overlooking Puget Sound. Sample estate white wines including Madeleine Angevine and Siegerrebe plus Washington red wines. Live music in the tasting room during summer.',
   ARRAY['Adult Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-11-30', true);


-- ──────────────────────────────────────────────────────────────
-- 28. BEACH LITTER CLEANUP - Weekly Tuesday Volunteer
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Community Beach Litter Cleanup', '1:00 PM – 3:00 PM', 'Varies - contact jana.mcgehee@wsu.edu for locations', 'Coupeville', 'Outdoors & Recreation',
   'Weekly beach litter cleanup organized by WSU Extension Island County. Help remove litter and illegally dumped materials from public beaches. All ages 18+ welcome. Bags, gloves, and equipment provided. One-day park passes available for volunteers without a Discover Pass.',
   ARRAY['Adult Event'], 'weekly', 2, '2026-05-25', NULL, true);


-- ──────────────────────────────────────────────────────────────
-- 29. ISLAND COUNTY HISTORICAL MUSEUM - Open Daily
-- ──────────────────────────────────────────────────────────────

-- (Not an event per se, but the walking tours are ongoing)


-- ──────────────────────────────────────────────────────────────
-- 30. DECEPTION PASS - Family in Nature Program
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Family in Nature at Deception Pass', '2026-06-14', '10:00 AM – 11:30 AM', 'Deception Pass State Park, North Beach', 'Oak Harbor', 'Nature & Wildlife',
   'Interactive nature program for children ages 2-5 and their families at Deception Pass State Park. Each 90-minute session focuses on various aspects of park nature and includes story time, creative play, parent-led activities, and crafts. Discover Pass required for parking.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'WA State Parks', 'approved'),

  ('Family in Nature at Deception Pass', '2026-06-28', '10:00 AM – 11:30 AM', 'Deception Pass State Park, North Beach', 'Oak Harbor', 'Nature & Wildlife',
   'Interactive nature program for children ages 2-5 at Deception Pass State Park. Story time, creative play, and nature crafts in a beautiful park setting. Discover Pass required.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'WA State Parks', 'approved'),

  ('Family in Nature at Deception Pass', '2026-07-12', '10:00 AM – 11:30 AM', 'Deception Pass State Park, North Beach', 'Oak Harbor', 'Nature & Wildlife',
   'Interactive nature program for children ages 2-5 and their families. Explore the natural wonders of Deception Pass through story time, creative play, and hands-on activities. Discover Pass required.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'WA State Parks', 'approved'),

  ('Family in Nature at Deception Pass', '2026-07-26', '10:00 AM – 11:30 AM', 'Deception Pass State Park, North Beach', 'Oak Harbor', 'Nature & Wildlife',
   'Interactive nature program for young children ages 2-5 at Deception Pass. Crafts, stories, and creative play immersed in nature. A beloved summer program at Washington''s most visited state park.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'WA State Parks', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 31. WHIDBEY ISLAND FAIR (July 23-26)
--     Already in database — SKIP
-- ──────────────────────────────────────────────────────────────


-- ──────────────────────────────────────────────────────────────
-- 32. FORT CASEY LIGHTHOUSE - Summer Docent Tours
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Fort Casey Lighthouse: Docent-Led Tours', '11:00 AM – 4:00 PM', 'Admiralty Head Lighthouse, Fort Casey State Park, Coupeville', 'Coupeville', 'Arts & Culture',
   'Climb the tower of the 1903 Admiralty Head Lighthouse at Fort Casey State Park. Docent volunteers share the history of the lighthouse, military batteries, and the coastal defense era. Gift shop open. Discover Pass required for parking.',
   ARRAY['Family Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-09-07', true);


-- ──────────────────────────────────────────────────────────────
-- 33. WHIDBEY OUTDOOR YOGA - South Whidbey
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Outdoor Yoga', '2026-06-07', '9:00 AM – 10:00 AM', 'Various locations on South Whidbey (community gardens, beaches, parks)', 'Langley', 'Sports & Fitness',
   'Outdoor yoga classes held in community gardens, private beaches, parks, and local farms on South Whidbey Island. Drop-in: $15 general, $10 students. Email hedyehj@gmail.com for schedule and locations.',
   ARRAY['Adult Event', 'Class'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Outdoor Yoga', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 34. WHIDBEY ISLAND KAYAKING - Penn Cove Tour
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Penn Cove Kayak Tour from Captain Whidbey', '2026-06-01', '10:00 AM – 12:00 PM', 'Captain Whidbey Inn, 2072 Captain Whidbey Inn Rd, Coupeville', 'Coupeville', 'Outdoors & Recreation',
   'Two-hour guided kayak experience launching from the historic Captain Whidbey Inn on Penn Cove. Guides share the history, habitat, and aquaculture of the cove while you paddle along bluffs past eagles and herons. Book at whidbeyislandkayaking.com.',
   ARRAY['Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Island Kayaking', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 35. SALISH SEA DAY at Deception Pass
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Salish Sea Day at Deception Pass', '2026-06-21', '10:00 AM – 3:00 PM', 'Bowman Bay, Deception Pass State Park', 'Oak Harbor', 'Arts & Culture',
   'Annual celebration of Coast Salish culture with the Samish and Swinomish tribes at Bowman Bay. Features canoe arrivals, storytelling, traditional arts demonstrations, and family activities. A unique opportunity to learn about the Indigenous heritage of the Salish Sea.',
   ARRAY['Family Event', 'Kids Event', 'Festival', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Deception Pass Park Foundation', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 36. TOBY'S TAVERN - Weekend Live Music
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Toby''s Tavern: Live Music Friday', '6:00 PM – 8:00 PM', 'Toby''s Tavern, 8 NW Front St, Coupeville', 'Coupeville', 'Music & Performance',
   'Live music every Friday evening at Toby''s Tavern on the Coupeville waterfront. Enjoy local musicians while dining on Penn Cove mussels and craft beers in this beloved Coupeville institution.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'weekly', 5, '2026-05-25', '2026-09-30', true),

  ('Toby''s Tavern: Live Music Saturday', '6:00 PM – 8:00 PM', 'Toby''s Tavern, 8 NW Front St, Coupeville', 'Coupeville', 'Music & Performance',
   'Live music every Saturday evening at Toby''s Tavern on the historic Coupeville waterfront. A classic island evening with local musicians, good food, and craft drinks.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-09-30', true);


-- ──────────────────────────────────────────────────────────────
-- 37. WHIDBEY ISLAND MUSIC FESTIVAL (Classical/Baroque)
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Island Music Festival: Summer Chamber Concert', '2026-07-11', '7:30 PM', 'St. Augustine''s in-the-Woods, 5217 Honeymoon Bay Rd, Freeland', 'Freeland', 'Music & Performance',
   'The Whidbey Island Music Festival presents baroque and classical chamber music with vibrant performances of old favorites and undiscovered gems. Intimate indoor performances featuring period instruments. Founded in 2006 by Tekla Cunningham.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Island Music Festival', 'approved'),

  ('Whidbey Island Music Festival: Summer Chamber Concert', '2026-07-18', '7:30 PM', 'St. Augustine''s in-the-Woods, 5217 Honeymoon Bay Rd, Freeland', 'Freeland', 'Music & Performance',
   'Baroque and classical chamber music performed on period instruments in the intimate setting of St. Augustine''s church. Part of the year-round Whidbey Island Music Festival featuring works by Bach, Mozart, Vivaldi, and more.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Island Music Festival', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 38. SALISH SEA EARLY MUSIC FESTIVAL (Whidbey dates)
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Salish Sea Early Music Festival on Whidbey', '2026-06-27', '7:30 PM', 'Varies - check salishseafestival.org/whidbey', 'Freeland', 'Music & Performance',
   'The Salish Sea Early Music Festival presents "Folk, Baroque & Beyond" with Oleg Timofeyev and flutist Jeffrey Cohan performing three centuries of variations on popular music using period instruments. Part of a multi-city Salish Sea concert series.',
   ARRAY['Live Music', 'Adult Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Salish Sea Early Music Festival', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 39. WHIDBEY PLAYHOUSE - Summer Production
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Playhouse: Little Shop of Horrors', '2026-06-12', '7:30 PM', 'Whidbey Playhouse, 730 SE Midway Blvd, Oak Harbor', 'Oak Harbor', 'Arts & Culture',
   'The beloved horror-comedy rock musical brings the man-eating plant Audrey II to the Whidbey Playhouse stage. Directed by Eric George. A community theater tradition for nearly 50 years in Oak Harbor. Check whidbeyplayhouse.com for performance dates.',
   ARRAY['Family Event', 'Just Fun', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Playhouse', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 40. WHIDBEY CHILDREN'S THEATRE - The Neverlanders
-- ──────────────────────────────────────────────────────────────

INSERT INTO event_submissions (title, date, time, location, town, category, description, tags, submitter_name, submitter_email, source, status)
VALUES
  ('Whidbey Children''s Theatre: The Neverlanders', '2026-06-19', '7:00 PM', 'Whidbey Children''s Theatre, 723 Camano Ave, Langley', 'Langley', 'Arts & Culture',
   'Whidbey Children''s Theatre presents The Neverlanders, performed by island youth. Founded in 1981, WCT has been a source of learning and entertainment for and by area young people. Tickets at wctmagic.org.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'Event Seed', 'noreply@whidbeywave.com', 'Whidbey Children''s Theatre', 'approved');


-- ──────────────────────────────────────────────────────────────
-- 41. LANGLEY WHALE CENTER - Open for Season
--     Wed-Sun, 11 AM – 4 PM (corrected Sep 2026 per LWC manager)
-- ──────────────────────────────────────────────────────────────

INSERT INTO recurring_events (title, time, location, town, category, description, tags, recurrence_type, day_of_week, start_date, end_date, is_active)
VALUES
  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 3, '2026-05-25', '2026-09-30', true),
  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 4, '2026-05-25', '2026-09-30', true),
  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 5, '2026-05-25', '2026-09-30', true),
  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 6, '2026-05-25', '2026-09-30', true),
  ('Langley Whale Center: Open Hours', '11:00 AM – 4:00 PM', 'Langley Whale Center, 105 Anthes Ave, Langley', 'Langley', 'Nature & Wildlife',
   'Orca Network''s Langley Whale Center celebrates and educates on the whales of the Salish Sea. Free educational exhibits on orcas, gray whales, humpbacks, and other marine life. Run by volunteer docents. Open Wed-Sun.',
   ARRAY['Kids Event', 'Family Event', 'Visitor Friendly'], 'weekly', 0, '2026-05-25', '2026-09-30', true);
