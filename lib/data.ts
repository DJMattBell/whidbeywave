export const EVENT_TAGS = [
  'Kids Event',
  'Family Event',
  'Adult Event',
  'Live Music',
  'Festival',
  'Karaoke',
  'Class',
  'Visual Art',
  'Just Fun',
  'Market',
  'Visitor Friendly',
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

export type Event = {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  time: string;
  location: string;
  town: string;
  category: string;
  description: string;
  emoji: string;
  tags: EventTag[];
  recurring_event_id?: string | null;
  recurrence_summary?: string | null;
};

export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string; // YYYY-MM-DD
  category: string;
  readMinutes: number;
  emoji: string;
  postType: 'news' | 'guide';
  imageUrl: string | null;
  tags: string[];
};

export type Listing = {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  description: string;
  seller: string;
  postedAt: string;
  emoji: string;
};

// ── Events ─────────────────────────────────────────────────────────────────

export const events: Event[] = [
  {
    id: 'e1',
    title: 'Langley Whale Center Open House',
    date: '2026-03-01',
    time: '10:00 AM – 4:00 PM',
    location: 'Langley Whale Center, 104 2nd St',
    town: 'Langley',
    category: 'Nature',
    description:
      'Join us for a free open house celebrating the spring gray whale migration. Expert naturalists on hand, hands-on exhibits, and whale-watching tips for the season.',
    emoji: '🐋',
    tags: ['Family Event', 'Kids Event', 'Just Fun'],
  },
  {
    id: 'e2',
    title: 'Coupeville Arts & Crafts Festival',
    date: '2026-03-07',
    time: '9:00 AM – 5:00 PM',
    location: 'Coupeville Wharf Plaza',
    town: 'Coupeville',
    category: 'Arts',
    description:
      'Over 80 local artisans gather along the historic waterfront wharf. Pottery, jewelry, paintings, and live music from local acoustic acts all day long.',
    emoji: '🎨',
    tags: ['Family Event', 'Visual Art', 'Live Music', 'Festival'],
  },
  {
    id: 'e3',
    title: 'Oak Harbor Farmers Market – Spring Opening',
    date: '2026-03-14',
    time: '8:00 AM – 1:00 PM',
    location: 'Windjammer Park, Oak Harbor',
    town: 'Oak Harbor',
    category: 'Market',
    description:
      'The beloved seasonal farmers market returns! Fresh island-grown produce, pastured meats, artisan breads, flowers, and crafts. Bring your reusable bags.',
    emoji: '🥕',
    tags: ['Family Event', 'Kids Event', 'Market'],
  },
  {
    id: 'e4',
    title: 'Whidbey Island Film Festival',
    date: '2026-03-20',
    time: '6:00 PM – 10:00 PM',
    location: 'Clyde Theatre, Langley',
    town: 'Langley',
    category: 'Film',
    description:
      'An evening of award-winning short films by Pacific Northwest filmmakers. Q&A with directors following the screening. Advance tickets recommended.',
    emoji: '🎬',
    tags: ['Adult Event', 'Visual Art', 'Just Fun'],
  },
  {
    id: 'e5',
    title: 'Island Trail Cleanup & Hike',
    date: '2026-03-28',
    time: '9:00 AM – 12:00 PM',
    location: 'South Whidbey State Park Trailhead',
    town: 'Freeland',
    category: 'Outdoors',
    description:
      'Volunteer to keep our trails pristine! Gloves and bags provided. After the cleanup enjoy a guided 3-mile hike through old-growth forest to the beach.',
    emoji: '🌲',
    tags: ['Family Event', 'Kids Event', 'Class', 'Just Fun'],
  },
];

// ── News (DEMO ONLY — not used in production paths) ──────────────────────────
// Do NOT import this in server components or API routes that serve real users.
// Use Supabase (news_posts table) for all live data.

