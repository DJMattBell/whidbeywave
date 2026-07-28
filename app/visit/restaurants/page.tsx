import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient, isConfigured } from '@/lib/supabase';
import type { Recommendation } from '@/lib/db-types';
import RestaurantsFilter from '@/components/RestaurantsFilter';

export const revalidate = 3600; // 60 minutes

export const metadata: Metadata = {
  title: 'Whidbey Island Restaurants — Local Recommendations',
  description:
    'The best restaurants, cafes, and places to eat on Whidbey Island, WA — recommended by locals. Penn Cove mussels, waterfront dining, farm-to-table, and more.',
  keywords:
    'whidbey island restaurants, langley restaurants, coupeville restaurants, oak harbor restaurants, whidbey island dining',
  openGraph: {
    title: 'Whidbey Island Restaurants — Local Recommendations',
    description: 'The best places to eat on Whidbey Island, recommended by locals.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whidbey Island Restaurants — Local Recommendations',
    description: 'The best places to eat on Whidbey Island, recommended by locals.',
    images: ['/og-default.png'],
  },
};

async function getRestaurantRecs(): Promise<Recommendation[]> {
  if (!isConfigured) return [];

  const { data } = await createServerClient()
    .from('recommendations')
    .select('*')
    .eq('category', 'Restaurants & Cafes')
    .order('average_rating', { ascending: false });

  return (data ?? []) as Recommendation[];
}

// ── Static featured spots ─────────────────────────────────────────────────────

const FEATURED = [
  {
    name:    'Penn Cove Shellfish',
    town:    'Coupeville',
    emoji:   '🦪',
    note:    'The mussels here are grown in the bay you can see from the window. Order them steamed with white wine and don\'t skip the bread for the broth. Worth planning a meal around.',
    tip:     'Go at lunch — it\'s quieter and the view is just as good.',
    bg:      'bg-sound-50 border-sound-200',
  },
  {
    name:    'Jupiter Coffee',
    town:    'Freeland',
    emoji:   '☕',
    note:    'Fresh Caffe Vita espresso and some of the best scones on the island — six to eight varieties baked daily, from cinnamon swirl to raspberry almond. Marine-blue walls, a Jupiter mural, and a back room with a fireplace.',
    tip:     'The scones sell out early. You can also order frozen take-and-bake scones to bake at home.',
    bg:      'bg-amber-50 border-amber-200',
  },
  {
    name:    'Salty Sea Coffee',
    town:    'Langley',
    emoji:   '☕',
    note:    'Right on Anthes Ave in the heart of Langley. They roast their own beans fresh each week on-island and also run a modern soda shop with nostalgic sodas, loaded teas, and energy drinks.',
    tip:     'They have a drive-thru on Howard Rd if you\'re in a hurry.',
    bg:      'bg-sound-50 border-sound-200',
  },
  {
    name:    'Orchard Kitchen',
    town:    'Langley',
    emoji:   '🌾',
    note:    'Farm-to-table dinners sourced almost entirely from the island and surrounding region. Reservations essential. Worth planning your trip around.',
    tip:     'Book weeks ahead in summer — they fill up fast.',
    bg:      'bg-forest-50 border-forest-200',
  },
  {
    name:    'Toby\'s Tavern',
    town:    'Coupeville',
    emoji:   '🍻',
    note:    'The beloved waterfront tavern on Coupeville Wharf. Penn Cove mussels, burgers, local beer, and a deck over the water. Cash-register charm and locals at every table.',
    tip:     'Sit outside if the weather allows — the wharf view is the whole point.',
    bg:      'bg-parchment-50 border-parchment-300',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RestaurantsPage() {
  const liveRecs = await getRestaurantRecs();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-stone-500 justify-center">
              <li><Link href="/visit" className="hover:text-forest-600 transition-colors">Visit Whidbey</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-stone-700">Restaurants</li>
            </ol>
          </nav>
          <p className="text-forest-600 font-medium mb-2 tracking-wide uppercase text-sm">Where to Eat</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Restaurants & Cafes on Whidbey Island
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            Neighbor-recommended places to eat — no chains, no sponsored posts, just locals telling you where they actually go.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* ── Live recommendations ───────────────────────────────────── */}
        {liveRecs.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-stone-800 mb-2">
              Neighbor Recommendations
            </h2>
            <p className="text-stone-500 text-sm mb-6">Submitted and reviewed by Whidbey Island locals.</p>
            <RestaurantsFilter recs={liveRecs} />
          </section>
        )}

        {/* ── Featured spots (always shown) ──────────────────────────── */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-2">
            Local Favorites
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            A few places worth going out of your way for — written as genuine recommendations, not marketing copy.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURED.map(({ name, town, emoji, note, tip, bg }) => (
              <div key={name} className={`rounded-xl border p-5 ${bg}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{emoji}</span>
                  <div>
                    <h3 className="font-bold text-stone-800 leading-snug">
                      {name}
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">📍 {town}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-3">{note}</p>
                <p className="text-xs text-stone-500 italic">💡 {tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────── */}
        <div className="bg-parchment-100 rounded-xl border border-parchment-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-stone-800 mb-1">Know a great spot we&apos;re missing?</p>
            <p className="text-sm text-stone-500">Add it to Local Picks — your neighbors will thank you.</p>
          </div>
          <Link href="/recommendations" className="btn-primary shrink-0">
            Add to Local Picks →
          </Link>
        </div>

        {/* Back to Visitor Guide */}
        <div className="text-center pb-2">
          <Link href="/visit" className="text-sm text-forest-600 hover:text-forest-800 font-medium underline underline-offset-2 transition-colors">
            ← Back to Visitor Guide
          </Link>
        </div>

      </div>
    </>
  );
}
