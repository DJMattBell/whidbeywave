'use client';

import { useRouter } from 'next/navigation';
import { type MarketplaceListing } from '@/lib/marketplace';
import ListingCard from '@/components/ListingCard';

export default function MarketplaceGrid({ listings }: { listings: MarketplaceListing[] }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-16">
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
