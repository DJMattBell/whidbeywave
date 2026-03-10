'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { type MarketplaceListing } from '@/lib/marketplace';
import MarketplaceContactButton from '@/components/MarketplaceContactButton';

export default function ListingOwnerActions({ listing }: { listing: MarketplaceListing }) {
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = Boolean(user && user.id === listing.user_id);

  const [soldState, setSoldState] = useState<'idle' | 'confirming' | 'saving'>('idle');
  const [sold, setSold] = useState(listing.sold);

  async function handleMarkSold() {
    if (soldState === 'saving') return;
    setSoldState('saving');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/listings/sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: listing.id }),
      });
      if ((await res.json()).ok) {
        setSold(true);
        router.refresh();
      }
    } finally {
      setSoldState('idle');
    }
  }

  if (sold && !listing.sold) {
    return (
      <div className="bg-stone-100 rounded-xl px-4 py-2 text-sm text-stone-600 font-medium">
        Marked as sold
      </div>
    );
  }

  if (isOwner && !listing.sold) {
    return (
      <div className="flex gap-2">
        {soldState === 'idle' && (
          <button
            onClick={() => setSoldState('confirming')}
            className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Mark as Sold
          </button>
        )}
        {soldState === 'confirming' && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkSold}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-900 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setSoldState('idle')}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        {soldState === 'saving' && (
          <span className="text-sm text-stone-400 py-2">Updating…</span>
        )}
      </div>
    );
  }

  if (!listing.sold && !isOwner) {
    return (
      <MarketplaceContactButton
        listingId={listing.id}
        listingTitle={listing.title}
        sellerName={listing.seller_name}
      />
    );
  }

  return null;
}
