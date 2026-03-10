'use client';

import { categoryColors } from '@/lib/data';
import { timeAgo, formatPrice, type MarketplaceListing } from '@/lib/marketplace';
import MarketplaceContactButton from '@/components/MarketplaceContactButton';

export default function ListingCard({
  listing,
  overrideSold = false,
  onClick,
}: {
  listing: MarketplaceListing;
  overrideSold?: boolean;
  onClick: () => void;
}) {
  const sold = listing.sold || overrideSold;
  const free = listing.is_free;
  const priceLabel = formatPrice(listing.price, listing.is_free);
  const photo = listing.images?.[0];
  const photoCount = listing.images?.length ?? 0;

  return (
    <article
      className={`group cursor-pointer rounded-2xl overflow-hidden border bg-white transition-all duration-200 ${
        sold
          ? 'border-stone-200 opacity-60 grayscale'
          : 'border-parchment-200 hover:border-parchment-300 hover:shadow-warm'
      }`}
      onClick={onClick}
    >
      {/* Photo area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-parchment-200 to-amber-100">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${!sold ? 'group-hover:scale-105' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" aria-hidden="true">
            {listing.emoji}
          </div>
        )}

        {/* SOLD ribbon */}
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-stone-900/80 text-white font-bold text-sm px-4 py-1.5 rounded tracking-[0.15em] uppercase rotate-[-3deg] shadow-lg">
              SOLD
            </span>
          </div>
        )}

        {/* Multiple photos indicator */}
        {photoCount > 1 && !sold && (
          <div className="absolute top-2 right-2 bg-stone-900/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <span aria-hidden="true">⊞</span> {photoCount}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[listing.category] ?? 'bg-stone-100 text-stone-700'}`}>
            {listing.category}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <div className={`font-bold text-base leading-tight mb-1 ${free ? 'text-green-600' : 'text-stone-900'}`}>
          {priceLabel}
        </div>

        <h3 className="text-sm text-stone-700 leading-snug line-clamp-2 mb-2.5">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span className="truncate">{listing.location}</span>
          <time
            dateTime={listing.created_at}
            className="shrink-0 ml-2"
            suppressHydrationWarning
          >
            {timeAgo(listing.created_at)}
          </time>
        </div>

        {!sold && (
          <div onClick={e => e.stopPropagation()}>
            <MarketplaceContactButton
              listingId={listing.id}
              listingTitle={listing.title}
              sellerName={listing.seller_name ?? 'Seller'}
            />
          </div>
        )}
      </div>
    </article>
  );
}
