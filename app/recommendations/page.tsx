'use client';

import { useEffect, useState } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import type { Recommendation, Review } from '@/lib/db-types';

const WHIDBEY_ZIPS = ['98239', '98249', '98250', '98253', '98260', '98277', '98278'];

const CATEGORIES = [
  'All',
  'Restaurants & Cafes',
  'Contractors & Trades',
  'Health & Wellness',
  'Arts & Studios',
  'Farms & Markets',
  'Marine & Boating',
  'Pet Services',
  'Auto & Repair',
  'Real Estate',
  'Entertainment',
  'Retail & Shops',
  'Services',
];

const CATEGORY_EMOJIS: Record<string, string> = {
  'Restaurants & Cafes':  '🍽️',
  'Contractors & Trades': '🔨',
  'Health & Wellness':    '💆',
  'Arts & Studios':       '🎨',
  'Farms & Markets':      '🌾',
  'Marine & Boating':     '⚓',
  'Pet Services':         '🐾',
  'Auto & Repair':        '🔧',
  'Real Estate':          '🏡',
  'Entertainment':        '🎭',
  'Retail & Shops':       '🛍️',
  'Services':             '🤝',
};

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <span className={sz} aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= Math.round(rating) ? 'text-amber-400' : 'text-stone-300'}>★</span>
      ))}
    </span>
  );
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''} — ${STAR_LABELS[n]}`}
          aria-pressed={value === n}
          className={`text-2xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${n <= (hover || value) ? 'text-amber-400' : 'text-stone-300'}`}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}

function formatReviewDate(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const d    = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recs, setRecs]           = useState<Recommendation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [authOpen, setAuthOpen]   = useState(false);

  // Expanded review panel + review form state per rec
  const [reviewsOpen, setReviewsOpen]   = useState<Record<string, boolean>>({});
  const [reviewsData, setReviewsData]   = useState<Record<string, Review[]>>({});
  const [reviewsLoading, setReviewsLoading] = useState<Record<string, boolean>>({});

  // Review form state (includes zipcode for validation)
  const [reviewForms, setReviewForms] = useState<Record<string, {
    rating: number; body: string; zip: string; status: string; zipError: string;
  }>>({});

  // Add recommendation form
  const [addOpen, setAddOpen]   = useState(false);
  const [addForm, setAddForm]   = useState({ name: '', category: 'Restaurants & Cafes', description: '', town: '', address: '', website: '' });
  const [addStatus, setAddStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  async function loadRecs() {
    setLoading(true);
    if (!isConfigured) { setLoading(false); return; }
    const { data } = await supabase.from('recommendations').select('*').order('average_rating', { ascending: false });
    setRecs((data ?? []) as unknown as Recommendation[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadRecs(); }, []);

  async function toggleReviews(recId: string) {
    const nowOpen = !reviewsOpen[recId];
    setReviewsOpen(prev => ({ ...prev, [recId]: nowOpen }));
    if (nowOpen && !reviewsData[recId]) {
      setReviewsLoading(prev => ({ ...prev, [recId]: true }));
      const { data } = await supabase.from('reviews').select('*').eq('recommendation_id', recId).order('created_at', { ascending: false });
      setReviewsData(prev => ({ ...prev, [recId]: data ?? [] }));
      setReviewsLoading(prev => ({ ...prev, [recId]: false }));
    }
  }

  function updateReviewForm(recId: string, patch: Partial<{ rating: number; body: string; zip: string; status: string; zipError: string }>) {
    setReviewForms(prev => {
      const existing = prev[recId] ?? { rating: 0, body: '', zip: '', status: 'idle', zipError: '' };
      return { ...prev, [recId]: { ...existing, ...patch } };
    });
  }

  async function submitReview(e: React.FormEvent, recId: string) {
    e.preventDefault();
    const f = reviewForms[recId];
    if (!f || !f.rating || !f.body.trim() || !f.zip.trim() || !user) return;

    // Validate Whidbey zipcode
    if (!WHIDBEY_ZIPS.includes(f.zip.trim())) {
      updateReviewForm(recId, { zipError: 'Reviews require a valid Whidbey Island zip code (98239, 98249, 98250, 98253, 98260, 98277, or 98278).' });
      return;
    }

    updateReviewForm(recId, { status: 'loading', zipError: '' });

    if (!isConfigured) {
      await new Promise(r => setTimeout(r, 600));
      updateReviewForm(recId, { status: 'success' });
      return;
    }

    const displayName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Anonymous';

    const { error } = await supabase.from('reviews').insert({
      recommendation_id: recId,
      rating: f.rating,
      body: f.body.trim(),
      author_id: user.id,
      author_name: displayName,
      zipcode: f.zip.trim(),
    });

    if (error) {
      updateReviewForm(recId, { status: 'error' });
    } else {
      updateReviewForm(recId, { status: 'success' });
      const [reviewsRes, recRes] = await Promise.all([
        supabase.from('reviews').select('*').eq('recommendation_id', recId).order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').eq('id', recId).single(),
      ]);
      if (reviewsRes.data) setReviewsData(prev => ({ ...prev, [recId]: reviewsRes.data! }));
      if (recRes.data) setRecs(prev => prev.map(r => r.id === recId ? (recRes.data as unknown as Recommendation) : r));
    }
  }

  async function submitAddRec(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.category) return;
    setAddStatus('loading');

    if (!isConfigured) {
      await new Promise(r => setTimeout(r, 600));
      setAddStatus('success');
      return;
    }

    const { error } = await supabase.from('recommendations').insert({
      name: addForm.name.trim(),
      category: addForm.category,
      description: addForm.description.trim() || null,
      town: addForm.town.trim() || null,
      address: addForm.address.trim() || null,
      website: addForm.website.trim() || null,
      submitted_by: user?.id ?? null,
    });

    if (error) { setAddStatus('error'); }
    else { setAddStatus('success'); loadRecs(); }
  }

  const filtered = recs.filter(r => {
    const matchesCat  = activeTab === 'All' || r.category === activeTab;
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()) || r.town?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <div className="bg-gradient-to-br from-amber-800 to-forest-800 text-parchment-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-300 font-medium mb-2 tracking-wide uppercase text-sm">⭐ Community</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-parchment-50"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Island Recommendations
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Real recommendations from people who live here. Searchable, honest, and local.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Demo mode:</strong> Add your Supabase keys to <code>.env.local</code> to see live recommendations and enable reviews.
          </div>
        )}

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input
              type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, town, or keyword…"
              className="w-full pl-10 pr-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-700 placeholder:text-stone-400"
            />
          </div>
          <button
            onClick={() => user ? setAddOpen(!addOpen) : setAuthOpen(true)}
            className="btn-primary shrink-0 text-sm py-2.5"
          >
            + Suggest a Place
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTab === cat
                  ? 'bg-forest-500 text-parchment-50 border-forest-500'
                  : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600'
              }`}>
              {CATEGORY_EMOJIS[cat] ?? ''} {cat}
            </button>
          ))}
        </div>

        {/* Add recommendation form */}
        {addOpen && (
          <div className="mb-10 bg-parchment-50 rounded-2xl border border-parchment-300 shadow-warm-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg text-stone-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
                Suggest a place
              </h3>
              <button onClick={() => setAddOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">Cancel</button>
            </div>
            {addStatus === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🌿</div>
                <p className="text-forest-700 font-semibold">Thanks for the tip! It&apos;s been added.</p>
              </div>
            ) : (
              <form onSubmit={submitAddRec} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input type="text" required value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Toby's Tavern"
                    className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Category <span className="text-red-400">*</span></label>
                  <select value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-700">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Town</label>
                  <input type="text" value={addForm.town} onChange={e => setAddForm(p => ({ ...p, town: e.target.value }))}
                    placeholder="Coupeville"
                    className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Website</label>
                  <input type="url" value={addForm.website} onChange={e => setAddForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://…"
                    className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                  <textarea rows={3} value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="What makes this place worth knowing about?"
                    className="w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-none" />
                </div>
                {addStatus === 'error' && <p className="sm:col-span-2 text-red-500 text-xs">Something went wrong — please try again.</p>}
                <div className="sm:col-span-2">
                  <button type="submit" disabled={addStatus === 'loading'} className="btn-primary disabled:opacity-60">
                    {addStatus === 'loading' ? 'Submitting…' : 'Submit Suggestion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Results */}
        <p className="text-sm text-stone-500 mb-5">
          {loading ? 'Loading…' : `${filtered.length} place${filtered.length !== 1 ? 's' : ''} found`}
          {activeTab !== 'All' && <span className="text-forest-600 font-medium"> · {activeTab}</span>}
        </p>

        {filtered.length === 0 && !loading ? (
          <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg text-stone-700 mb-1"
               style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
              Nothing here yet
            </p>
            <p className="text-stone-400 text-sm">
              {isConfigured ? 'Be the first to suggest a place in this category.' : 'Configure Supabase to see recommendations.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map(rec => {
              const rf         = reviewForms[rec.id] ?? { rating: 0, body: '', zip: '', status: 'idle', zipError: '' };
              const revOpen    = reviewsOpen[rec.id] ?? false;
              const revs       = reviewsData[rec.id] ?? [];
              const revLoading = reviewsLoading[rec.id] ?? false;

              return (
                <div key={rec.id} className="card flex flex-col">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{CATEGORY_EMOJIS[rec.category] ?? '⭐'}</span>
                          <span className="badge bg-parchment-200 text-stone-600 text-xs">{rec.category}</span>
                          {rec.town && <span className="text-xs text-stone-400">📍 {rec.town}</span>}
                        </div>
                        <h2 className="text-lg text-stone-900 leading-snug"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>
                          {rec.name}
                        </h2>
                      </div>
                      <div className="text-right shrink-0">
                        <Stars rating={rec.average_rating} />
                        <p className="text-xs text-stone-400 mt-0.5">
                          {rec.average_rating > 0 ? rec.average_rating.toFixed(1) : '—'} · {rec.review_count} review{rec.review_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {rec.description && (
                      <p className="text-sm text-stone-600 leading-relaxed mb-3">{rec.description}</p>
                    )}
                    {rec.website && (
                      <a href={rec.website} target="_blank" rel="noopener noreferrer"
                         className="text-xs text-forest-600 hover:underline">
                        Visit website →
                      </a>
                    )}
                  </div>

                  <div className="border-t border-parchment-200 px-5 py-3 flex gap-3">
                    <button onClick={() => toggleReviews(rec.id)}
                      className="text-xs font-medium text-forest-600 hover:text-forest-800 transition-colors">
                      {revOpen ? '▲ Hide reviews' : `▼ ${rec.review_count > 0 ? 'Read reviews' : 'Be first to review'}`}
                    </button>
                  </div>

                  {/* Reviews panel */}
                  {revOpen && (
                    <div className="border-t border-parchment-200 bg-parchment-50 p-5 space-y-4">
                      {revLoading && <p className="text-xs text-stone-400">Loading reviews…</p>}

                      {!revLoading && revs.length === 0 && rf.status !== 'success' && (
                        <p className="text-xs text-stone-400 italic">No reviews yet — yours could be first.</p>
                      )}

                      {!revLoading && revs.map(rev => (
                        <div key={rev.id} className="bg-white rounded-xl border border-parchment-200 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Stars rating={rev.rating} />
                            <span className="text-xs text-stone-400">
                              {rev.author_name} · <time dateTime={rev.created_at}>{formatReviewDate(rev.created_at)}</time>
                            </span>
                          </div>
                          <p className="text-sm text-stone-700 leading-relaxed">{rev.body}</p>
                        </div>
                      ))}

                      {/* Write a review */}
                      {rf.status === 'success' ? (
                        <div className="text-center py-3 bg-forest-50 rounded-xl border border-forest-100">
                          <p className="text-sm text-forest-700 font-semibold">Thanks for your review! 🌿</p>
                        </div>
                      ) : !user ? (
                        <div className="text-center py-4 border-t border-parchment-200 pt-4">
                          <p className="text-xs text-stone-500 mb-2">Sign in to leave a review.</p>
                          <button onClick={() => setAuthOpen(true)} className="btn-secondary text-xs py-1.5 px-4">
                            Sign in to Review
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={e => submitReview(e, rec.id)} className="space-y-3 border-t border-parchment-200 pt-4">
                          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Write a review</p>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Rating <span className="text-red-400">*</span></label>
                            <StarPicker value={rf.rating} onChange={v => updateReviewForm(rec.id, { rating: v })} />
                          </div>
                          <textarea rows={3} required value={rf.body} onChange={e => updateReviewForm(rec.id, { body: e.target.value })}
                            placeholder="Share your experience…"
                            className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-none" />
                          <div>
                            <input type="text" required value={rf.zip} onChange={e => updateReviewForm(rec.id, { zip: e.target.value, zipError: '' })}
                              placeholder="Your Whidbey Island zip code *" maxLength={10}
                              className={`w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 ${rf.zipError ? 'border-red-300' : 'border-parchment-300'}`} />
                            {rf.zipError ? (
                              <p className="text-red-500 text-xs mt-1">{rf.zipError}</p>
                            ) : (
                              <p className="text-xs text-stone-400 mt-1">Valid Whidbey zips: 98239, 98249, 98250, 98253, 98260, 98277, 98278</p>
                            )}
                          </div>
                          {rf.status === 'error' && <p className="text-red-500 text-xs">Something went wrong — try again.</p>}
                          <button type="submit" disabled={rf.status === 'loading' || !rf.rating}
                            className="btn-primary text-xs py-2 px-4 disabled:opacity-60">
                            {rf.status === 'loading' ? 'Posting…' : 'Post Review'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
