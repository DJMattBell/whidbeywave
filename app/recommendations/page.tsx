import { createServerClient, isConfigured } from '@/lib/supabase';
import RecommendationsList from '@/components/RecommendationsList';
import type { Recommendation } from '@/lib/db-types';

export default async function RecommendationsPage() {
  let recs: Recommendation[] = [];

  if (isConfigured) {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('recommendations')
      .select('*')
      .order('average_rating', { ascending: false });
    recs = (data ?? []) as Recommendation[];
  }

  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-600 font-medium mb-2 tracking-wide uppercase text-sm">Community</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Island Recommendations
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            Real recommendations from people who live here. Searchable, honest, and local.
          </p>
        </div>
      </div>

      <RecommendationsList initialRecs={recs} />
    </>
  );
}
