import type { SupabaseClient } from '@supabase/supabase-js';

type MarketDef = {
  title: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  time: string;
  seasonStart: string; // YYYY-MM-DD
  seasonEnd: string;   // YYYY-MM-DD
  town: string;
  location: string;
  category: string;
  tags: string[];
  description: string;
  source: string;
};

const MARKETS: MarketDef[] = [
  {
    title:       'Bayview Farmers Market',
    dayOfWeek:   6, // Saturday
    time:        '10:00 AM – 2:00 PM',
    seasonStart: '2026-04-26',
    seasonEnd:   '2026-10-18',
    town:        'Langley',
    location:    'Bayview Farmers Market, Bayview Rd, Langley',
    category:    'Farmers Market',
    tags:        ['Market', 'Family Event'],
    description: "Whidbey Island's largest farmers market featuring local farmers, artists, growers, and food makers. Saturdays 10am–2pm.",
    source:      'Bayview Farmers Market',
  },
  {
    title:       'South Whidbey Tilth Farmers Market',
    dayOfWeek:   0, // Sunday
    time:        '11:00 AM – 3:00 PM',
    seasonStart: '2026-04-27',
    seasonEnd:   '2026-10-19',
    town:        'Langley',
    location:    'South Whidbey Tilth, SR 525, Langley',
    category:    'Farmers Market',
    tags:        ['Market', 'Family Event', 'Kids Event'],
    description: "Family-friendly Sunday market on a lush meadow with local produce, food, crafts, live music, and children's activities. 11am–3pm.",
    source:      'South Whidbey Tilth',
  },
  {
    title:       'Oak Harbor Farmers Market',
    dayOfWeek:   4, // Thursday
    time:        '4:00 PM – 7:00 PM',
    seasonStart: '2026-05-07',
    seasonEnd:   '2026-08-28',
    town:        'Oak Harbor',
    location:    'Rotary Park, SR 20 & NE 4th, Oak Harbor',
    category:    'Farmers Market',
    tags:        ['Market', 'Family Event'],
    description: "Fresh local produce, baked goods, arts and crafts, and quick food in Oak Harbor. Everything sold is made, grown, or produced by the vendor. Thursdays 4–7pm.",
    source:      'Oak Harbor Farmers Market',
  },
  {
    title:       'Coupeville Farmers Market',
    dayOfWeek:   6, // Saturday
    time:        '10:00 AM – 2:00 PM',
    seasonStart: '2026-04-18',
    seasonEnd:   '2026-10-11',
    town:        'Coupeville',
    location:    'Coupeville Town Green, Alexander St, Coupeville',
    category:    'Farmers Market',
    tags:        ['Market', 'Family Event'],
    description: "40+ year tradition on the Coupeville green. Local produce, handmade goods, and community vibes. Saturdays 10am–2pm.",
    source:      'Coupeville Farmers Market',
  },
  {
    title:       'Langley Second Street Market',
    dayOfWeek:   5, // Friday
    time:        '3:00 PM – 7:00 PM',
    seasonStart: '2026-05-01',
    seasonEnd:   '2026-08-28',
    town:        'Langley',
    location:    'Second Street, Langley',
    category:    'Farmers Market',
    tags:        ['Market', 'Family Event', 'Live Music'],
    description: "Summer Friday afternoon market in downtown Langley with produce, art, buskers, and live music. 3–7pm.",
    source:      'Langley Second Street Market',
  },
];

/** Generate all weekly dates for a market between seasonStart and seasonEnd */
function generateDates(market: MarketDef): string[] {
  const dates: string[] = [];
  const start = new Date(market.seasonStart + 'T12:00:00');
  const end   = new Date(market.seasonEnd   + 'T12:00:00');

  // Walk from start, advancing to the correct day of week
  const cur = new Date(start);
  // Move to first occurrence of dayOfWeek on or after start
  while (cur.getDay() !== market.dayOfWeek) {
    cur.setDate(cur.getDate() + 1);
  }

  while (cur <= end) {
    const yyyy = cur.getFullYear();
    const mm   = String(cur.getMonth() + 1).padStart(2, '0');
    const dd   = String(cur.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    cur.setDate(cur.getDate() + 7);
  }

  return dates;
}

export async function seedFarmersMarkets(
  supabase: SupabaseClient
): Promise<{ inserted: number; skipped: number }> {
  // Fetch existing approved market submissions to avoid duplicates
  const { data: existing } = await supabase
    .from('event_submissions')
    .select('title, date')
    .in('source', MARKETS.map(m => m.source));

  const existingKeys = new Set(
    (existing ?? []).map((e: { title: string; date: string }) => `${e.title}|${e.date}`)
  );

  const rows: object[] = [];

  for (const market of MARKETS) {
    const dates = generateDates(market);
    for (const date of dates) {
      const key = `${market.title}|${date}`;
      if (existingKeys.has(key)) continue;
      rows.push({
        title:           market.title,
        date,
        time:            market.time,
        location:        market.location,
        town:            market.town,
        category:        market.category,
        description:     market.description,
        tags:            market.tags,
        submitter_name:  'Market Seed',
        submitter_email: process.env.ADMIN_EMAIL ?? 'admin@whidbeywave.com',
        status:          'approved',
        source:          market.source,
      });
    }
  }

  if (rows.length === 0) return { inserted: 0, skipped: existingKeys.size };

  // Insert in batches of 100
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('event_submissions').insert(batch);
    if (error) {
      console.error('[seedFarmersMarkets] insert error:', error);
      throw error;
    }
    inserted += batch.length;
  }

  return { inserted, skipped: existingKeys.size };
}
