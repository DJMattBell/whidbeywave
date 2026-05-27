// Server component — "Today at a Glance" three-card panel.
// Cards: Weather (with tide/sunset detail), Ferry (alert count), Events (next event teaser).
// Every section fails silently — a failed fetch hides that card, never errors.

import Link from 'next/link';
import { fetchFerryBarStatus } from '@/lib/ferry';
import { createServerClient, isConfigured } from '@/lib/supabase';
import { WMO_ICONS, WMO_LABELS } from '@/lib/wmo-codes';
import { Calendar, Ship, AlertTriangle } from 'lucide-react';
import { fetchNextTide } from '@/lib/tide';
import type { TideData } from '@/lib/tide';

// ── Data fetch helpers ───────────────────────────────────────────────────────

type WeatherData = { temp: number; code: number; wind: number; sunset: string | null };
type NextEvent   = { title: string; time: string; town: string };

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=48.2193&longitude=-122.6879' +
      '&current=temperature_2m,weathercode,windspeed_10m' +
      '&daily=sunset' +
      '&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FLos_Angeles',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Parse sunset — comes as "2026-05-26T20:14" in local time
    let sunset: string | null = null;
    if (data.daily?.sunset?.[0]) {
      const sunsetStr = data.daily.sunset[0] as string;
      const [, timePart] = sunsetStr.split('T');
      if (timePart) {
        const [h, m] = timePart.split(':').map(Number);
        sunset = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
      }
    }
    return {
      temp: Math.round(data.current.temperature_2m as number),
      code: data.current.weathercode as number,
      wind: Math.round(data.current.windspeed_10m as number),
      sunset,
    };
  } catch { return null; }
}

async function fetchEventsToday(): Promise<{ count: number; next: NextEvent | null } | null> {
  if (!isConfigured) return null;
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    const supabase = createServerClient();

    const [countResult, firstResult] = await Promise.all([
      supabase
        .from('event_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('date', today),
      supabase
        .from('event_submissions')
        .select('title, time, town')
        .eq('status', 'approved')
        .eq('date', today)
        .order('time', { ascending: true })
        .limit(1),
    ]);

    if (countResult.error) return null;
    const count = countResult.count ?? 0;
    const first = firstResult.data?.[0] ?? null;

    return {
      count,
      next: first ? { title: first.title, time: first.time, town: first.town } : null,
    };
  } catch { return null; }
}