export const newsPosts: NewsPost[] = [
  {
    id: 'n1',
    slug: 'michelin-chef-johnny-spero-passage-inn-at-langley',
    title: 'Michelin-Starred Chef Johnny Spero to Open "Passage" at the Inn at Langley',
    excerpt:
      'The D.C. chef behind Reverie is bringing a multicourse tasting menu to Langley\'s waterfront when the renovated Inn reopens May 17.',
    body: `Michelin-starred chef Johnny Spero will helm Passage, a new tasting-menu restaurant at the Inn at Langley, when the waterfront property reopens after renovations on May 17.\n\nSpero earned his Michelin star running Reverie, a celebrated tasting room in Washington, D.C. He previously served as executive chef at José Andrés' Minibar and staged at Spain's Mugaritz. He shuttered Reverie in 2025 and moved his family to Whidbey Island to begin menu research and settle into island life.\n\nPassage will focus on an ingredient-driven, multicourse tasting menu built around seasonal Pacific Northwest products and local producers. The intimate waterfront setting — every room at the Inn overlooks the Saratoga Passage and the Cascade Mountains — is expected to make tables a hot commodity.\n\nTicketing and reservation details are expected to appear on the Inn's website in the coming weeks as the property finalizes its reopening schedule.`,
    author: 'WhidbeyWave',
    publishedAt: '2026-03-27',
    category: 'Business',
    readMinutes: 3,
    emoji: '👨‍🍳',
    postType: 'news',
    imageUrl: null,
    tags: ['business', 'langley', 'restaurants'],
  },
  {
    id: 'n2',
    slug: 'mosquito-fleet-act-passenger-ferry-expansion',
    title: 'Passenger Ferry Expansion Bill Clears Senate — Could Bring Walk-On Service to South Whidbey',
    excerpt:
      'House Bill 1923, the "Mosquito Fleet Act," would let counties and port districts launch their own passenger-only ferries on Puget Sound.',
    body: `Legislation that could bring passenger-only ferry service to Whidbey Island cruised out of the state Senate on March 6 with bipartisan support.\n\nHouse Bill 1923, dubbed the Mosquito Fleet Act, passed the House 84–11 in February and would permit any county, city, transit agency, or port district bordering Puget Sound to establish passenger-only ferry service. The Port of Everett has been exploring a route connecting the Everett waterfront to South Whidbey.\n\nOther potential routes under the legislation include San Juan Islands to Sidney, B.C., restoring an international connection paused since 2020; inter-island service from the San Juans to Bellingham; and an Olympia to Sea-Tac run via Des Moines.\n\nHowever, the Senate made several revisions that left supporters and the bill's prime sponsor unsatisfied. The House and Senate had until March 12, the last day of session, to concur on a finalized version.`,
    author: 'WhidbeyWave',
    publishedAt: '2026-03-06',
    category: 'Transportation',
    readMinutes: 3,
    emoji: '⛴️',
    postType: 'news',
    imageUrl: null,
    tags: ['ferries', 'transportation', 'legislation'],
  },
  {
    id: 'n3',
    slug: 'affordable-housing-langley-habitat-will',
    title: '27 Affordable Housing Units Coming to Langley — Habitat and WILL Host Open House',
    excerpt:
      'Habitat for Humanity and Whidbey Island Living Legacy are building townhomes and cottages in Langley, with construction starting as early as April.',
    body: `Two nonprofit-led affordable housing projects are moving forward in Langley, with Habitat for Humanity of Island County and Whidbey Island Living Legacy (WILL) hosting a public open house on March 21 at the Island Church of Whidbey.\n\nThe Heron Park Townhomes, Habitat's project on Third Street, will add seven new units through two duplexes and a triplex. Liz Chaffin, Habitat's chief development officer, estimated construction could begin in April or May once the project's 30-day comment period wraps up.\n\nWILL's Grace Landing project will create six affordable cottages on donated land, where qualifying lower-income individuals can own their home. A third project, Generations Place at Second Street and De Bruyn Avenue, is being led by nonprofit Island Roots Housing.\n\nTogether, the three developments will bring 27 new units of affordable housing to Langley — a significant step for a community where rising home prices have pushed many residents off the island.`,
    author: 'WhidbeyWave',
    publishedAt: '2026-03-17',
    category: 'Community',
    readMinutes: 4,
    emoji: '🏡',
    postType: 'news',
    imageUrl: null,
    tags: ['housing', 'langley', 'community'],
  },
  {
    id: 'n4',
    slug: 'island-county-development-moratorium-extended',
    title: 'Island County Likely to Extend Building Moratorium in Rural Areas Another Six Months',
    excerpt:
      'The emergency moratorium on development in 11 semi-urban areas, including Clinton and Greenbank, may continue past its April sunset date.',
    body: `A development moratorium on semi-urban areas of unincorporated Island County may continue past its April sunset date after the three county commissioners informally decided to move forward with a six-month extension.\n\nOriginally adopted in April 2025 and amended in July, the moratorium prevents new development in 11 areas zoned as Rural Areas of Intense Development (RAIDS), including Clinton, Ken's Korner, Bayview, Greenbank, Cornet Bay, and Deception Pass.\n\nThe extension is needed because the periodic comprehensive plan update is running behind schedule. Before commissioners can formally adopt it, they must hold a public meeting, which has been scheduled for April 14.\n\nThe moratorium has been controversial on South Whidbey, particularly in Clinton, where a couple had been planning to build a new hotel. Amendments in July carved out exceptions for like-for-like reconstruction after natural disasters and emergency repairs within existing building footprints.`,
    author: 'WhidbeyWave',
    publishedAt: '2026-03-13',
    category: 'Community',
    readMinutes: 4,
    emoji: '🏗️',
    postType: 'news',
    imageUrl: null,
    tags: ['development', 'south whidbey'],
  },
  {
    id: 'n5',
    slug: 'whidbeyhealth-secures-10m-bond',
    title: 'WhidbeyHealth Secures $10 Million Credit Line for Emergency Reserves',
    excerpt:
      'The hospital board approved a bond agreement with Coastal Community Bank as an "insurance policy" while it rebuilds its financial footing.',
    body: `WhidbeyHealth's board has authorized issuance of a limited tax general obligation and revenue bond for up to $10 million from Coastal Community Bank, providing a financial safety net as the hospital district works to stabilize its finances.\n\nChief Financial Officer Paul Rogers described the credit line as "an insurance policy, a funding of last resort," and said he doesn't expect the hospital to draw on it. The agreement expires April 2, 2027, and replaces an identical bond from a year ago.\n\nThe move comes after a challenging financial stretch for the district. Moody's downgraded WhidbeyHealth's bond ratings in 2024, citing "severe and immediate liquidity challenges." The hospital currently has 10.5 days of cash on hand, but Rogers expects that to reach 30 days within six months.\n\nSecuring the new bond cost a $50,000 processing fee. In other board news, retired health care administrator Marcy Shimada, who has 40 years of leadership experience, was unanimously appointed as the newest member of the WhidbeyHealth board.`,
    author: 'WhidbeyWave',
    publishedAt: '2026-03-27',
    category: 'Health',
    readMinutes: 4,
    emoji: '🏥',
    postType: 'news',
    imageUrl: null,
    tags: ['health', 'whidbeyhealth'],
  },
  {
    id: 'n6',
    slug: 'sno-isle-libraries-levy-august-ballot',
    title: 'Sno-Isle Libraries to Ask Voters for Levy Restoration on August Ballot',
    excerpt:
      'If approved, the levy would restore funding to $0.47 per $1,000 of assessed value — an increase of about $106 per year for the median Island County homeowner.',
    body: `The Sno-Isle Libraries Board of Trustees adopted a resolution on March 23 to place a levy lid lift on the August 4 primary ballot, asking voters in Island and Snohomish counties to restore the library levy rate to $0.47 per $1,000 of assessed property value.\n\nThe current rate of $0.30 per $1,000 was approved by voters in 2018. For the median Island County home, valued at $640,100, the increase would work out to about $106 per year.\n\nLibrary officials warn that if the measure fails, Sno-Isle will face a projected operating deficit of $1.9 million in 2027 and will be forced to cut staff, services, and hours.\n\nOn Whidbey Island, Sno-Isle operates libraries in Oak Harbor, Coupeville, Langley, Freeland, and Clinton — making the levy a significant local issue for communities across the island.`,
    author: 'WhidbeyWave',
    publishedAt: '2026-03-24',
    category: 'Community',
    readMinutes: 3,
    emoji: '📚',
    postType: 'news',
    imageUrl: null,
    tags: ['libraries', 'taxes', 'island county'],
  },
];

