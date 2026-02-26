import Link from 'next/link';
import { Suspense } from 'react';
import { categoryColors } from '@/lib/data';
import { createServerClient } from '@/lib/supabase';
import MarketplaceSearch from '@/components/MarketplaceSearch';
import MarketplaceLocationFilter from '@/components/MarketplaceLocationFilter';

export const revalidate = 300;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; location?: string };
}) {
  const supabase = createServerClient();

  let query = supabase
    .from('marketplace_listings')
    .select('id, title, price, category, location, description, seller_name, emoji, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.location && searchParams.location !== 'All Locations') {
    query = query.eq('location', searchParams.location);
  }

  const { data: listingsData } = await query;
  let listings = listingsData ?? [];

  // Text search client-side after fetch
  const q = searchParams.q?.trim().toLowerCase();
  if (q) {
    listings = listings.filter(
      l =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
  }

  // Fetch all approved for category/location dropdowns (unfiltered)
  const { data: allData } = await supabase
    .from('marketplace_listings')
    .select('category, location')
    .eq('status', 'approved');

  const allListings = allData ?? [];
  const allCategories = ['All', ...Array.from(new Set(allListings.map(l => l.category).filter(Boolean)))];
  const allLocations  = ['All Locations', ...Array.from(new Set(allListings.map(l => l.location).filter(Boolean)))];

  const hasFilters = !!(q || (searchParams.category && searchParams.category !== 'All') || (searchParams.location && searchParams.location !== 'All Locations'));

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-700 via-forest-700 to-sound-800 text-parchment-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-200 font-medium mb-2 tracking-wide uppercase text-sm">🛒 Things for Sale</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-parchment-50">
            Island Marketplace
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            What your neighbors are selling — crafts, gear, farm-fresh, and a little of everything else.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Search + filters bar */}
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

          <div>
            <label htmlFor="marketplace-category" className="sr-only">Filter by category</label>
            <select
              id="marketplace-category"
              defaultValue={searchParams.category ?? 'All'}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm text-stone-600 bg-white"
              disabled
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

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
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-500 border border-parchment-300 hover:border-stone-400 hover:text-stone-700 transition-colors bg-white text-center"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by category">
          {allCategories.map((cat) => {
            const isActive = cat === (searchParams.category ?? 'All');
            return (
              <Link
                key={cat}
                href={`/marketplace?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isActive
                    ? 'bg-forest-500 text-parchment-50 border-forest-500'
                    : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-stone-500 mb-6" aria-live="polite">
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
                <p className="text-stone-400 text-sm mb-5">Try adjusting your search or clearing the filters.</p>
                <Link href="/marketplace" className="btn-primary">Show all listings</Link>
              </>
            ) : (
              <>
                <p className="text-lg text-stone-700 mb-2 font-semibold">No listings yet</p>
                <p className="text-stone-400 text-sm mb-5">Be the first to post something for sale!</p>
                <Link href="/submit-listing" className="btn-primary">List Something →</Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {listings.map((listing) => (
              <article key={listing.id} className="card flex flex-col">
                {/* Emoji hero */}
                <div className="bg-gradient-to-br from-parchment-200 to-amber-100 h-40 flex items-center justify-center text-6xl rounded-t-2xl" aria-hidden="true">
                  {listing.emoji ?? '🏷️'}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`badge ${categoryColors[listing.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                      {listing.category}
                    </span>
                    <span className="text-forest-600 font-extrabold text-lg">{listing.price}</span>
                  </div>

                  <h2 className="text-stone-900 text-lg mb-2 leading-snug flex-1">
                    {listing.title}
                  </h2>

                  <p className="text-sm text-stone-600 leading-relaxed mb-4">{listing.description}</p>

                  <div className="border-t border-parchment-200 pt-3 flex items-center justify-between text-xs text-stone-400">
                    <span><span aria-hidden="true">👤</span> {listing.seller_name}</span>
                    <span><span aria-hidden="true">📍</span> {listing.location}</span>
                  </div>

                  <Link
                    href="/contact"
                    className="mt-4 w-full py-2.5 rounded-xl bg-forest-50 text-forest-700 font-semibold text-sm hover:bg-forest-100 transition-colors border border-forest-200 text-center"
                  >
                    Get in Touch
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

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
