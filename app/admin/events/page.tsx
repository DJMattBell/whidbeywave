'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

type Submission = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  town: string;
  category: string;
  description: string | null;
  tags: string[];
  submitter_name: string;
  submitter_email: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
};

const STATUS_COLORS = {
  pending:  'bg-amber-100 text-amber-800 border border-amber-200',
  approved: 'bg-forest-100 text-forest-800 border border-forest-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
};

function fmt(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function AdminEventsPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen]   = useState(false);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter]       = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [fetching, setFetching]   = useState(false);

  // Per-row state
  const [notes, setNotes]       = useState<Record<string, string>>({});
  const [acting, setActing]     = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Newsletter tools
  const [nlStatus, setNlStatus]         = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [subCount, setSubCount]         = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  const isAdmin = Boolean(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  // Always load all submissions — filter client-side so counts stay accurate on all tabs
  const loadSubmissions = useCallback(async () => {
    setFetching(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('event_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setAllSubmissions((data ?? []) as Submission[]);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadSubmissions();
  }, [isAdmin, loadSubmissions]);

  async function sendTestDigest() {
    setNlStatus('sending');
    try {
      const token = await getToken();
      const res  = await fetch('/api/newsletter/send-digest?test=true', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setNlStatus(data.ok ? 'sent' : 'error');
    } catch {
      setNlStatus('error');
    }
  }

  async function loadSubCount() {
    setCountLoading(true);
    try {
      const token = await getToken();
      const res  = await fetch('/api/newsletter/count', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSubCount(data.count ?? 0);
    } catch {
      setSubCount(null);
    }
    setCountLoading(false);
  }

  async function moderate(id: string, action: 'approved' | 'rejected') {
    setActing(p => ({ ...p, [id]: true }));
    try {
      const token = await getToken();
      await fetch('/api/events/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id, action, admin_notes: notes[id] ?? '' }),
      });
      await loadSubmissions();
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
    pending:  allSubmissions.filter(s => s.status === 'pending').length,
    approved: allSubmissions.filter(s => s.status === 'approved').length,
    rejected: allSubmissions.filter(s => s.status === 'rejected').length,
  };

  // Client-side filter for display
  const displayed = filter === 'all'
    ? allSubmissions
    : allSubmissions.filter(s => s.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <img src="/logo.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-full object-cover" />
          <h1 className="text-3xl text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}>
            Event Submissions
          </h1>
        </div>
        <p className="text-stone-500 text-sm">Signed in as {user.email}</p>
        <div className="mt-3 flex gap-4 text-sm flex-wrap">
          <span className="text-stone-400 font-medium">Events</span>
          <span className="text-stone-300">|</span>
          <Link href="/admin/events/recurring" className="text-forest-600 hover:text-forest-800 font-medium">Recurring</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/news"     className="text-forest-600 hover:text-forest-800 font-medium">News Posts</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/listings" className="text-forest-600 hover:text-forest-800 font-medium">Marketplace</Link>
          <span className="text-stone-300">|</span>
          <Link href="/admin/feedback" className="text-forest-600 hover:text-forest-800 font-medium">Feedback →</Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {([
          { key: 'pending',  label: `Pending (${counts.pending})`   },
          { key: 'approved', label: `Approved (${counts.approved})` },
          { key: 'rejected', label: `Rejected (${counts.rejected})` },
          { key: 'all',      label: `All (${allSubmissions.length})` },
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
        <button onClick={loadSubmissions}
          className="ml-auto px-3 py-1.5 rounded-full text-xs text-stone-400 border border-parchment-300 hover:border-stone-400 transition-colors">
          {fetching ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Newsletter Tools */}
      <div className="mb-10 bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          📬 Newsletter Tools
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={sendTestDigest}
            disabled={nlStatus === 'sending'}
            className="btn-primary py-2 px-5 text-sm disabled:opacity-60"
          >
            {nlStatus === 'sending' ? 'Sending…' : '▷ Send Test Digest Now'}
          </button>
          <button
            onClick={loadSubCount}
            disabled={countLoading}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-white text-stone-600 border border-parchment-300 hover:border-forest-400 transition-colors disabled:opacity-60"
          >
            {countLoading ? 'Loading…' : '👥 View Subscriber Count'}
          </button>
          {nlStatus === 'sent'  && <span className="text-sm text-forest-700 font-medium">✓ Test digest sent to admin email</span>}
          {nlStatus === 'error' && <span className="text-sm text-red-600 font-medium">✕ Failed — check server logs</span>}
          {subCount !== null    && (
            <span className="text-sm text-stone-600 font-medium">
              <strong className="text-stone-900">{subCount}</strong> confirmed subscriber{subCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Submissions list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-parchment-100 rounded-2xl border border-dashed border-parchment-300">
          <div className="text-4xl mb-3">🌾</div>
          <p className="text-stone-500 text-sm">
            {fetching ? 'Loading…' : `No ${filter === 'all' ? '' : filter} submissions.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(sub => {
            const isExpanded = expanded[sub.id] ?? (sub.status === 'pending');
            return (
              <div key={sub.id} className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => setExpanded(p => ({ ...p, [sub.id]: !isExpanded }))}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-parchment-100 transition-colors"
                >
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[sub.status]}`}>
                    {sub.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate"
                       style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {sub.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {fmt(sub.date)} · {sub.town} · submitted by {sub.submitter_name}
                    </p>
                  </div>
                  <span className="text-stone-400 text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-parchment-200 p-5 space-y-4">
                    {/* Event info grid */}
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-stone-400">Date</span><p className="text-stone-800 font-medium">{fmt(sub.date)}</p></div>
                      <div><span className="text-stone-400">Time</span><p className="text-stone-800 font-medium">{sub.time}</p></div>
                      <div><span className="text-stone-400">Location</span><p className="text-stone-800 font-medium">{sub.location}, {sub.town}</p></div>
                      <div><span className="text-stone-400">Category</span><p className="text-stone-800 font-medium">{sub.category}</p></div>
                      <div><span className="text-stone-400">Submitter</span><p className="text-stone-800 font-medium">{sub.submitter_name} · {sub.submitter_email}</p></div>
                      <div><span className="text-stone-400">Tags</span><p className="text-stone-800 font-medium">{sub.tags?.join(', ') || '—'}</p></div>
                    </div>

                    {sub.description && (
                      <div>
                        <p className="text-xs text-stone-400 mb-1">Description</p>
                        <p className="text-sm text-stone-700 leading-relaxed bg-white rounded-xl border border-parchment-200 p-3">
                          {sub.description}
                        </p>
                      </div>
                    )}

                    {/* Show previously sent admin note (read-only) */}
                    {sub.admin_notes && sub.status !== 'pending' && (
                      <div className="text-sm text-stone-500 bg-white rounded-xl border border-parchment-200 p-3">
                        <span className="font-medium text-stone-600">Note sent: </span>{sub.admin_notes}
                      </div>
                    )}

                    {/* Action buttons — available for any status so admin can correct mistakes */}
                    <div className="border-t border-parchment-200 pt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">
                          Note for submitter <span className="text-stone-400 font-normal">(optional, sent in approval email)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={notes[sub.id] ?? ''}
                          onChange={e => setNotes(p => ({ ...p, [sub.id]: e.target.value }))}
                          placeholder="e.g. We've added your event to the spring lineup — see you there!"
                          className="w-full px-3 py-2 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => moderate(sub.id, 'approved')}
                          disabled={acting[sub.id] || sub.status === 'approved'}
                          className="btn-primary py-2 px-5 text-sm disabled:opacity-40"
                        >
                          {acting[sub.id] ? 'Saving…' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => moderate(sub.id, 'rejected')}
                          disabled={acting[sub.id] || sub.status === 'rejected'}
                          className="px-5 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-40"
                        >
                          {acting[sub.id] ? 'Saving…' : '✕ Reject'}
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
