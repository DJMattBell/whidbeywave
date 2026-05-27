'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Recommendation } from '@/lib/db-types';

const TOWNS = ['All', 'Langley', 'Coupeville', 'Oak Harbor', 'Freeland'];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= Math.round(rating) ? 'text-amber-400' : 'text-stone-300'}>★</span>
      ))}
    </span>
  );
}

export default function RestaurantsFilter({ recs }: { recs: Recommendation[] }) {
  const [town, setTown] = useState('All');

  const filtered = town === 'All'
    ? recs
    : recs.filter(r => r.town?.toLowerCase().includes(town.toLowerCase()));

  return (
    <div>
      {/* Town filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TOWNS.map(t => (
          <button
            key={t}
            onClick={() => setTown(t)}
            className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium border transition-colors ${
              town === t
                ? 'bg-forest-500 text-parchment-50 border-forest-500'
                : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p className="empty-state-title">No listings match your search</p>
          <p className="empty-state-text">Try different keywords or browse all categories.</p>
          <Link href="/recommendations/" className="btn-primary">Browse All</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(rec => (
            <div key={rec.id} className="bg-parchment-50 border border-parchment-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-stone-800 leading-snug">
                    {rec.name}
                  </h3>
                  {rec.town && (
                    <p className="text-xs text-stone-600 mt-0.5">📍 {rec.town}</p>
                  )}
                </div>
                {rec.average_rating > 0 && (
                  <div className="text-right shrink-0">
                    <Stars rating={rec.average_rating} />
                    <p className="text-xs text-stone-600">{rec.review_count} review{rec.review_count !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
              {rec.description && (
                <p className="text-sm text-stone-600 leading-relaxed mb-3">{rec.description}</p>
              )}
              {rec.website && (
                <a
                  href={rec.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-forest-600 hover:text-forest-800 underline underline-offset-2"
                >
                  Visit website →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
