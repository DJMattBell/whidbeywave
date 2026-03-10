import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { formatPrice, timeAgo, type MarketplaceListing } from '@/lib/marketplace';
import { categoryColors } from '@/lib/data';
import ShareButton from '@/components/ShareButton';
import ListingOwnerActions from '@/components/ListingOwnerActions';

export const revalidate = 60;

async function getListing(id: string): Promise<MarketplaceListing | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('listings')
    .select('id, title, price, is_free, category, location, description, seller_name, emoji, images, sold, expires_at, created_at, user_id, contact_method')
    .eq('id', id)
    .eq('status', 'approved')
    .single();
  return (data as MarketplaceListing) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: 'Listing Not Found' };

  const price = formatPrice(listing.price, listing.is_free);
  const title = `${listing.title} — ${price} | WhidbeyWave Marketplace`;
  const description = listing.description?.slice(0, 160) ?? `${listing.title} for sale on Whidbey Island`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'WhidbeyWave',
      images: listing.images?.[0]
        ? [{ url: listing.images[0], width: 800, height: 600 }]
        : [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const priceLabel = formatPrice(listing.price, listing.is_free);
  const free = listing.is_free;
  const photos = listing.images ?? [];

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Back link */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 font-medium mb-6 transition-colors"
        >
          ← Back to marketplace
        </Link>

        {/* SOLD banner */}
        {listing.sold && (
          <div className="bg-stone-800 text-white text-sm font-bold text-center py-3 rounded-xl tracking-[0.2em] uppercase mb-6">
            SOLD — No longer available
          </div>
        )}

        {/* Photo gallery */}
        <div className={`rounded-2xl overflow-hidden mb-6 ${listing.sold ? 'grayscale opacity-60' : ''}`}>
          {photos.length > 0 ? (
            <div>
              <div className="aspect-[4/3] bg-stone-900">
                <img
                  src={photos[0]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {photos.map((src, i) => (
                    <div key={i} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-parchment-200">
                      <img
                        src={src}
                        alt={`${listing.title} — photo ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="aspect-[4/3] bg-gradient-to-br from-parchment-200 to-amber-100 flex items-center justify-center text-8xl rounded-2xl"
              aria-hidden="true"
            >
              {listing.emoji}
            </div>
          )}
        </div>

        {/* Title + Price */}
        <div className="mb-4">
          <p className={`text-3xl font-extrabold mb-2 ${free ? 'text-green-600' : 'text-stone-900'}`}>
            {priceLabel}
          </p>
          <h1
            className="text-2xl md:text-3xl text-stone-900 leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
          >
            {listing.title}
          </h1>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm items-center mb-6">
          <span className={`badge ${categoryColors[listing.category] ?? 'bg-parchment-200 text-stone-700'}`}>
            {listing.category}
          </span>
          <span className="text-stone-500 flex items-center gap-1">
            <span aria-hidden="true">📍</span>{listing.location}
          </span>
          <time dateTime={listing.created_at} className="text-stone-400" suppressHydrationWarning>
            Posted {timeAgo(listing.created_at)}
          </time>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Description</h2>
            <p className="text-base text-stone-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        {/* Seller info */}
        <div className="bg-parchment-50 rounded-xl p-5 border border-parchment-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-parchment-200 flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
              👤
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium">Listed by</p>
              <p className="text-lg text-stone-900 font-semibold">{listing.seller_name}</p>
            </div>
          </div>
          {listing.contact_method && !listing.sold && (
            <div className="mt-4 pt-4 border-t border-parchment-200">
              <p className="text-xs text-stone-500 font-medium mb-1.5">Preferred contact</p>
              {listing.contact_method.includes('@') ? (
                <a
                  href={`mailto:${listing.contact_method}`}
                  className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5"
                >
                  📧 {listing.contact_method}
                </a>
              ) : /^\+?\d[\d\s()-]{6,}$/.test(listing.contact_method) ? (
                <a
                  href={`tel:${listing.contact_method.replace(/\s/g, '')}`}
                  className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5"
                >
                  📞 {listing.contact_method}
                </a>
              ) : (
                <p className="text-sm text-stone-700">{listing.contact_method}</p>
              )}
            </div>
          )}
        </div>

        {/* Share + Owner actions */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <ShareButton
            title={`${listing.title} — WhidbeyWave Marketplace`}
            text={`${listing.emoji} ${listing.title} — ${priceLabel} on WhidbeyWave`}
          />
          <ListingOwnerActions listing={listing} />
        </div>
      </div>
    </>
  );
}
