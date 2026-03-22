'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

type Counts = {
  pendingEvents: number;
  pendingListings: number;
  totalNews: number;
  draftNews: number;
  feedbackCount: number;
  totalEvents: number;
  totalListings: number;
  subscriberCount: number;
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    if (user.email !== ADMIN_EMAIL) return;

    async function fetchCounts() {
      setCountsLoading(true);

      const [
        pendingEventsRes,
        pendingListingsRes,
        totalEventsRes,
        totalListingsRes,
        totalNewsRes,
        draftNewsRes,
        feedbackRes,
        subscriberRes,
      ] = await Promise.all([
        supabase.from('event_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('event_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('news_posts').select('id', { count: 'exact', head: true }),
        supabase.from('news_posts').select('id', { count: 'exact', head: true }).eq('published', false),
        supabase.from('site_feedback').select('id', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      ]);

      setCounts({
        pendingEvents: pendingEventsRes.count ?? 0,
        pendingListings: pendingListingsRes.count ?? 0,
        totalEvents: totalEventsRes.count ?? 0,
        totalListings: totalListingsRes.count ?? 0,
        totalNews: totalNewsRes.count ?? 0,
        draftNews: draftNewsRes.count ?? 0,
        feedbackCount: feedbackRes.count ?? 0,
        subscriberCount: subscriberRes.count ?? 0,
      });
      setCountsLoading(false);
    }

    fetchCounts();
  }, [user, loading]);

  // Auth states
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="text-5xl mb-4">🔒</div>
          <h1
            className="text-2xl text-stone-800 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
          >
            Admin Dashboard
          </h1>
          <p className="text-stone-500 mb-6">Sign in to continue.</p>
          <button onClick={() => setAuthOpen(true)} className="btn-primary">Sign In</button>
        </div>
      </>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">🚫</div>
        <h1
          className="text-2xl text-stone-800 mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
        >
          Not Authorized
        </h1>
        <p className="text-stone-500 mb-6">This page is for site administrators only.</p>
        <Link href="/" className="btn-secondary">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-900 via-forest-800 to-sound-800 text-parchment-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forest-300 text-sm font-medium uppercase tracking-wide mb-1">Admin</p>
              <h1
                className="text-3xl md:text-4xl font-bold text-parchment-50"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Dashboard
              </h1>
            </div>
            <Link
              href="/profile"
              className="text-sm text-parchment-300 hover:text-parchment-100 transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Needs Attention */}
        {counts && (counts.pendingEvents > 0 || counts.pendingListings > 0) && (
          <div className="mb-8">
            <h2
              className="text-xl font-semibold text-stone-800 mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Needs Your Attention
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {counts.pendingEvents > 0 && (
                <Link
                  href="/admin/events"
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-all hover:-translate-y-0.5 group"
                >
                  <span className="text-3xl">📅</span>
                  <div>
                    <p className="text-2xl font-bold text-amber-800">{counts.pendingEvents}</p>
                    <p className="text-sm text-amber-700 font-medium">
                      event{counts.pendingEvents !== 1 ? 's' : ''} awaiting review
                    </p>
                  </div>
                  <span className="ml-auto text-amber-600 group-hover:text-amber-800 transition-colors">→</span>
                </Link>
              )}
              {counts.pendingListings > 0 && (
                <Link
                  href="/admin/listings"
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-all hover:-translate-y-0.5 group"
                >
                  <span className="text-3xl">🏷️</span>
                  <div>
                    <p className="text-2xl font-bold text-amber-800">{counts.pendingListings}</p>
                    <p className="text-sm text-amber-700 font-medium">
                      listing{counts.pendingListings !== 1 ? 's' : ''} awaiting review
                    </p>
                  </div>
                  <span className="ml-auto text-amber-600 group-hover:text-amber-800 transition-colors">→</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2
            className="text-xl font-semibold text-stone-800 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Manage
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminCard
              href="/admin/events"
              emoji="📅"
              label="Events"
              stat={countsLoading ? '…' : `${counts?.totalEvents ?? 0} total`}
              badge={counts?.pendingEvents ? `${counts.pendingEvents} pending` : undefined}
              color="bg-forest-50 border-forest-200 hover:bg-forest-100"
            />
            <AdminCard
              href="/admin/listings"
              emoji="🏷️"
              label="Listings"
              stat={countsLoading ? '…' : `${counts?.totalListings ?? 0} total`}
              badge={counts?.pendingListings ? `${counts.pendingListings} pending` : undefined}
              color="bg-amber-50 border-amber-200 hover:bg-amber-100"
            />
            <AdminCard
              href="/admin/news"
              emoji="📰"
              label="News"
              stat={countsLoading ? '…' : `${counts?.totalNews ?? 0} posts`}
              badge={counts?.draftNews ? `${counts.draftNews} draft` : undefined}
              color="bg-sound-50 border-sound-200 hover:bg-sound-100"
            />
            <AdminCard
              href="/admin/feedback"
              emoji="💬"
              label="Feedback"
              stat={countsLoading ? '…' : `${counts?.feedbackCount ?? 0} messages`}
              color="bg-terra-50 border-terra-200 hover:bg-terra-100"
            />
          </div>
        </div>

        {/* Site Stats */}
        <div className="mb-8">
          <h2
            className="text-xl font-semibold text-stone-800 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Site Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Newsletter Subscribers" value={countsLoading ? '…' : (counts?.subscriberCount ?? 0)} emoji="📬" />
            <StatCard label="Total Events" value={countsLoading ? '…' : (counts?.totalEvents ?? 0)} emoji="📅" />
            <StatCard label="Total Listings" value={countsLoading ? '…' : (counts?.totalListings ?? 0)} emoji="🏷️" />
            <StatCard label="News Posts" value={countsLoading ? '…' : (counts?.totalNews ?? 0)} emoji="📰" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2
            className="text-xl font-semibold text-stone-800 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Quick Links
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickLink href="/admin/news" emoji="✏️" label="Write a News Post" />
            <QuickLink href="/submit-event" emoji="📅" label="Submit an Event" />
            <QuickLink href="/submit-listing" emoji="🏷️" label="Post a Listing" />
            <QuickLink href="/newsletter" emoji="📬" label="Newsletter Settings" />
          </div>
        </div>
      </div>
    </>
  );
}

function AdminCard({
  href, emoji, label, stat, badge, color,
}: {
  href: string; emoji: string; label: string; stat: string; badge?: string; color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 ${color} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-warm group relative`}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <span className="text-3xl">{emoji}</span>
      <span
        className="text-sm font-semibold text-stone-800"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {label}
      </span>
      <span className="text-xs text-stone-500">{stat}</span>
    </Link>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-4 text-center">
      <span className="text-2xl block mb-1">{emoji}</span>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{label}</p>
    </div>
  );
}

function QuickLink({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl bg-parchment-50 border border-parchment-200 hover:border-forest-300 hover:bg-forest-50 transition-all group"
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium text-stone-700 group-hover:text-forest-700 transition-colors">{label}</span>
      <span className="ml-auto text-stone-400 group-hover:text-forest-600 transition-colors">→</span>
    </Link>
  );
}
