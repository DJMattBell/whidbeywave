import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase';
import { type MarketplaceListing, MARKETPLACE_CATEGORIES as CATEGORIES } from '@/lib/marketplace';
import MarketplaceSearch from '@/components/MarketplaceSearch';
import MarketplaceLocationFilter from '@/components/MarketplaceLocationFilter';
import MarketplaceCategoryFilter from '@/components/MarketplaceCategoryFilter';
import MarketplaceGrid from '@/components/MarketplaceGrid';
import ListingAlertSubscription from '@/components/ListingAlertSubscription';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Island Marketplace — Buy & Sell on Whidbey Island',
  description: 'Buy, sell, and trade locally on Whidbey Island. Find furniture, tools, clothing, farm goods, and free stuff from your neighbors.',
  openGraph: {
    title: 'Island Marketplace — Buy & Sell on Whidbey Island',
    description: 'Buy, sell, and trade locally on Whidbey Island.',
    siteName: 'WhidbeyWave',
    images: [{ url: `/api/og?title=${encodeURIComponent('Island Marketplace')}&subtitle=${encodeURIComponent('Buy & Sell on Whidbey Island')}`, width: 1200, height: 630 }],
  },
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
  const sp = await searchParams;
  const supabase = createServerClient();

  const now = new Date().toISOString();

  let query = supabase
    .from('listings')
    .select('id, title, price, is_free, category, location, description, seller_name, emoji, images, sold, expires_at, created_at, user_id, contact_method')
    .eq('status', 'approved')
    // Filter out expired listings; null expires_at means no expiry set
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  if (sp.category && sp.category !== 'All') {
    query = query.eq('category', sp.category);
  }
  if (sp.location && sp.location !== 'All Locations') {
    query = query.eq('location', sp.location);
  }

  // Full-text search via Supabase textSearch (handles special characters safely)
  const q = sp.q?.trim();
  if (q) {
    query = query.textSearch('title', q, { type: 'websearch', config: 'english' });
  }

  const { data: listingsData } = await query;
  const listings = (listingsData ?? []) as MarketplaceListing[];

  // Locations for dropdown (categories are predefined)
  const { data: locData } = await supabase
    .from('listings')
    .select('location')
    .eq('status', 'approved')
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  const allLocations = [
    'All Locations',
    ...Array.from(new Set((locData ?? []).map(l => l.location).filter(Boolean))),
  ];

  const hasFilters = !!(
    q ||
    (sp.category && sp.category !== 'All') ||
    (sp.location && sp.location !== 'All Locations')
  );

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-700 via-forest-700 to-sound-800 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-200 font-medium mb-2 tracking-wide uppercase text-sm">🛒 Things for Sale</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50">
            Island Marketplace
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            What your neighbors are selling — crafts, gear, farm-fresh, and a little of everything else.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">

        {/* Category pills — scrollable on mobile, wrapping on desktop */}
        <div className="mb-5">
          <Suspense fallback={
            <div
              className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {CATEGORIES.map(cat => (
                <div key={cat} className="shrink-0 px-4 py-2.5 rounded-full text-sm bg-parchment-100 border border-parchment-300 text-stone-400 min-h-[44px] flex items-center">
                  {cat}
                </div>
              ))}
            </div>
          }>
            <MarketplaceCategoryFilter current={sp.category} />
          </Suspense>
        </div>

        {/* Search + location bar */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-xl shadow-warm-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <Suspense fallback={
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">🔍</span>
              <input
                type="search"
                defaultValue={sp.q}
                placeholder="Search listings…"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-parchment-200 text-sm bg-white text-stone-700 placeholder:text-stone-400"
                readOnly
              />
            </div>
          }>
            <MarketplaceSearch defaultValue={sp.q} />
          </Suspense>

          <Suspense fallback={
            <select className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-parchment-200 text-sm text-stone-600 bg-white" disabled>
              {allLocations.map(loc => <option key={loc}>{loc}</option>)}
            </select>
          }>
            <MarketplaceLocationFilter locations={allLocations} current={sp.location ?? 'All Locations'} />
          </Suspense>

          {hasFilters && (
            <Link
              href="/marketplace"
              className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 border border-parchment-200 hover:border-stone-400 hover:text-stone-700 transition-colors bg-white text-center"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-stone-500 mb-4" aria-live="polite">
          {hasFilters ? (
            <><strong className="text-stone-800">{listings.length}</strong> listings match your search</>
          ) : (
            <><strong className="text-stone-800">{listings.length}</strong> things for sale right now</>
          )}
        </p>

        {/* Listings grid */}
        {listings.length === 0 ? (
          <div className="empty-state mb-16">
            <div className="empty-state-icon text-5xl">🌾</div>
            {hasFilters ? (
              <>
                <p className="empty-state-title">Nothing matching those filters</p>
                <p className="empty-state-text">Try adjusting your search or clearing the filters.</p>
                <Link href="/marketplace" className="btn-primary">Show all listings</Link>
              </>
            ) : (
              <>
                <p className="empty-state-title">Be the first to post something!</p>
                <p className="empty-state-text">
                  WhidbeyWave Marketplace is brand new. Help get it started by posting
                  something you&apos;d like to sell, trade, or give away.
                </p>
                <Link href="/submit-listing" className="btn-primary">
                  + Post a Free Listing
                </Link>
              </>
            )}
          </div>
        ) : (
          <MarketplaceGrid listings={listings} />
        )}

        {/* Alert subscription */}
        <div className="mb-6">
          <ListingAlertSubscription />
        </div>

        {/* Post listing CTA */}
        <div className="bg-gradient-to-br from-parchment-100 to-amber-50 rounded-xl p-8 border border-parchment-200 flex flex-col md:flex-row items-center gap-6">
          <div className="text-5xl" aria-hidden="true">🏷️</div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl text-stone-900 mb-1">
              Got something to pass along?
            </h3>
            <p className="text-stone-600 leading-relaxed">
              List it here and let your neighbors know. No fees, no fuss — just island folks helping each other out.
            </p>
          </div>
          <Link href="/submit-listing" className="btn-primary shrink-0">
            List It Here
          </Link>
        </div>

      </div>
    </>
  );
}
