'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { events, newsPosts, listings, formatShortDate } from '@/lib/data';
import { supabase, isConfigured } from '@/lib/supabase';
import type { ForumPostRow, Recommendation } from '@/lib/db-types';

type Results = {
  events: typeof events;
  news: typeof newsPosts;
  listings: typeof listings;
  forum: Pick<ForumPostRow, 'id' | 'title' | 'author_name' | 'reply_count'>[];
  recommendations: Pick<Recommendation, 'id' | 'name' | 'category' | 'town'>[];
};

function SearchBody() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get('q') ?? '';

  const [query, setQuery]       = useState(initialQ);
  const [results, setResults]   = useState<Results | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults(null); return; }
    const lower = q.trim().toLowerCase();

    // Static data — instant
    const matchedEvents = events.filter(e =>
      e.title.toLowerCase().includes(lower) ||
      e.description.toLowerCase().includes(lower) ||
      e.town.toLowerCase().includes(lower)
    );
    const matchedNews = newsPosts.filter(p =>
      p.title.toLowerCase().includes(lower) ||
      p.excerpt.toLowerCase().includes(lower) ||
      p.body.toLowerCase().includes(lower)
    );
    const matchedListings = listings.filter(l =>
      l.title.toLowerCase().includes(lower) ||
      l.description.toLowerCase().includes(lower) ||
      l.location.toLowerCase().includes(lower)
    );

    setResults({ events: matchedEvents, news: matchedNews, listings: matchedListings, forum: [], recommendations: [] });

    // DB search
    if (isConfigured) {
      setDbLoading(true);
      const term = q.trim();
      Promise.all([
        supabase
          .from('forum_posts')
          .select('id, title, author_name, reply_count')
          .or(`title.ilike.%${term}%,body.ilike.%${term}%`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('recommendations')
          .select('id, name, category, town')
          .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
          .limit(5),
      ]).then(([forumRes, recRes]) => {
        setResults(prev =>
          prev
            ? {
                ...prev,
                forum: (forumRes.data ?? []) as Results['forum'],
                recommendations: (recRes.data ?? []) as Results['recommendations'],
              }
            : null
        );
        setDbLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialQ) runSearch(initialQ);
  }, [initialQ, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    runSearch(query);
  }

  const total = results
    ? results.events.length + results.news.length + results.listings.length +
      results.forum.length + results.recommendations.length
    : 0;
  const currentQ = params.get('q');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-10">
        <label htmlFor="global-search" className="sr-only">Search WhidbeyWave</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg" aria-hidden="true">🔍</span>
            <input
              id="global-search"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search events, news, marketplace, forum…"
              autoFocus
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-forest-400 text-base bg-white text-stone-800 placeholder:text-stone-400 shadow-warm-sm"
            />
          </div>
          <button type="submit" className="btn-primary px-6 shrink-0">Search</button>
        </div>
      </form>

      {/* Result count */}
      {currentQ && results && (
        <p className="text-sm text-stone-500 mb-6" aria-live="polite">
          {total === 0
            ? 'Nothing found — try a different word.'
            : (
              <>
                <strong className="text-stone-800">{total}</strong>{' '}
                result{total !== 1 ? 's' : ''} for &ldquo;{currentQ}&rdquo;
                {dbLoading && ' (still searching…)'}
              </>
            )
          }
        </p>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-10">
          {results.events.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">
                📅 Events ({results.events.length})
              </h2>
              <div className="divide-y divide-parchment-200 bg-parchment-50 rounded-2xl border border-parchment-200 overflow-hidden shadow-warm-sm">
                {results.events.map(e => (
                  <Link key={e.id} href="/events" className="flex gap-3 p-4 hover:bg-parchment-100 transition-colors group">
                    <span className="text-2xl shrink-0" aria-hidden="true">{e.emoji}</span>
                    <div>
                      <p className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors">{e.title}</p>
                      <p className="text-sm text-stone-500">📅 {formatShortDate(e.date)} · 📍 {e.town}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.news.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">
                📰 Island News ({results.news.length})
              </h2>
              <div className="divide-y divide-parchment-200 bg-parchment-50 rounded-2xl border border-parchment-200 overflow-hidden shadow-warm-sm">
                {results.news.map(p => (
                  <Link key={p.id} href={`/news#${p.slug}`} className="flex gap-3 p-4 hover:bg-parchment-100 transition-colors group">
                    <span className="text-2xl shrink-0" aria-hidden="true">{p.emoji}</span>
                    <div>
                      <p className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors">{p.title}</p>
                      <p className="text-sm text-stone-500 mt-0.5 line-clamp-1">{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.listings.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">
                🛒 Marketplace ({results.listings.length})
              </h2>
              <div className="divide-y divide-parchment-200 bg-parchment-50 rounded-2xl border border-parchment-200 overflow-hidden shadow-warm-sm">
                {results.listings.map(l => (
                  <Link key={l.id} href="/marketplace" className="flex gap-3 p-4 hover:bg-parchment-100 transition-colors group">
                    <span className="text-2xl shrink-0" aria-hidden="true">{l.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors">{l.title}</p>
                        <span className="text-forest-600 font-bold text-sm">{l.price}</span>
                      </div>
                      <p className="text-sm text-stone-500">📍 {l.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.forum.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">
                💬 Forum ({results.forum.length})
              </h2>
              <div className="divide-y divide-parchment-200 bg-parchment-50 rounded-2xl border border-parchment-200 overflow-hidden shadow-warm-sm">
                {results.forum.map(p => (
                  <Link key={p.id} href={`/forum/${p.id}`} className="block p-4 hover:bg-parchment-100 transition-colors group">
                    <p className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors">{p.title}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      By {p.author_name} · {p.reply_count} {p.reply_count === 1 ? 'reply' : 'replies'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.recommendations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-stone-700 mb-3">
                ⭐ Local Picks ({results.recommendations.length})
              </h2>
              <div className="divide-y divide-parchment-200 bg-parchment-50 rounded-2xl border border-parchment-200 overflow-hidden shadow-warm-sm">
                {results.recommendations.map(r => (
                  <Link key={r.id} href="/recommendations" className="block p-4 hover:bg-parchment-100 transition-colors group">
                    <p className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors">{r.name}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {r.category}{r.town ? ` · ${r.town}` : ''}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {total === 0 && currentQ && !dbLoading && (
            <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
              <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
              <p className="text-lg font-semibold text-stone-700 mb-2">Nothing found</p>
              <p className="text-stone-400 text-sm">Try different keywords — we&apos;re a small island!</p>
            </div>
          )}
        </div>
      )}

      {!query.trim() && !currentQ && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4" aria-hidden="true">🌊</div>
          <p className="text-stone-500 text-base">
            Type something to search across events, news, marketplace, forum, and local picks.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-forest-800 to-sound-700 text-parchment-100 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1
            className="text-3xl md:text-4xl font-bold text-parchment-50 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Search WhidbeyWave
          </h1>
          <p className="text-parchment-300">Events · News · Marketplace · Forum · Local Picks</p>
        </div>
      </div>
      <Suspense fallback={
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-stone-400">Loading…</div>
      }>
        <SearchBody />
      </Suspense>
    </>
  );
}
