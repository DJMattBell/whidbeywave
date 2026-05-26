'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/useAdmin';
import { Activity } from 'lucide-react';

type ScrapeLogEntry = {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  event_count: number;
  status: 'success' | 'partial' | 'failed';
  error: string | null;
};

type SourceSummary = {
  source: string;
  lastRun: ScrapeLogEntry | null;
  recentRuns: ScrapeLogEntry[];
};

const ALL_SOURCES = [
  'WICA', 'Oak Harbor', 'Langley Library', 'Coupeville Library',
  'Thirsty Crab', 'Whidbey Telecom', 'Langley Whale Center',
  'Greenbank Farm', 'Coupeville Arts', 'Barringtons',
  'Wicked Teuton', 'Penn Cove Brewing', 'Dancing Fish',
  'Double Bluff', 'Oak Harbor Chamber', 'Oak Harbor Main Street',
  'Skein & Tipple', 'Seed Markets', 'SW Parks',
  'Oak Harbor Events', 'WCA',
];

function statusDotColor(entry: ScrapeLogEntry | null): string {
  if (!entry) return 'bg-stone-300';
  if (entry.status === 'failed') return 'bg-terra-500';

  const hoursSince = (Date.now() - new Date(entry.started_at).getTime()) / 3_600_000;
  if (hoursSince < 24) return 'bg-forest-500';
  if (hoursSince < 168) return 'bg-amber-500'; // 7 days
  return 'bg-terra-500';
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminScrapersPage() {
  const { isAdmin } = useAdmin();
  const [logs, setLogs] = useState<ScrapeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('scrape_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(500);
      setLogs((data ?? []) as ScrapeLogEntry[]);
      setLoading(false);
    }
    if (isAdmin) fetchLogs();
    else setLoading(false);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-600">Admin access required.</p>
        <Link href="/admin" className="text-forest-600 hover:underline text-sm mt-2 inline-block">
          ← Back to Admin
        </Link>
      </div>
    );
  }

  // Group logs by source
  const summaries: SourceSummary[] = ALL_SOURCES.map(source => {
    const sourceLogs = logs.filter(l => l.source === source);
    return {
      source,
      lastRun: sourceLogs[0] ?? null,
      recentRuns: sourceLogs.slice(0, 5),
    };
  });

  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-2 text-sm text-stone-500">
              <li><Link href="/admin" className="hover:text-forest-600 transition-colors">Admin</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-stone-700">Scrapers</li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Scraper Health
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            {ALL_SOURCES.length} sources · Last scrape run data
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <p className="text-stone-500 text-sm">Loading…</p>
        ) : (
          <div className="space-y-2">
            {summaries.map(({ source, lastRun, recentRuns }) => (
              <div key={source} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [source]: !prev[source] }))}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-parchment-50 transition-colors min-h-[44px]"
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotColor(lastRun)}`} />
                  <span className="font-medium text-stone-800 flex-1">{source}</span>
                  {lastRun ? (
                    <span className="text-xs text-stone-500">
                      {lastRun.event_count} events · {timeAgo(lastRun.started_at)}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">No runs logged</span>
                  )}
                  <Activity size={14} className="text-stone-400 shrink-0" />
                </button>

                {expanded[source] && recentRuns.length > 0 && (
                  <div className="border-t border-parchment-200 bg-parchment-50 px-4 py-3">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Recent runs</p>
                    <div className="space-y-1.5">
                      {recentRuns.map(run => (
                        <div key={run.id} className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            run.status === 'success' ? 'bg-forest-500' :
                            run.status === 'partial' ? 'bg-amber-500' :
                            'bg-terra-500'
                          }`} />
                          <span className="text-stone-600 tabular-nums">
                            {new Date(run.started_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                            })}
                          </span>
                          <span className="text-stone-500">{run.event_count} events</span>
                          <span className={`font-medium ${
                            run.status === 'success' ? 'text-forest-600' :
                            run.status === 'partial' ? 'text-amber-600' :
                            'text-terra-600'
                          }`}>{run.status}</span>
                          {run.error && (
                            <span className="text-terra-500 truncate max-w-[200px]" title={run.error}>
                              {run.error}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
