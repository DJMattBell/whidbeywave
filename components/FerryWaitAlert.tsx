'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { usePollingWhenVisible } from '@/lib/hooks/usePollingWhenVisible';
import { Clock } from 'lucide-react';

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
  return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`;
}

function directionLabel(terminal: string, direction: string): string {
  const isIslandSide = terminal === 'Clinton';
  if (direction === 'departing') {
    return isIslandSide ? 'heading to the mainland' : 'heading to Whidbey';
  }
  return isIslandSide ? 'coming back to Whidbey' : 'arriving on the mainland';
}

/**
 * Client island for the Today block on the homepage.
 * Shows the most relevant recent ferry wait report if the user has
 * a ferry_direction_preference set, or the newest report otherwise.
 * Only shows reports from the last 30 minutes.
 */
export default function FerryWaitAlert() {
  const { user } = useAuth();
  const [matchingReport, setMatchingReport] = useState<WaitReport | null>(null);

  const fetchAlert = useCallback(async () => {
    try {
      const res = await fetch('/api/ferry-waits');
      if (!res.ok) return;
      const { reports } = await res.json() as { reports: WaitReport[] };

      // Only consider reports from the last 30 minutes
      const thirtyMinAgo = Date.now() - 30 * 60_000;
      const recent = reports.filter(r => new Date(r.created_at).getTime() > thirtyMinAgo);
      if (recent.length === 0) {
        setMatchingReport(null);
        return;
      }

      // Check user preference
      const pref = user?.user_metadata?.ferry_direction_preference as
        { terminal?: string; direction?: string } | undefined;

      if (pref?.terminal && pref?.direction) {
        const match = recent.find(
          r => r.terminal === pref.terminal && r.direction === pref.direction
        );
        setMatchingReport(match ?? null);
      } else {
        // No preference — show the newest report
        setMatchingReport(recent[0] ?? null);
      }
    } catch {
      // Silent — this is a nice-to-have surface
    }
  }, [user]);

  usePollingWhenVisible(fetchAlert, 60_000);

  if (!matchingReport) return null;

  return (
    <Link
      href="/ferry"
      className="flex items-center gap-1.5 text-sm text-sound-700 hover:text-forest-600 transition-colors shrink-0"
    >
      <Clock size={14} className="shrink-0" aria-hidden="true" />
      <span className="font-semibold">{matchingReport.wait_minutes} min</span>
      <span className="text-stone-500 text-xs">
        wait at {matchingReport.terminal} {directionLabel(matchingReport.terminal, matchingReport.direction)} · {relativeTime(matchingReport.created_at)}
      </span>
    </Link>
  );
}
