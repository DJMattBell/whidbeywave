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

// ── News ────────────────────────────────────────────────────────────────────

export const newsPosts: NewsPost[] = [
  {
    id: 'n1',
    slug: 'ferry-service-expands-spring-2026',
    title: 'Washington State Ferries Adds Extra Sailings for Spring 2026',
    excerpt:
      'Commuters and visitors will see expanded schedules on the Mukilteo–Clinton and Port Townsend–Coupeville routes starting March 15.',
    body: `Washington State Ferries has announced expanded sailing schedules on two key Whidbey Island routes beginning March 15, 2026, just in time for the busy spring season.\n\nThe Mukilteo–Clinton run will add three additional round trips on weekdays, reducing waits during peak morning and evening commute hours. The Port Townsend–Coupeville route sees two additional weekend sailings to accommodate tourism traffic.\n\n"We've heard from islanders and visitors alike that capacity has been a challenge," said a WSF spokesperson. "These additions reflect our commitment to reliable, frequent service."\n\nPassengers are encouraged to check the WSF online reservation system, as some sailings will require advance booking during peak periods.`,
    author: 'Staff Reporter',
    publishedAt: '2026-02-20',
    category: 'Transportation',
    readMinutes: 3,
    emoji: '⛴️',
  },
  {
    id: 'n2',
    slug: 'langley-new-mural-downtown',
    title: 'Langley Unveils Stunning New Waterfront Mural',
    excerpt:
      "Local artist Mia Thornton's 60-foot orca mural now adorns the waterfront retaining wall, drawing visitors from across the island.",
    body: `A vibrant new mural depicting a pod of orcas swimming through kelp forests has transformed a once-grey retaining wall on Langley's waterfront into a must-see attraction.\n\nLocal artist Mia Thornton, who grew up in Langley, spent six weeks completing the 60-foot piece titled "Sound Family." The project was funded through a Whidbey Arts Council grant and community crowdfunding.\n\n"I wanted to capture the magic of seeing whales from the bluff as a kid," Thornton said at the unveiling ceremony. "This is my love letter to Puget Sound."\n\nThe mural is located on 1st Street and is best viewed from the lower park path. A public reception is planned for early March.`,
    author: 'Arts Correspondent',
    publishedAt: '2026-02-18',
    category: 'Arts & Culture',
    readMinutes: 4,
    emoji: '🎨',
  },
  {
    id: 'n3',
    slug: 'whidbey-farm-wins-state-award',
    title: "Ebey's Landing Farm Wins Washington State Sustainable Agriculture Award",
    excerpt:
      "Hollandia Produce, a fourth-generation family farm in the Ebey's Landing reserve, was recognized for its pioneering soil health program.",
    body: `Hollandia Produce, a 480-acre family farm within the historic Ebey's Landing National Historical Reserve, has been named the 2026 Washington State Sustainable Agriculture Award winner by the Washington State Department of Agriculture.\n\nThe farm, now in its fourth generation of operation, was recognized for its innovative no-till cover-crop rotation system that has improved topsoil depth by over two inches in just five years.\n\nFarm manager Brent Vanderhoof accepted the award in Olympia last week. "Our grandparents farmed this land and we plan to hand it to our grandchildren richer than we found it," he said.\n\nVisitors can tour the farm during the upcoming Whidbey Island Farm Tour weekend in July.`,
    author: 'Environment Desk',
    publishedAt: '2026-02-14',
    category: 'Agriculture',
    readMinutes: 4,
    emoji: '🌾',
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
};
