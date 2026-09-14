'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase as supabaseBrowser } from '@/lib/supabase';
import { usePollingWhenVisible } from '@/lib/hooks/usePollingWhenVisible';
import LocalBadge from '@/components/LocalBadge';
import { Flag, Clock, CheckCircle } from 'lucide-react';

type WaitReport = {
  id: string;
  terminal: string;
  direction: string;
  wait_minutes: number;
  is_local: boolean;
  created_at: string;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return '1 hr ago';
  return `${hrs} hrs ago`;
}

function directionLabel(terminal: string, direction: string): string {
  const isIslandSide = terminal === 'Clinton';
  if (direction === 'departing') {
    return isIslandSide ? 'heading to the mainland' : 'heading to Whidbey';
  }
  return isIslandSide ? 'coming back to Whidbey' : 'arriving on the mainland';
}

function ReportCard({
  report,
  onFlag,
  canFlag,
}: {
  report: WaitReport;
  onFlag: (id: string) => void;
  canFlag: boolean;
}) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="shrink-0 text-center min-w-[56px]">
        <p className="text-2xl font-bold text-sound-700 tabular-nums leading-none">
          {report.wait_minutes}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">min</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-stone-800">
            {report.terminal}
          </p>
          {report.is_local && <LocalBadge />}
        </div>
        <p className="text-xs text-stone-600 mt-0.5 capitalize">
          {directionLabel(report.terminal, report.direction)}
        </p>
        <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
          <Clock size={12} aria-hidden="true" />
          {relativeTime(report.created_at)}
        </p>
      </div>
      {canFlag && (
        <button
          onClick={() => onFlag(report.id)}
          className="p-2 rounded-lg text-stone-400 hover:text-terra-600 hover:bg-terra-50 transition-colors shrink-0"
          aria-label="Flag this report"
          title="Flag as inaccurate"
        >
          <Flag size={16} />
        </button>
      )}
    </div>
  );
}

export default function FerryWaitReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WaitReport[]>([]);
  const [loaded, setLoaded] = useState(false);
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(() => searchParams.get('reported') === '1');
  const router = useRouter();

  // Clean URL and auto-dismiss toast when redirected from /ferry/report
  useEffect(() => {
    if (!showToast) return;
    window.history.replaceState(null, '', '/ferry');
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showToast]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/ferry-waits');
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports ?? []);
      }
    } catch { /* silent */ }
    setLoaded(true);
  }, []);

  usePollingWhenVisible(fetchReports, 60_000);

  async function handleFlag(reportId: string) {
    if (!user) return;
    // Optimistic hide
    setReports(prev => prev.filter(r => r.id !== reportId));

    const { data: { session } } = await supabaseBrowser.auth.getSession();
    if (!session) return;
    await fetch('/api/ferry-waits/flag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ reportId }),
    });
  }

  const toast = showToast ? (
    <div className="success-banner flex items-center gap-2 mb-4">
      <CheckCircle size={16} className="text-forest-600 shrink-0" />
      <p className="text-sm">Thanks. Other Whidbey commuters will see this.</p>
    </div>
  ) : null;

  if (!loaded) {
    return (
      <>
        {toast}
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-parchment-200 rounded-xl" />
          <div className="h-20 bg-parchment-200 rounded-xl" />
        </div>
      </>
    );
  }

  if (reports.length === 0) {
    return (
      <>
        {toast}
        <div className="card p-6 text-center">
          <p className="text-stone-600 text-sm mb-2">
            No recent wait reports. Be the first — report what you see at the dock.
          </p>
          <Link href="/ferry/report" className="btn-primary inline-flex items-center gap-2 text-sm">
            Report a Wait
          </Link>
        </div>
      </>
    );
  }

  // Group by terminal
  const grouped: Record<string, WaitReport[]> = {};
  for (const r of reports) {
    if (!grouped[r.terminal]) grouped[r.terminal] = [];
    if (grouped[r.terminal].length < 5) grouped[r.terminal].push(r);
  }

  return (
    <div className="space-y-4">
      {toast}
      {Object.entries(grouped).map(([terminal, items]) => (
        <div key={terminal}>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">{terminal}</h3>
          <div className="space-y-2">
            {items.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onFlag={handleFlag}
                canFlag={!!user}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="text-center pt-2">
        <Link href="/ferry/report" className="btn-primary inline-flex items-center gap-2 text-sm">
          Report a Wait
        </Link>
      </div>
    </div>
  );
}
