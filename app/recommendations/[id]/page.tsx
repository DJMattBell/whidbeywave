import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import type { Recommendation, Review } from '@/lib/db-types';
import type { Metadata } from 'next';
import { Star, MapPin, Phone, Globe, Users } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerClient();
  const { data } = await supabase.from('recommendations').select('name, town, category').eq('id', id).single();
  if (!data) return { title: 'Not Found' };
  return {
    title: `${data.name} — Recommended by Whidbey Neighbors`,
    description: `See what Whidbey Island locals say about ${data.name} in ${data.town ?? 'Whidbey Island'}.`,
  };
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function RecommendationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: rec } = await supabase
    .from('recommendations')
    .select('*')
    .eq('id', id)
    .single();

  if (!rec) notFound();

  const recommendation = rec as Recommendation;

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('recommendation_id', id)
    .order('created_at', { ascending: false });

  const reviews = (reviewsData ?? []) as Review[];

  // Unique recommenders
  const uniqueRecommenders = new Map<string, { name: string; town: string }>();
  for (const r of reviews) {
    if (!uniqueRecommenders.has(r.author_id)) {
      uniqueRecommenders.set(r.author_id, {
        name: r.author_name,
        town: r.zipcode,
      });
    }
  }

  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-2 text-sm text-stone-500">
              <li><Link href="/recommendations" className="hover:text-forest-600 transition-colors">Recommendations</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-stone-700 truncate">{recommendation.name}</li>
            </ol>
          </nav>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <span className="badge bg-terra-50 text-terra-700 border border-terra-200 mb-2">
                {recommendation.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
                {recommendation.name}
              </h1>
              {recommendation.town && (
                <p className="text-stone-600 text-sm mt-1 flex items-center gap-1">
                  <MapPin size={14} /> {recommendation.town}
                </p>
              )}
            </div>
            {recommendation.review_count > 0 && (
              <div className="text-center shrink-0">
                <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                  <Star size={20} fill="currentColor" />
                  <span className="text-xl font-bold text-stone-800">{recommendation.average_rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-stone-500">{recommendation.review_count} review{recommendation.review_count !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Business info */}
        <div className="card p-5 space-y-3">
          {recommendation.description && (
            <p className="text-stone-700 leading-relaxed">{recommendation.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
            {recommendation.phone && (
              <a href={`tel:${recommendation.phone}`} className="flex items-center gap-1.5 hover:text-forest-600 transition-colors">
                <Phone size={14} /> {recommendation.phone}
              </a>
            )}
            {recommendation.website && (
              <a href={recommendation.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-forest-600 transition-colors">
                <Globe size={14} /> Website
              </a>
            )}
            {recommendation.address && (
              <p className="flex items-center gap-1.5">
                <MapPin size={14} /> {recommendation.address}
              </p>
            )}
          </div>
        </div>

        {/* "Recommended by N neighbors" */}
        {uniqueRecommenders.size > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-forest-600" />
              <h2 className="text-lg font-semibold text-stone-900">
                Recommended by {uniqueRecommenders.size} neighbor{uniqueRecommenders.size !== 1 ? 's' : ''}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueRecommenders.values()).map((rec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-50 text-forest-700 text-sm border border-forest-200"
                >
                  <span className="w-6 h-6 rounded-full bg-forest-200 text-forest-700 text-xs font-bold flex items-center justify-center">
                    {rec.name.charAt(0).toUpperCase()}
                  </span>
                  {rec.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            {reviews.length > 0 ? `Reviews (${reviews.length})` : 'No reviews yet'}
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star size={36} className="text-parchment-300 mx-auto mb-3" />
              <p className="text-stone-600 text-sm">No neighbors have weighed in yet.</p>
              <Link href="/recommendations" className="text-forest-600 text-sm hover:underline mt-2 inline-block">
                Be the first to recommend →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 text-sm font-bold flex items-center justify-center">
                        {review.author_name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-stone-800">{review.author_name}</p>
                        <p className="text-xs text-stone-500">{timeAgo(review.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-700 text-sm leading-relaxed">{review.body}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">
                      Local
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
