'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdmin } from '@/lib/useAdmin';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

type Listing = {
  id: string;
  title: string;
  price: number | null;
  is_free: boolean;
  category: string;
  location: string;
  description: string | null;
  seller_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_method: string | null;
  emoji: string;
  images: string[];
  sold: boolean;
  expires_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800 border border-amber-200',
  approved: 'bg-forest-100 text-forest-800 border border-forest-200',
  rejected: 'bg-terra-50 text-terra-700 border border-terra-200',
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function AdminListingsPage() {
  const { user, isAdmin, loading } = useAdmin();
  const [authOpen, setAuthOpen]     = useState(false);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filter, setFilter]         = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [fetching, setFetching]     = useState(false);
  const [acting, setActing]         = useState<Record<string, boolean>>({});
  const [expanded, setExpanded]     = useState<Record<string, boolean>>({});

  // Always load all listings — filter client-side so counts stay accurate on all tabs
  const loadListings = useCallback(async () => {
    setFetching(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    setAllListings((data ?? []) as Listing[]);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadListings();
  }, [isAdmin, loadListings]);

  async function moderate(id: string, action: 'approved' | 'rejected') {
    setActing(p => ({ ...p, [id]: true }));
    try {
      const token = await getToken();
      await fetch('/api/listings/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, action }),
      });
      await loadListings();
    } finally {
      setActing(p => ({ ...p, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌊</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl text-stone-800 mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
              Admin access only
            </h1>
            <p className="text-stone-500 mb-5 text-sm">You need to be signed in as an admin.</p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary">Sign in</button>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🌧️</div>
          <h1 className="text-2xl text-stone-800 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
            Not authorized
          </h1>
          <p className="text-stone-500 text-sm">This page is restricted to site administrators.</p>
        </div>
      </div>
    );
  }

  // Counts always from the full dataset so all tabs show correct numbers
  const counts = {
    pending:  allListings.filter(l => l.status === 'pending').length,
    approved: allListings.filter(l => l.status === 'approved').length,
    rejected: allListings.filter(l => l.status === 'rejected').length,
  };

  // Client-side filter for display
  const displayed = filter === 'all'
    ? allListings
    : allListings.filter(l => l.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🛒</span>
          <h1 className="text-3xl text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
            Marketplace Listings
          </h1>
        </div>
        <p className="text-stone-500 text-sm">Signed in as {user.email}</p>
        <div className="mt-3 flex gap-4 text-sm flex-wrap">
          <Link href="/admin/events"    className="text-forest-600 hover:text-forest-800 font-medium">← Events</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/news"      className="text-forest-600 hover:text-forest-800 font-medium">News Posts</Link>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400 font-medium">Marketplace</span>
          <span className="text-stone-300">|</span>
          <Link href="/admin/feedback"  className="text-forest-600 hover:text-forest-800 font-medium">Feedback →</Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {([
          { key: 'pending',  label: `Pending (${counts.pending})`   },
          { key: 'approved', label: `Approved (${counts.approved})` },
          { key: 'rejected', label: `Rejected (${counts.rejected})` },
          { key: 'all',      label: `All (${allListings.length})`   },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === key
                ? 'bg-forest-500 text-parchment-50 border-forest-500'
                : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400'
            }`}>
            {label}
          </button>
        ))}
        <button onClick={loadListings}
          className="ml-auto px-3 py-1.5 rounded-full text-xs text-stone-400 border border-parchment-300 hover:border-stone-400 transition-colors">
          {fetching ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Listings list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
          <div className="text-4xl mb-3">🌾</div>
          <p className="text-stone-500 text-sm">
            {fetching ? 'Loading…' : `No ${filter === 'all' ? '' : filter} listings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(listing => {
            const isExpanded = expanded[listing.id] ?? (listing.status === 'pending');
            return (
              <div key={listing.id} className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [listing.id]: !isExpanded }))}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-parchment-100 transition-colors"
                >
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[listing.status]}`}>
                    {listing.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate"
                       style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {listing.emoji} {listing.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {listing.is_free ? 'Free' : listing.price != null ? `$${listing.price}` : 'Contact for price'}
                      {' · '}{listing.category}{' · '}{listing.location}{' · '}submitted by {listing.seller_name}
                    </p>
                  </div>
                  <span className="text-stone-400 text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-parchment-200 p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-stone-400">Title</span><p className="text-stone-800 font-medium">{listing.title}</p></div>
                      <div><span className="text-stone-400">Price</span><p className="text-stone-800 font-medium">{listing.is_free ? 'Free' : listing.price != null ? `$${listing.price}` : 'Contact for price'}</p></div>
                      <div><span className="text-stone-400">Category</span><p className="text-stone-800 font-medium">{listing.category}</p></div>
                      <div><span className="text-stone-400">Location</span><p className="text-stone-800 font-medium">{listing.location}</p></div>
                      <div><span className="text-stone-400">Seller</span><p className="text-stone-800 font-medium">{listing.seller_name}</p></div>
                      <div><span className="text-stone-400">Email</span><p className="text-stone-800 font-medium">{listing.contact_email}</p></div>
                      {listing.contact_phone && (
                        <div><span className="text-stone-400">Phone</span><p className="text-stone-800 font-medium">{listing.contact_phone}</p></div>
                      )}
                      {listing.contact_method && (
                        <div><span className="text-stone-400">Preferred contact</span><p className="text-stone-800 font-medium">{listing.contact_method}</p></div>
                      )}
                      <div><span className="text-stone-400">Submitted</span><p className="text-stone-800 font-medium">{fmt(listing.created_at)}</p></div>
                      <div><span className="text-stone-400">Sold</span><p className={`font-medium ${listing.sold ? 'text-stone-600' : 'text-forest-700'}`}>{listing.sold ? 'Yes' : 'No'}</p></div>
                      {listing.expires_at && (
                        <div><span className="text-stone-400">Expires</span><p className="text-stone-800 font-medium">{fmt(listing.expires_at)}</p></div>
                      )}
                    </div>

                    {listing.images?.length > 0 && (
                      <div>
                        <p className="text-xs text-stone-400 mb-2">Photos ({listing.images.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {listing.images.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <Image src={url} alt={`Photo ${i + 1}`} width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-parchment-200 hover:opacity-80 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {listing.description && (
                      <div>
                        <p className="text-xs text-stone-400 mb-1">Description</p>
                        <p className="text-sm text-stone-700 leading-relaxed bg-white rounded-xl border border-parchment-200 p-3">
                          {listing.description}
                        </p>
                      </div>
                    )}

                    {/* Action buttons — available for any status so admin can correct mistakes */}
                    <div className="border-t border-parchment-200 pt-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => moderate(listing.id, 'approved')}
                          disabled={acting[listing.id] || listing.status === 'approved'}
                          className="btn-primary py-2 px-5 text-sm disabled:opacity-40"
                        >
                          {acting[listing.id] ? 'Saving…' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => moderate(listing.id, 'rejected')}
                          disabled={acting[listing.id] || listing.status === 'rejected'}
                          className="px-5 py-2 rounded-xl text-sm font-medium bg-terra-50 text-terra-700 border border-terra-200 hover:bg-terra-100 transition-colors disabled:opacity-40"
                        >
                          {acting[listing.id] ? 'Saving…' : '✕ Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