// ── Marketplace Listings ─────────────────────────────────────────────────────

export const listings: Listing[] = [
  {
    id: 'l1',
    title: '2019 Hobie Kayak – Perfect Condition',
    price: '$1,400',
    category: 'Sporting Goods',
    location: 'Oak Harbor',
    description:
      'Hobie Mirage Compass 2019, pedal-drive system, includes paddle, life vest, and roof rack straps. Stored indoors, hull scratch-free. Great for exploring Penn Cove!',
    seller: 'Dave M.',
    postedAt: '2026-02-21',
    emoji: '🚣',
  },
  {
    id: 'l2',
    title: 'Hand-Thrown Pottery Set – 8 Pieces',
    price: '$185',
    category: 'Arts & Crafts',
    location: 'Langley',
    description:
      'Beautiful stoneware set wheel-thrown by a local Langley potter. Includes 4 mugs, 4 small bowls. Food-safe glaze in a Pacific blue tone. Perfect housewarming gift.',
    seller: 'Sandra K.',
    postedAt: '2026-02-19',
    emoji: '🏺',
  },
  {
    id: 'l3',
    title: 'Island CSA Farm Box Subscription – Spring',
    price: '$30/week',
    category: 'Food & Farm',
    location: 'Coupeville',
    description:
      'Weekly farm box from Double Diamond Farm. Seasonal vegetables, herbs, eggs, and a wildflower bouquet. 12-week spring subscription available. Pickup at Coupeville wharf Saturdays.',
    seller: 'Double Diamond Farm',
    postedAt: '2026-02-17',
    emoji: '🥦',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Strip HTML tags and decode common entities from user-submitted text. */
export function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const categoryColors: Record<string, string> = {
  // Short names used by static fallback data
  Nature:         'bg-green-100 text-green-800',
  Arts:           'bg-purple-100 text-purple-800',
  Market:         'bg-yellow-100 text-yellow-800',
  Film:           'bg-pink-100 text-pink-800',
  Outdoors:       'bg-teal-100 text-teal-800',
  Transportation: 'bg-blue-100 text-blue-800',
  Agriculture:    'bg-lime-100 text-lime-800',
  // Long names used by event submission form and stored in DB
  'Nature & Wildlife':     'bg-green-100 text-green-800',
  'Arts & Culture':        'bg-purple-100 text-purple-800',
  'Farmers Market':        'bg-yellow-100 text-yellow-800',
  'Music & Performance':   'bg-fuchsia-100 text-fuchsia-800',
  'Outdoors & Recreation': 'bg-teal-100 text-teal-800',
  'Film & Media':          'bg-pink-100 text-pink-800',
  'Community & Social':    'bg-sky-100 text-sky-800',
  'Classes & Workshops':   'bg-indigo-100 text-indigo-800',
  'Food & Drink':          'bg-orange-100 text-orange-800',
  'Sports & Fitness':      'bg-lime-100 text-lime-800',
  Other:                   'bg-stone-100 text-stone-600',
  // Marketplace categories
  'Sporting Goods': 'bg-orange-100 text-orange-800',
  'Arts & Crafts':  'bg-pink-100 text-pink-800',
  'Food & Farm':    'bg-green-100 text-green-800',
  // News post categories
  Community: 'bg-sky-100 text-sky-800',
  Events:    'bg-amber-100 text-amber-800',
  Business:  'bg-stone-100 text-stone-700',
  Health:    'bg-rose-100 text-rose-800',
  // Guide categories
  'Getting Around':  'bg-blue-100 text-blue-800',
  'Island Living':   'bg-green-100 text-green-800',
  'Seasonal':        'bg-amber-100 text-amber-800',
  'Food & Farms':    'bg-orange-100 text-orange-800',
  'History & Culture': 'bg-purple-100 text-purple-800',
};
