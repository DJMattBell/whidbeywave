'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { categoryColors } from '@/lib/data';
import { timeAgo, formatPrice, daysUntilExpiry, type MarketplaceListing } from '@/lib/marketplace';
import { supabase } from '@/lib/supabase';
import MarketplaceContactButton from '@/components/MarketplaceContactButton';

// ─── Photo Carousel ───────────────────────────────────────────────────────────

function PhotoCarousel({ images, title, emoji }: { images: string[]; title: string; emoji: string }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  if (images.length === 0) {
    return (
      <div
        className="aspect-[4/3] bg-gradient-to-br from-parchment-200 to-amber-100 flex items-center justify-center text-8xl"
        aria-hidden="true"
      >
        {emoji}
      </div>
    );
  }

  function prev() { setCurrent(p => Math.max(0, p - 1)); }
  function next() { setCurrent(p => Math.min(images.length - 1, p + 1)); }

  return (
    <div
      className="relative aspect-[4/3] bg-stone-900 overflow-hidden select-none"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
      }}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="relative min-w-full h-full">
            <Image
              src={src}
              alt={`${title} — photo ${i + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 36rem"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button onClick={prev} disabled={current === 0} aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:flex w-11 h-11 items-center justify-center rounded-full bg-stone-900/60 text-white text-lg hover:bg-stone-900/80 transition-colors disabled:opacity-20">
            ‹
          </button>
          <button onClick={next} disabled={current === images.length - 1} aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex w-11 h-11 items-center justify-center rounded-full bg-stone-900/60 text-white text-lg hover:bg-stone-900/80 transition-colors disabled:opacity-20">
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Photo ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-110' : 'bg-white/40'}`} />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-stone-900/60 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type SoldState   = 'idle' | 'confirming' | 'saving' | 'error';
type RenewState  = 'idle' | 'confirming' | 'saving' | 'done';
type DeleteState = 'idle' | 'confirming' | 'deleting';

