'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { listings, formatShortDate, categoryColors } from '@/lib/data';
import { supabase, isConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

const allCategories = ['All', ...Array.from(new Set(listings.map((l) => l.category)))];
const allLocations  = ['All Locations', ...Array.from(new Set(listings.map((l) => l.location)))];

export default function MarketplacePage() {
  const [search, setSearch]           = useState('');
  const [activeCategory, setCategory] = useState('All');
  const [activeLocation, setLocation] = useState('All Locations');
  const [soldIds, setSoldIds]         = useState<Set<string>>(new Set());
  const [markingId, setMarkingId]     = useState<string | null>(null);
  const { user }                      = useAuth();

  useEffect(() => {
    if (!isConfigured) return;
    supabase
      .from('sold_listings')
      .select('listing_id')
      .then(({ data }) => setSoldIds(new Set(data?.map(r => r.listing_id) ?? [])));
  }, []);

  async function markSold(listingId: string) {
    if (!user || !isConfigured) return;
    setMarkingId(listingId);
    const { error } = await supabase.from('sold_listings').insert({ listing_id: listingId });
    if (!error) setSoldIds(prev => new Set([...prev, listingId]));
    setMarkingId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter(l => {
      const matchSearch   = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      const matchCategory = activeCategory === 'All' || l.category === activeCategory;
      const matchLocation = activeLocation === 'All Locations' || l.location === activeLocation;
      return matchSearch && matchCategory && matchLocation;
    });
  }, [search, activeCategory, activeLocation]);

  function clearFilters() {
    setSearch('');
    setCategory('All');
    setLocation('All Locations');
  }

  const hasFilters = search.trim() || activeCategory !== 'All' || activeLocation !== 'All Locations';

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

        {/* Search bar */}
        <div className="bg-parchment-50 border border-parchment-300 rounded-2xl shadow-warm-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">🔍</span>
            <label htmlFor="marketplace-search" className="sr-only">Search listings</label>
            <input
              id="marketplace-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search listings…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm bg-white text-stone-700 placeholder:text-stone-400"
            />
          </div>
          <div>
            <label htmlFor="marketplace-category" className="sr-only">Filter by category</label>
            <select
              id="marketplace-category"
              value={activeCategory}
              onChange={e => setCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm text-stone-600 bg-white"
            >
              {allCategories.map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="marketplace-location" className="sr-only">Filter by location</label>
            <select
              id="marketplace-location"
              value={activeLocation}
              onChange={e => setLocation(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm text-stone-600 bg-white"
            >
              {allLocations.map(loc => <option key={loc}>{loc}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-500 border border-parchment-300 hover:border-stone-400 hover:text-stone-700 transition-colors bg-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by category">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-forest-500 text-parchment-50 border-forest-500'
                  : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-stone-500 mb-6" aria-live="polite">
          {hasFilters ? (
            <>
              <strong className="text-stone-800">{filtered.length}</strong> of{' '}
              {listings.length} listings match your filters
            </>
          ) : (
            <><strong className="text-stone-800">{listings.length}</strong> things for sale right now</>
          )}
        </p>

        {/* Listings grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300 mb-16">
            <div className="text-5xl mb-4" aria-hidden="true">🌾</div>
            <p className="text-lg text-stone-700 mb-2 font-semibold">Nothing matching those filters</p>
            <p className="text-stone-400 text-sm mb-5">Try adjusting your search or clearing the filters.</p>
            <button onClick={clearFilters} className="btn-primary">Show all listings</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filtered.map((listing) => {
              const sold = soldIds.has(listing.id);
              return (
              <article key={listing.id} className={`card flex flex-col relative ${sold ? 'opacity-70' : ''}`}>
                {/* SOLD badge */}
                {sold && (
                  <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full tracking-wide shadow">
                    SOLD
                  </div>
                )}
                {/* Emoji hero */}
                <div className="bg-gradient-to-br from-parchment-200 to-amber-100 h-40 flex items-center justify-center text-6xl rounded-t-2xl" aria-hidden="true">
                  {listing.emoji}
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
                    <span><span aria-hidden="true">👤</span> {listing.seller}</span>
                    <span><span aria-hidden="true">📍</span> {listing.location}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Listed {formatShortDate(listing.postedAt)}</p>

                  {!sold && (
                    <Link
                      href="/contact"
                      className="mt-4 w-full py-2.5 rounded-xl bg-forest-50 text-forest-700 font-semibold text-sm hover:bg-forest-100 transition-colors border border-forest-200 text-center"
                    >
                      Get in Touch
                    </Link>
                  )}
                  {user && !sold && (
                    <button
                      onClick={() => markSold(listing.id)}
                      disabled={markingId === listing.id}
                      className="mt-2 w-full py-2 rounded-xl bg-stone-50 text-stone-400 font-medium text-xs hover:bg-red-50 hover:text-red-600 transition-colors border border-stone-200 hover:border-red-200 disabled:opacity-50"
                    >
                      {markingId === listing.id ? 'Marking…' : 'Mark as Sold'}
                    </button>
                  )}
                  {sold && (
                    <p className="mt-4 text-center text-sm text-stone-400 font-medium">This item has sold.</p>
                  )}
                </div>
              </article>
              );
            })}
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
