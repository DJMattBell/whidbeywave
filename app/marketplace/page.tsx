import Link from 'next/link';
import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase';
import { type MarketplaceListing } from '@/lib/marketplace';
import MarketplaceSearch from '@/components/MarketplaceSearch';
import MarketplaceLocationFilter from '@/components/MarketplaceLocationFilter';
import MarketplaceCategoryFilter, { CATEGORIES } from '@/components/MarketplaceCategoryFilter';
import MarketplaceGrid from '@/components/MarketplaceGrid';
import ListingAlertSubscription from '@/components/ListingAlertSubscription';

export const revalidate = 60;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; location?: string };
}) {
  const supabase = createServerClient();

  const now = new Date().toISOString();

  let query = supabase
    .from('listings')
    .select('id, title, price, is_free, category, location, description, seller_name, emoji, images, sold, expires_at, created_at, user_id, contact_method')
    .eq('status', 'approved')
    // Filter out expired listings; null expires_at means no expiry set
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });

  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.location && searchParams.location !== 'All Locations') {
    query = query.eq('location', searchParams.location);
  }

  // Full-text search via Supabase wfts (uses GIN indexes on title + description)
  const q = searchParams.q?.trim();
  if (q) {
    const ftsQ = q.replace(/[,()]/g, ' ').trim();
    query = query.or(`title.wfts(english).${ftsQ},description.wfts(english).${ftsQ}`);
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
    (searchParams.category && searchParams.category !== 'All') ||
    (searchParams.location && searchParams.location !== 'All Locations')
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
            <MarketplaceCategoryFilter current={searchParams.category} />
          </Suspense>
        </div>

        {/* Search + location bar */}
        <div className="bg-parchment-50 border border-parchment-300 rounded-2xl shadow-warm-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <Suspense fallback={
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">🔍</span>
              <input
                type="search"
                defaultValue={searchParams.q}
                placeholder="Search listings…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-parchment-300 text-sm bg-white text-stone-700 placeholder:text-stone-400"
                readOnly
              />
            </div>
          }>
            <MarketplaceSearch defaultValue={searchParams.q} />
          </Suspense>

          <Suspense fallback={
            <select className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-parchment-300 text-sm text-stone-600 bg-white" disabled>
              {allLocations.map(loc => <option key={loc}>{loc}</option>)}
            </select>
          }>
            <MarketplaceLocationFilter locations={allLocations} current={searchParams.location ?? 'All Locations'} />
          </Suspense>

          {hasFilters && (
            <Link
              href="/marketplace"
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 border border-parchment-300 hover:border-stone-400 hover:text-stone-700 transition-colors bg-white text-center"
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
          <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300 mb-16">
            <div className="text-5xl mb-4" aria-hidden="true">🌾</div>
            {hasFilters ? (
              <>
                <p className="text-lg text-stone-700 mb-2 font-semibold">Nothing matching those filters</p>
                <p className="text-stone-600 text-sm mb-5">Try adjusting your search or clearing the filters.</p>
                <Link href="/marketplace" className="btn-primary">Show all listings</Link>
              </>
            ) : (
              <>
                <p className="text-lg text-stone-700 mb-2 font-semibold">No listings yet</p>
                <p className="text-stone-600 text-sm mb-5">Be the first to post something for sale!</p>
                <Link href="/submit-listing" className="btn-primary">List Something →</Link>
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
        <div className="bg-gradient-to-br from-parchment-100 to-amber-50 rounded-2xl p-8 border border-parchment-300 flex flex-col md:flex-row items-center gap-6">
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
