/**
 * Seed the marketplace with realistic Whidbey Island listings.
 *
 * Usage:
 *   npx tsx scripts/seed-marketplace.ts            # insert for real
 *   npx tsx scripts/seed-marketplace.ts --dry-run   # log only
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const SEED_LISTINGS = [
  {
    title: 'Kayak — 12ft Perception Pescador',
    category: 'Other',
    price: 450,
    is_free: false,
    location: 'Oak Harbor',
    description: 'Single sit-on-top kayak, great condition. Perfect for Puget Sound.',
    emoji: '🛶',
    seller_name: 'Island Seller',
  },
  {
    title: 'Free Firewood — you split',
    category: 'Free Stuff',
    price: 0,
    is_free: true,
    location: 'Coupeville',
    description: 'Large pile of alder rounds, you split and haul. Bring a truck.',
    emoji: '🪵',
    seller_name: 'Island Seller',
  },
  {
    title: 'Vintage Craftsman Workbench',
    category: 'Tools',
    price: 175,
    is_free: false,
    location: 'Langley',
    description: 'Solid wood workbench, 6ft long. Moving, must sell.',
    emoji: '🔧',
    seller_name: 'Island Seller',
  },
  {
    title: 'Island Eggs — pasture raised',
    category: 'Other',
    price: 8,
    is_free: false,
    location: 'Freeland',
    description: 'Fresh eggs from happy chickens. $8/dozen, available weekly.',
    emoji: '🥚',
    seller_name: 'Island Seller',
  },
  {
    title: 'Trek Mountain Bike — Medium frame',
    category: 'Other',
    price: 320,
    is_free: false,
    location: 'Oak Harbor',
    description: 'Trek Marlin 5, 2022. Great island trails bike. Minor wear.',
    emoji: '🚲',
    seller_name: 'Island Seller',
  },
  {
    title: 'Patio furniture set (6 pieces)',
    category: 'Furniture',
    price: 200,
    is_free: false,
    location: 'Greenbank',
    description: 'Wicker patio set — table, 4 chairs, loveseat. Fading but solid.',
    emoji: '🪑',
    seller_name: 'Island Seller',
  },
  {
    title: 'Dewalt Drill + 2 batteries',
    category: 'Tools',
    price: 95,
    is_free: false,
    location: 'Clinton',
    description: 'Dewalt 20V drill, two batteries, charger. Works great.',
    emoji: '🔧',
    seller_name: 'Island Seller',
  },
  {
    title: 'Free — moving boxes (30+)',
    category: 'Free Stuff',
    price: 0,
    is_free: true,
    location: 'Langley',
    description: 'Sturdy moving boxes from recent move. Various sizes, free to good home.',
    emoji: '📦',
    seller_name: 'Island Seller',
  },
  {
    title: 'Apple iMac 2020 — 27 inch',
    category: 'Electronics',
    price: 899,
    is_free: false,
    location: 'Oak Harbor',
    description: '27" iMac, i7, 32GB RAM, 512GB SSD. Excellent condition.',
    emoji: '💻',
    seller_name: 'Island Seller',
  },
  {
    title: 'Hand-thrown pottery — set of 6 mugs',
    category: 'Other',
    price: 120,
    is_free: false,
    location: 'Langley',
    description: 'Local artist, earthy glazes. Perfect island morning coffee mugs.',
    emoji: '☕',
    seller_name: 'Island Seller',
  },
  {
    title: 'Firewood — seasoned fir, split and stacked',
    category: 'Other',
    price: 250,
    is_free: false,
    location: 'Coupeville',
    description: 'Full cord of seasoned Douglas fir, split and ready to burn. Delivery available on-island.',
    emoji: '🔥',
    seller_name: 'Island Seller',
  },
  {
    title: 'Kids\' wetsuit — size 10',
    category: 'Clothing',
    price: 35,
    is_free: false,
    location: 'Oak Harbor',
    description: '3/2mm O\'Neill wetsuit, kids size 10. Good condition, outgrown.',
    emoji: '🏄',
    seller_name: 'Island Seller',
  },
];

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (dryRun) {
    console.log('DRY RUN — would insert:');
    SEED_LISTINGS.forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.title} — ${l.is_free ? 'Free' : `$${l.price}`} (${l.location})`);
    });
    console.log(`\nTotal: ${SEED_LISTINGS.length} listings`);
    return;
  }

  const supabase = createClient(url, key);

  const rows = SEED_LISTINGS.map(l => ({
    ...l,
    status: 'approved',
    sold: false,
    images: [],
    contact_method: 'message',
  }));

  const { data, error } = await supabase.from('listings').insert(rows).select('id, title');

  if (error) {
    console.error('Insert error:', error);
    process.exit(1);
  }

  console.log(`Inserted ${data.length} seed listings:`);
  data.forEach(r => console.log(`  ✓ ${r.title} (${r.id})`));
}

main();
