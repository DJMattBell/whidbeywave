'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import type { ForumPostRow, EventSubmissionRow, Review } from '@/lib/db-types';

type MyListing = {
  id: string;
  title: string;
  price: number | null;
  is_free: boolean;
  category: string;
  location: string;
  emoji: string;
  images: string[];
  sold: boolean;
  status: string;
  created_at: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 24) return `${Math.max(1, Math.round(diffH))}h ago`;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-forest-100 text-forest-800 border-forest-200',
  rejected: 'bg-terra-50 text-terra-700 border-terra-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending:  'Under Review',
  approved: 'Live',
  rejected: 'Not Listed',
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen]     = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [posts, setPosts]           = useState<ForumPostRow[]>([]);
  const [events, setEvents]         = useState<EventSubmissionRow[]>([]);
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]   = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved]   = useState(false);

  // Initialize display name from user metadata
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNameValue(
        user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? ''
      );
    }
  }, [user]);

  // Fetch all user activity in parallel
  useEffect(() => {
    if (loading) return;
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDataLoading(false);
      return;
    }

    async function fetchData() {
      setDataLoading(true);
      const [postsRes, eventsRes, reviewsRes, listingsRes] = await Promise.all([
        supabase
          .from('forum_posts')
          .select('id, title, created_at, reply_count, category_id, author_email')
          .eq('author_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('event_submissions')
          .select('id, title, date, time, location, town, category, status, submitter_name, submitter_email, created_at')
          .eq('submitter_email', user!.email!)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('reviews')
          .select('id, recommendation_id, rating, body, author_name, created_at, author_id, zipcode, helpful_count')
          .eq('author_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('listings')
          .select('id, title, price, is_free, category, location, emoji, images, sold, status, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      setPosts((postsRes.data ?? []) as ForumPostRow[]);
      setEvents((eventsRes.data ?? []) as EventSubmissionRow[]);
      setReviews((reviewsRes.data ?? []) as Review[]);
      setMyListings((listingsRes.data ?? []) as MyListing[]);
      setDataLoading(false);
    }

    fetchData();
  }, [user, loading]);

  async function handleNameSave() {
    if (!nameValue.trim()) return;
    setNameSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nameValue.trim() },
    });
    setNameSaving(false);
    if (!error) {
      setNameSaved(true);
      setEditingName(false);
      setTimeout(() => setNameSaved(false), 3000);
    }
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Islander';
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {/* Header */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sound-600 font-medium mb-2 tracking-wide uppercase text-sm">My Account</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            My Profile
          </h1>
          {user && (
            <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
              {displayName}
            </p>
          )}
        </div>
      </div>

      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-forest-50 border-b border-forest-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <span className="text-sm text-forest-700 font-medium">You&apos;re signed in as admin</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-600 text-parchment-50 text-sm font-semibold hover:bg-forest-700 transition-colors"
            >
              Admin Dashboard →
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Loading skeleton */}
        {loading && (
          <div className="text-center py-20 text-stone-600">
            <div className="text-4xl mb-4 animate-pulse">🌊</div>
            <p>Loading…</p>
          </div>
        )}

        {/* Not signed in */}
        {!loading && !user && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4" aria-hidden="true">🔒</div>
            <h2
              className="text-2xl text-stone-800 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
            >
              Sign in to see your profile
            </h2>
            <p className="text-stone-500 text-base mb-6 max-w-sm mx-auto leading-relaxed">
              Keep track of your forum questions, submitted events, and reviews — all in one place.
            </p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary">
              Sign In
            </button>
          </div>
        )}

        {/* Signed in */}
        {!loading && user && (
          <>
            {/* Account card */}
            <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 mb-1">Signed in as</p>
                  <p className="text-stone-800 font-medium">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {nameSaved && (
                    <span className="text-sm text-forest-600 font-medium">✓ Saved</span>
                  )}
                  <button
                    onClick={() => setEditingName(!editingName)}
                    className="btn-secondary text-sm py-2"
                  >
                    {editingName ? 'Cancel' : 'Edit display name'}
                  </button>
                </div>
              </div>

              {editingName && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                    placeholder="Your display name"
                    className="flex-1 px-4 py-2.5 border border-parchment-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800"
                  />
                  <button
                    onClick={handleNameSave}
                    disabled={nameSaving}
                    className="btn-primary py-2.5 text-sm disabled:opacity-60"
                  >
                    {nameSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Forum posts */}
            <section className="mb-10">
              <h2
                className="text-2xl text-stone-900 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
              >
                Your Questions
                <span className="ml-2 text-base font-normal text-stone-600">({posts.length})</span>
              </h2>

              {dataLoading ? (
                <div className="text-stone-600 text-sm py-4">Loading…</div>
              ) : posts.length === 0 ? (
                <div className="bg-parchment-50 rounded-xl border border-dashed border-parchment-300 p-6 text-center">
                  <p className="text-stone-600 text-sm mb-3">You haven&apos;t posted any questions yet.</p>
                  <Link href="/forum" className="text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors">
                    Ask the Island →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(post => (
                    <Link
                      key={post.id}
                      href={`/forum/${post.id}`}
                      className="flex items-center justify-between gap-4 bg-parchment-50 rounded-xl border border-parchment-200 p-4 hover:border-forest-300 hover:shadow-warm transition-all group"
                    >
                      <p className="text-stone-800 font-medium group-hover:text-forest-700 transition-colors leading-snug">
                        {post.title}
                      </p>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-stone-600">{formatDate(post.created_at)}</p>
                        {post.reply_count > 0 && (
                          <p className="text-xs text-forest-600 font-medium mt-0.5">
                            {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Submitted events */}
            <section className="mb-10">
              <h2
                className="text-2xl text-stone-900 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
              >
                Submitted Events
                <span className="ml-2 text-base font-normal text-stone-600">({events.length})</span>
              </h2>

              {dataLoading ? (
                <div className="text-stone-600 text-sm py-4">Loading…</div>
              ) : events.length === 0 ? (
                <div className="bg-parchment-50 rounded-xl border border-dashed border-parchment-300 p-6 text-center">
                  <p className="text-stone-600 text-sm mb-3">You haven&apos;t submitted any events yet.</p>
                  <Link href="/submit-event" className="text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors">
                    Submit an Event →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(ev => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-4 bg-parchment-50 rounded-xl border border-parchment-200 p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-stone-800 font-medium leading-snug truncate">{ev.title}</p>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                          {ev.town ? ` · ${ev.town}` : ''}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[ev.status] ?? ''}`}>
                        {STATUS_LABELS[ev.status] ?? ev.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* My Listings */}
            <section className="mb-10">
              <h2
                className="text-2xl text-stone-900 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
              >
                My Listings
                <span className="ml-2 text-base font-normal text-stone-600">({myListings.length})</span>
              </h2>

              {dataLoading ? (
                <div className="text-stone-600 text-sm py-4">Loading…</div>
              ) : myListings.length === 0 ? (
                <div className="bg-parchment-50 rounded-xl border border-dashed border-parchment-300 p-6 text-center">
                  <p className="text-stone-600 text-sm mb-3">You haven&apos;t posted any listings yet.</p>
                  <Link href="/submit-listing" className="text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors">
                    Post a Listing →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map(listing => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between gap-4 bg-parchment-50 rounded-xl border border-parchment-200 p-4"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="text-2xl shrink-0" aria-hidden="true">{listing.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-stone-800 font-medium leading-snug truncate">{listing.title}</p>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {listing.is_free ? 'Free' : listing.price != null ? `$${listing.price}` : 'Contact for price'}
                            {listing.sold ? ' · Sold' : ''}
                            {' · '}{listing.location}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        listing.sold
                          ? 'bg-stone-100 text-stone-600 border-stone-200'
                          : STATUS_STYLES[listing.status] ?? 'bg-parchment-100 text-stone-700 border-parchment-300'
                      }`}>
                        {listing.sold ? 'Sold' : STATUS_LABELS[listing.status] ?? listing.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="mb-10">
              <h2
                className="text-2xl text-stone-900 mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
              >
                Your Reviews
                <span className="ml-2 text-base font-normal text-stone-600">({reviews.length})</span>
              </h2>

              {dataLoading ? (
                <div className="text-stone-600 text-sm py-4">Loading…</div>
              ) : reviews.length === 0 ? (
                <div className="bg-parchment-50 rounded-xl border border-dashed border-parchment-300 p-6 text-center">
                  <p className="text-stone-600 text-sm mb-3">You haven&apos;t written any reviews yet.</p>
                  <Link href="/recommendations" className="text-forest-600 hover:text-forest-800 text-sm font-medium transition-colors">
                    Explore Local Picks →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(rev => (
                    <Link
                      key={rev.id}
                      href="/recommendations"
                      className="block bg-parchment-50 rounded-xl border border-parchment-200 p-4 hover:border-forest-300 hover:shadow-warm transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-400 text-sm" aria-label={`${rev.rating} out of 5 stars`}>
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                        <span className="text-xs text-stone-600">{formatDate(rev.created_at)}</span>
                      </div>
                      <p className="text-stone-700 text-sm leading-relaxed">
                        {rev.body.length > 140 ? rev.body.slice(0, 140) + '…' : rev.body}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

          </>
        )}
      </div>
    </>
  );
}
