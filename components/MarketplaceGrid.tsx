'use client';

import { useRouter } from 'next/navigation';
import { type MarketplaceListing } from '@/lib/marketplace';
import ListingCard from '@/components/ListingCard';

export default function MarketplaceGrid({ listings }: { listings: MarketplaceListing[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onClick={() => router.push(`/marketplace/${listing.id}`)}
        />
      ))}
    </div>
  );
}