export default function ListingDetailModal({
  listing,
  currentUserId,
  onClose,
  onMarkedSold,
  onDeleted,
}: {
  listing: MarketplaceListing;
  currentUserId?: string | null;
  onClose: () => void;
  onMarkedSold?: () => void;
  onDeleted?: () => void;
}) {
  const [sold, setSold]             = useState(listing.sold);
  const [soldState, setSoldState]   = useState<SoldState>('idle');
  const [renewState, setRenewState] = useState<RenewState>('idle');
  const [deleteState, setDeleteState] = useState<DeleteState>('idle');
  const [newExpiresAt, setNewExpiresAt] = useState<string | null>(null);

  const isOwner = Boolean(currentUserId && currentUserId === listing.user_id);
  const priceLabel = formatPrice(listing.price, listing.is_free);
  const free = listing.is_free;

  // Expiry
  const effectiveExpiry = newExpiresAt ?? listing.expires_at;
  const daysLeft = daysUntilExpiry(effectiveExpiry);
  const nearExpiry = isOwner && !sold && daysLeft !== null && daysLeft <= 7;

  // Lock body scroll + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // ── Auth token helper ──

  async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  // ── Actions ──

  async function handleMarkSold() {
    if (!isOwner || soldState === 'saving') return;
    setSoldState('saving');
    try {
      const token = await getToken();
      if (!token) { setSoldState('idle'); return; }
      const res = await fetch('/api/listings/sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: listing.id }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setSold(true);
        onMarkedSold?.();
        setSoldState('idle');
      } else {
        setSoldState('error');
        setTimeout(() => setSoldState('idle'), 3000);
      }
    } catch {
      setSoldState('error');
      setTimeout(() => setSoldState('idle'), 3000);
    }
  }

  async function handleRenew() {
    if (!isOwner || renewState === 'saving') return;
    setRenewState('saving');
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/listings/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: listing.id }),
      });
      const json = await res.json();
      if (json.ok) {
        setNewExpiresAt(json.expires_at);
        setRenewState('done');
      } else {
        setRenewState('idle');
      }
    } catch {
      setRenewState('idle');
    }
  }

  async function handleDelete() {
    if (!isOwner || deleteState === 'deleting') return;
    setDeleteState('deleting');
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/listings/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: listing.id }),
      });
      if ((await res.json()).ok) {
        onDeleted?.();
        onClose();
      } else {
        setDeleteState('idle');
      }
    } catch {
      setDeleteState('idle');
    }
  }

  const now = new Date();
  const renewalTargetLabel = new Date(
    now.getTime() + 60 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={listing.title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[92dvh] sm:max-h-[88vh] flex flex-col shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-stone-900/50 text-white text-lg leading-none hover:bg-stone-900/70 transition-colors"
        >
          ×
        </button>

        {/* Photos */}
        <div className={sold ? 'grayscale opacity-60' : ''}>
          <PhotoCarousel images={listing.images ?? []} title={listing.title} emoji={listing.emoji} />
        </div>

        {/* SOLD banner */}
        {sold && (
          <div className="bg-stone-800 text-white text-xs font-bold text-center py-2 tracking-[0.2em] uppercase">
            SOLD — No longer available
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="p-5 space-y-4">

            {/* Price + title */}
            <div>
              <p className={`text-2xl font-extrabold mb-1 ${free ? 'text-green-600' : 'text-stone-900'}`}>
                {priceLabel}
              </p>
              <h2 className="text-xl text-stone-900 leading-snug">{listing.title}</h2>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm items-center">
              <span className={`badge ${categoryColors[listing.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                {listing.category}
              </span>
              <span className="text-stone-500 flex items-center gap-1">
                <span aria-hidden="true">📍</span>{listing.location}
              </span>
              <time dateTime={listing.created_at} className="text-stone-400" suppressHydrationWarning>
                {timeAgo(listing.created_at)}
              </time>
              {listing.contact_method && (
                <span className="text-stone-500 text-xs">
                  Prefers: {listing.contact_method}
                </span>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-base text-stone-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller */}
            <div className="bg-parchment-50 rounded-xl p-4 border border-parchment-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center text-xl shrink-0" aria-hidden="true">
                👤
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Listed by</p>
                <p className="text-base text-stone-900 font-semibold">{listing.seller_name}</p>
              </div>
            </div>

            {/* ── Owner actions ─────────────────────────────── */}

            {/* Expiry / Renew — owner only, within 7 days */}
            {nearExpiry && renewState !== 'done' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-amber-500 mt-0.5" aria-hidden="true">⏳</span>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {(daysLeft ?? 0) <= 0
                        ? 'This listing has expired'
                        : `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Renew to keep it active for another 60 days.
                    </p>
                  </div>
                </div>

                {renewState === 'idle' && (
                  <button
                    onClick={() => setRenewState('confirming')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Renew listing
                  </button>
                )}

                {renewState === 'confirming' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-stone-600">
                      This will extend your listing to{' '}
                      <strong>{renewalTargetLabel}</strong>.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRenew}
                        className="flex-1 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-900 transition-colors"
                      >
                        Confirm renewal
                      </button>
                      <button
                        onClick={() => setRenewState('idle')}
                        className="flex-1 py-2 rounded-xl border border-stone-300 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {renewState === 'saving' && (
                  <p className="text-center text-sm text-stone-400 py-1">Renewing…</p>
                )}
              </div>
            )}

            {renewState === 'done' && (
              <div className="rounded-xl border border-forest-200 bg-forest-50 p-4">
                <p className="text-sm font-semibold text-forest-800">Listing renewed!</p>
                <p className="text-xs text-forest-600 mt-0.5">
                  Active until{' '}
                  {new Date(newExpiresAt!).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}.
                </p>
              </div>
            )}

            {/* Mark as Sold — owner only, active listings */}
            {isOwner && !sold && (
              <>
                {soldState === 'idle' && (
                  <button
                    onClick={() => setSoldState('confirming')}
                    className="w-full py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                  >
                    Mark as Sold
                  </button>
                )}

                {soldState === 'confirming' && (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                    <p className="text-sm text-stone-700">
                      <strong>Mark this listing as sold?</strong> It will stay visible but appear greyed out with a SOLD badge.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleMarkSold}
                        className="flex-1 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-900 transition-colors"
                      >
                        Yes, mark as sold
                      </button>
                      <button
                        onClick={() => setSoldState('idle')}
                        className="flex-1 py-2 rounded-xl border border-stone-300 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {soldState === 'saving' && (
                  <p className="text-center text-sm text-stone-400 py-1">Updating…</p>
                )}

                {soldState === 'error' && (
                  <p className="text-center text-sm text-terra-600 py-1">Something went wrong — please try again.</p>
                )}
              </>
            )}

            {/* Delete Listing — owner only */}
            {isOwner && (
              <>
                {deleteState === 'idle' && (
                  <button
                    onClick={() => setDeleteState('confirming')}
                    className="w-full py-2.5 rounded-xl border border-terra-200 text-sm text-terra-500 hover:bg-terra-50 hover:border-terra-300 transition-colors"
                  >
                    Delete Listing
                  </button>
                )}

                {deleteState === 'confirming' && (
                  <div className="rounded-xl border border-terra-200 bg-terra-50 p-4 space-y-3">
                    <p className="text-sm text-stone-700">
                      <strong>Permanently delete this listing?</strong> This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-2 rounded-xl bg-terra-600 text-white text-sm font-medium hover:bg-terra-700 transition-colors"
                      >
                        Yes, delete it
                      </button>
                      <button
                        onClick={() => setDeleteState('idle')}
                        className="flex-1 py-2 rounded-xl border border-stone-300 text-stone-600 text-sm hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {deleteState === 'deleting' && (
                  <p className="text-center text-sm text-stone-400 py-1">Deleting…</p>
                )}
              </>
            )}

            {/* ── Barter info ───────────────────────────────── */}
            {listing.barter_open && !sold && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-semibold mb-0.5">Open to barter</p>
                {listing.barter_seeking && (
                  <p className="text-amber-700">{listing.barter_seeking}</p>
                )}
              </div>
            )}

            {/* ── Buyer action ───────────────────────────────── */}
            {!sold && !isOwner && (
              <div className="space-y-2">
                <MarketplaceContactButton
                  listingId={listing.id}
                  listingTitle={listing.title}
                  sellerName={listing.seller_name}
                />
                {listing.barter_open && (
                  <MarketplaceContactButton
                    listingId={listing.id}
                    listingTitle={`[Barter offer] ${listing.title}`}
                    sellerName={listing.seller_name}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