async function fetchFerryAlertCount(): Promise<number> {
  const key = process.env.WSDOT_API_KEY;
  if (!key) return 0;
  try {
    const res = await fetch(
      `https://www.wsdot.wa.gov/ferries/api/schedule/rest/alerts?apiaccesscode=${key}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return 0;
    const all = await res.json() as { AllRoutesFlag: boolean; AffectedRouteIDs: number[]; PublishDate: string }[];
    const WHIDBEY_ROUTES = new Set([7, 8]);
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return all.filter(a => {
      const isWhidbey = a.AllRoutesFlag || a.AffectedRouteIDs.some(id => WHIDBEY_ROUTES.has(id));
      if (!isWhidbey) return false;
      const m = a.PublishDate.match(/\/Date\((\d+)/);
      if (m && now - parseInt(m[1]) > THIRTY_DAYS_MS) return false;
      return true;
    }).length;
  } catch { return 0; }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
      {children}
    </p>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default async function TodayWidget() {
  const now = new Date();

  const todayLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    timeZone: 'America/Los_Angeles',
  });

  const [weather, ferry, tide, eventsData, alertCount] = await Promise.all([
    fetchWeather(),
    fetchFerryBarStatus(),
    fetchNextTide(),
    fetchEventsToday(),
    fetchFerryAlertCount(),
  ]);

  const hasMuk   = ferry.mukilteoClinton != null;
  const hasPT    = ferry.ptCoupeville != null;
  const hasFerry = hasMuk || hasPT;

  // Hide the whole widget if there is truly nothing to show
  if (!weather && !hasFerry && eventsData === null) return null;

  // Build weather contextual detail line (priority: tide > sunset > wind)
  let weatherDetail: string | null = null;
  if (tide) {
    weatherDetail = `Next ${tide.type === 'H' ? 'high' : 'low'} at ${tide.time} · ${tide.height} ft`;
  } else if (weather?.sunset) {
    weatherDetail = `Sunset at ${weather.sunset}`;
  } else if (weather && weather.wind > 0) {
    weatherDetail = `Wind ${weather.wind} mph`;
  }

  // Ferry summary
  const hasMukDelays = hasMuk && ferry.mukilteoClinton!.status !== 'on-schedule';
  const hasPTDelays  = hasPT && ferry.ptCoupeville!.status !== 'on-schedule';
  const hasDisruption = hasMukDelays || hasPTDelays;

  let ferrySummary: string;
  if (alertCount > 0) {
    ferrySummary = `${alertCount} active alert${alertCount !== 1 ? 's' : ''}`;
  } else if (hasDisruption) {
    const routes: string[] = [];
    if (hasMukDelays) routes.push('Clinton');
    if (hasPTDelays) routes.push('PT/Coup');
    ferrySummary = `${routes.join(' & ')}: ${ferry.mukilteoClinton?.status === 'cancelled' || ferry.ptCoupeville?.status === 'cancelled' ? 'Cancellations' : 'Delays'}`;
  } else {
    ferrySummary = 'All routes on schedule';
  }

  return (
    <>
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-bold text-forest-800">
          Today on Whidbey
        </h2>
        <span className="text-xs text-stone-600 hidden sm:block">{todayLabel}</span>
      </div>

      {/* Three-card layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* ── 1. Weather ─────────────────────────────────────────── */}
        {weather && (
          <div className="border border-parchment-200 rounded-xl bg-white px-4 py-4">
            <CardLabel>Weather</CardLabel>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none" aria-hidden="true">
                {WMO_ICONS[weather.code] ?? '🌤️'}
              </span>
              <div>
                <p className="text-xl font-bold text-stone-800 leading-none">{weather.temp}°F</p>
                <p className="text-xs text-stone-600 mt-0.5">{WMO_LABELS[weather.code] ?? ''}</p>
              </div>
            </div>
            {weatherDetail && (
              <p className="text-xs text-stone-500 mt-2 leading-snug">{weatherDetail}</p>
            )}
          </div>
        )}

        {/* ── 2. Ferry ───────────────────────────────────────────
            When Phase 1c adds ferry ticket/reservation links here, the deep-link targets are:
            - Mukilteo/Clinton tickets: https://wave2go.wsdot.com/webstore/shop/viewItems.aspx?cg=21&c=50
            - PT/Coupeville reservations: https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/default.aspx
            These are deep-linked into WSF's Wave2Go ticketing system and the VRS reservation
            system respectively. They may need updating if WSF restructures their site. */}
        {hasFerry && (
          <Link href="/ferry" className="border border-parchment-200 rounded-xl bg-white px-4 py-4 hover:bg-parchment-50 transition-colors">
            <CardLabel>Ferry</CardLabel>
            <div className="flex items-center gap-2.5">
              {alertCount > 0 || hasDisruption ? (
                <AlertTriangle size={24} className="text-amber-500 shrink-0" aria-hidden="true" />
              ) : (
                <Ship size={24} className="text-forest-600 shrink-0" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-snug ${
                  alertCount > 0 || hasDisruption ? 'text-amber-700' : 'text-forest-700'
                }`}>
                  {ferrySummary}
                </p>
                {alertCount === 0 && !hasDisruption && (
                  <p className="text-xs text-stone-500 mt-0.5">No active alerts</p>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* ── 3. Events Today ────────────────────────────────────── */}
        {eventsData !== null && (
          <Link href="/events" className="border border-parchment-200 rounded-xl bg-white px-4 py-4 hover:bg-parchment-50 transition-colors">
            <CardLabel>Events Today</CardLabel>
            <div className="flex items-center gap-2.5">
              <Calendar size={24} className="text-forest-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                {eventsData.count > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-stone-800 leading-snug">
                      {eventsData.count} event{eventsData.count !== 1 ? 's' : ''} today
                    </p>
                    {eventsData.next && (
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        Next: {eventsData.next.title}, {eventsData.next.time}
                        {eventsData.next.town ? ` in ${eventsData.next.town}` : ''}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-stone-600 leading-snug">
                    Quiet day on the island
                  </p>
                )}
              </div>
            </div>
          </Link>
        )}

      </div>

      {/* Mobile date label */}
      <p className="text-xs text-stone-600 mt-2 sm:hidden">{todayLabel}</p>
    </>
  );
}
