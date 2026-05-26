'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { FerryPageData, RouteFullData, RouteStatus, Departure } from '@/lib/ferry';

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeLabel(epochMs: number, now: number): string {
  const diffMin = Math.round((epochMs - now) / 60_000);
  if (diffMin <= 0) return 'now';
  if (diffMin === 1) return 'in 1 min';
  if (diffMin < 60) return `in ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
}

function statusLabel(s: RouteStatus) {
  return s === 'cancelled' ? 'Cancelled' : s === 'delays' ? 'Delays' : 'On Schedule';
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RouteStatus }) {
  if (status === 'cancelled') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
        style={{ background: 'var(--color-terra-50, #FEE2E2)', color: 'var(--color-terra-800, #991B1B)' }}
      >
        <span>✕</span> CANCELLED
      </span>
    );
  }
  if (status === 'delays') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
        style={{ background: '#FEF3C7', color: '#B45309' }}
      >
        <span>⚠</span> DELAYS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-forest-100 text-forest-700">
      <span>✓</span> On Schedule
    </span>
  );
}

function DepartureList({
  label,
  departures,
  direction,
  now,
}: {
  label: string;
  departures: Departure[];
  direction: 'mainland' | 'whidbey';
  now: number;
}) {
  const pillCls = direction === 'mainland'
    ? 'bg-sound-50 text-sound-800 rounded-lg px-2 py-1'
    : 'bg-forest-50 text-forest-800 rounded-lg px-2 py-1';

  // Filter departures that haven't passed yet (client-side real-time filter)
  const live = departures.filter(d => d.epochMs > now).slice(0, 3);
  const nextDep = live.find(d => !d.isCancelled);

  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 inline-block ${pillCls}`}>
        {label}
      </p>

      {nextDep && (
        <div className="mb-3">
          <p className="text-3xl font-bold text-stone-900 tabular-nums leading-none">{nextDep.time}</p>
          <p className="text-sm font-semibold text-forest-600 mt-0.5">{relativeLabel(nextDep.epochMs, now)}</p>
        </div>
      )}

      {live.length === 0 ? (
        <p className="text-sm text-stone-600 italic">No upcoming departures</p>
      ) : (
        <ol className="space-y-1.5">
          {live.map((dep) => (
            <li key={dep.epochMs} className="flex items-start gap-2 text-sm">
              <span className="font-semibold text-stone-800 tabular-nums w-16 shrink-0 pt-px">{dep.time}</span>
              <span className="text-stone-500 text-xs leading-snug">{dep.vessel}</span>
              <span className="ml-auto text-xs text-stone-400 tabular-nums shrink-0">
                {dep.isCancelled ? (
                  <span className="font-semibold text-terra-600">CANCELLED</span>
                ) : (
                  relativeLabel(dep.epochMs, now)
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function RouteCard({
  route,
  title,
  emoji,
  mainlandLabel,
  whidbeyLabel,
  accentGradient,
  now,
  extra,
}: {
  route: RouteFullData;
  title: string;
  emoji: string;
  mainlandLabel: string;
  whidbeyLabel: string;
  accentGradient: string;
  now: number;
  extra?: React.ReactNode;
}) {
  return (
    <article className="card-elevated overflow-hidden">
      <div className={`h-1.5 ${accentGradient}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-0.5">Route</p>
            <h3 className="text-xl font-semibold text-stone-900">
              {emoji} {title}
            </h3>
          </div>
          <StatusBadge status={route.status} />
        </div>

        {route.alertText && route.status !== 'on-schedule' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800 leading-relaxed">
            {route.alertText}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-5 border-t border-parchment-200 pt-5">
          <DepartureList label={mainlandLabel} departures={route.fromMainland} direction="mainland" now={now} />
          <DepartureList label={whidbeyLabel} departures={route.fromWhidbey} direction="whidbey" now={now} />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-stone-600">
            Updated {route.lastUpdated}
          </p>
          {extra}
        </div>
      </div>
    </article>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const POLL_INTERVAL = 60_000; // fetch fresh data every 60 s
const TICK_INTERVAL = 1_000;  // update countdowns every 1 s

export default function FerryLiveBoard({ initial }: { initial: FerryPageData }) {
  const [data, setData] = useState<FerryPageData>(initial);
  const [now, setNow] = useState(Date.now());
  const [fetchError, setFetchError] = useState(false);
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Tick clock every second for countdowns
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      setCountdown(prev => Math.max(0, prev - 1));
    }, TICK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Fetch fresh data
  const fetchFresh = useCallback(async () => {
    try {
      const res = await fetch('/api/ferry', { cache: 'no-store' });
      if (!res.ok) throw new Error('API error');
      const fresh: FerryPageData = await res.json();
      setData(fresh);
      setFetchError(false);
    } catch {
      setFetchError(true);
    }
    setCountdown(POLL_INTERVAL / 1000);
  }, []);

  // Poll on interval
  useEffect(() => {
    pollRef.current = setInterval(fetchFresh, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchFresh]);

  // Refresh when tab regains focus after being away > 30 s
  useEffect(() => {
    let lastVisible = Date.now();
    function onVis() {
      if (document.visibilityState === 'visible' && Date.now() - lastVisible > 30_000) {
        fetchFresh();
      }
      lastVisible = Date.now();
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchFresh]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div>
      {/* Live indicator + refresh bar */}
      <div className="flex items-center justify-center gap-3 text-sm text-stone-500 mb-6">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
        <span className="text-stone-300">·</span>
        <span>
          Refreshes in {mins}:{secs.toString().padStart(2, '0')}
        </span>
        <button
          onClick={fetchFresh}
          className="text-forest-600 hover:text-forest-800 font-medium transition-colors"
        >
          Refresh now
        </button>
        {fetchError && (
          <>
            <span className="text-stone-300">·</span>
            <span className="text-terra-600 text-xs">Ferry status is on island time — showing last good data</span>
          </>
        )}
      </div>

      {/* Not configured */}
      {!data.configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-2xl mb-3">🔑</p>
          <p className="font-semibold text-amber-800 mb-1">WSDOT API key not configured</p>
          <p className="text-amber-700 text-sm">
            Add your key from{' '}
            <span className="font-mono bg-amber-100 px-1 rounded">wsdot.wa.gov/traffic/api/</span>{' '}
            to <span className="font-mono bg-amber-100 px-1 rounded">.env.local</span> as{' '}
            <span className="font-mono bg-amber-100 px-1 rounded">WSDOT_API_KEY</span>.
          </p>
        </div>
      )}

      {/* Configured but API failed */}
      {data.configured && !data.mukilteoClinton && !data.ptCoupeville && (
        <div className="error-banner">
          <p className="font-semibold mb-1">Ferry status is on island time.</p>
          <p className="text-sm">
            We can&apos;t reach WSDOT right now — they may be doing maintenance. We&apos;ll keep trying. Check{' '}
            <a
              href="https://www.wsdot.wa.gov/ferries/alerts/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terra-600 underline underline-offset-2 hover:text-terra-800"
            >
              wsdot.wa.gov/ferries/alerts
            </a>{' '}
            directly.
          </p>
        </div>
      )}

      {/* Route cards */}
      {(data.mukilteoClinton || data.ptCoupeville) && (
        <div className="grid md:grid-cols-2 gap-6">
          {data.mukilteoClinton && (
            <RouteCard
              route={data.mukilteoClinton}
              title="Mukilteo / Clinton"
              emoji="🚢"
              mainlandLabel="From Mukilteo →"
              whidbeyLabel="From Clinton →"
              accentGradient="bg-gradient-to-r from-sound-400 to-forest-500"
              now={now}
              extra={
                <a
                  href="https://www.wsdot.wa.gov/ferries/vesselwatch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-forest-600 hover:text-forest-800 transition-colors"
                >
                  Track vessels →
                </a>
              }
            />
          )}
          {data.ptCoupeville && (
            <RouteCard
              route={data.ptCoupeville}
              title="Port Townsend / Coupeville"
              emoji="⛴"
              mainlandLabel="From Port Townsend →"
              whidbeyLabel="From Coupeville →"
              accentGradient="bg-gradient-to-r from-terra-400 to-amber-500"
              now={now}
              extra={
                <a
                  href="https://secureapps.wsdot.wa.gov/ferries/reservations/vehicle/default.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-forest-600 hover:text-forest-800 flex items-center gap-1 transition-colors"
                >
                  🎫 Reserve a spot →
                </a>
              }
            />
          )}
        </div>
      )}

      <p className="text-sm text-stone-600 mt-4 text-center">
        Full alerts and sailing updates:{' '}
        <a
          href="https://www.wsdot.wa.gov/ferries/alerts/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
        >
          wsdot.wa.gov/ferries/alerts
        </a>
      </p>
    </div>
  );
}
