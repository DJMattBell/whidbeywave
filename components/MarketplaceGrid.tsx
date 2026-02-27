'use client';

import { useState } from 'react';
import { type MarketplaceListing } from '@/lib/marketplace';
import { useAuth } from '@/components/AuthProvider';
import ListingCard from '@/components/ListingCard';
import ListingDetailModal from '@/components/ListingDetailModal';

export default function MarketplaceGrid({ listings }: { listings: MarketplaceListing[] }) {
  const { user } = useAuth();
  const [selected, setSelected]   = useState<MarketplaceListing | null>(null);
  // Track listings marked sold in this session so cards grey out immediately
  const [soldIds, setSoldIds]     = useState<Set<string>>(new Set());
  // Track deleted listings so they disappear without a page reload
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  function handleMarkedSold(id: string) {
    setSoldIds(prev => new Set([...prev, id]));
  }

  function handleDeleted(id: string) {
    setRemovedIds(prev => new Set([...prev, id]));
    setSelected(null);
  }

  const visibleListings = listings.filter(l => !removedIds.has(l.id));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-16">
        {visibleListings.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            overrideSold={soldIds.has(listing.id)}
            onClick={() => setSelected(listing)}
          />
        ))}
      </div>

      {selected && (
        <ListingDetailModal
          listing={selected}
          currentUserId={user?.id ?? null}
          onClose={() => setSelected(null)}
          onMarkedSold={() => handleMarkedSold(selected.id)}
          onDeleted={() => handleDeleted(selected.id)}
        />
      )}
    </>
  );
}
