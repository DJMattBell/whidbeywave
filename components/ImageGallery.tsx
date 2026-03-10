'use client';

import { useState, useRef } from 'react';

interface Props {
  photos: string[];
  alt: string;
}

export default function ImageGallery({ photos, alt }: Props) {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (photos.length === 0) return null;

  function prev() {
    setActiveIndex(i => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setActiveIndex(i => (i + 1) % photos.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  const activeSrc = photos[activeIndex];

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[4/3] bg-stone-900 overflow-hidden cursor-zoom-in"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setLightboxOpen(true)}
        role="button"
        aria-label="Tap to enlarge"
      >
        <img
          src={activeSrc}
          alt={`${alt} — photo ${activeIndex + 1} of ${photos.length}`}
          className="w-full h-full object-contain"
        />

        {/* Swipe arrows — desktop only */}
        {photos.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-stone-900/60 text-white hover:bg-stone-900/80 transition-colors text-lg"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-stone-900/60 text-white hover:bg-stone-900/80 transition-colors text-lg"
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        {/* Counter pill */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-stone-900/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {activeIndex + 1} / {photos.length}
          </div>
        )}

        {/* Enlarge hint */}
        <div className="absolute top-2 right-2 bg-stone-900/50 text-white text-[10px] px-1.5 py-0.5 rounded-full pointer-events-none">
          🔍
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex
                  ? 'border-forest-500'
                  : 'border-parchment-200 hover:border-parchment-400'
              }`}
              aria-label={`Photo ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <img
                src={src}
                alt={`${alt} — thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${activeIndex + 1} of ${photos.length}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-xl"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            ×
          </button>

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-2xl"
                onClick={e => { e.stopPropagation(); prev(); }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-2xl"
                onClick={e => { e.stopPropagation(); next(); }}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={activeSrc}
            alt={`${alt} — photo ${activeIndex + 1} of ${photos.length}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          {/* Counter */}
          {photos.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {activeIndex + 1} / {photos.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
