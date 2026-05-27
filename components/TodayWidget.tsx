// Server component — "Today on Whidbey" compact utility shelf.
// Single-row strip: Weather | Ferry (with ticket links) | Events today count.
// Every section fails silently — a failed fetch hides that segment, never errors.

import Link from 'next/link';
import { fetchFerryBarStatus } from '@/lib/ferry';
import { createServerClient, isConfigured } from '@/lib/supabase';
import { WMO_ICONS, WMO_LABELS } from '@/lib/wmo-codes';
import { AlertTriangle } from 'lucide-react';

// ── Data fetch helpers ───────────────────────────────────────────────────────

type WeatherCompact = { temp: number; code: number };

async function fetchWeather(): Promise<WeatherCompact | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=48.2193&longitude=-122.6879' +
      '&current=temperature_2m,weathercode' +
      '&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m as number),
      code: data.current.weathercode as number,
    };
  } catch { return null; }
}

async function fetchEventsTodayCount(): Promise<number | null> {
  if (!isConfigured) return null;
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    const { count, error } = await createServerClient()
      .from('event_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('date', today);
    if (error) return null;
    return count ?? 0;
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

// ── Divider ─────────────────────────────────────────────────────────────────

function StripDivider() {
  return <span className="hidden sm:block w-px h-5 bg-sound-200 shrink-0" aria-hidden="true" />;
}

// ── Main component ───────────────────────────────────────────────────────────

export default async function TodayWidget() {
  const [weather, ferry, eventsCount, alertCount] = await Promise.all([
    fetchWeather(),
    fetchFerryBarStatus(),
    fetchEventsTodayCount(),
    fetchFerryAlertCount(),
  ]);

  const hasMuk   = ferry.mukilteoClinton != null;
  const hasPT    = ferry.ptCoupeville != null;
  const hasFerry = hasMuk || hasPT;

  // Hide the whole widget if there is truly nothing to show
  if (!weather && !hasFerry && eventsCount === null) return null;

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
    ferrySummary = 'All routes on sched.';
  }

  const ferryHasAlert = alertCount > 0 || hasDisruption;

  return (
    <>
      {/* Single-row utility strip */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

        {/* Weather segment */}
        {weather && (
          <Link href="/weather" className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-forest-600 transition-colors shrink-0">
            <span aria-hidden="true">{WMO_ICONS[weather.code] ?? '🌤️'}</span>
            <span className="font-semibold">{weather.temp}°F</span>
            <span className="text-stone-500 text-xs">{WMO_LABELS[weather.code] ?? ''}</span>
          </Link>
        )}

        {weather && hasFerry && <StripDivider />}

        {/* Ferry segment */}
        {hasFerry && (
          <div className="flex items-center gap-1.5 text-sm shrink-0 flex-wrap">
            {ferryHasAlert ? (
              <AlertTriangle size={14} className="text-amber-500 shrink-0" aria-hidden="true" />
            ) : (
              <span className="shrink-0" aria-hidden="true">⛴</span>
            )}
            <Link
              href="/ferry"
              className={`font-semibold hover:underline ${ferryHasAlert ? 'text-amber-700' : 'text-stone-700'}`}
            >
              {ferrySummary}
            </Link>
            <span className="text-stone-300 mx-0.5" aria-hidden="true">·</span>
            <a
              href="https://wave2go.wsdot.com/webstore/shop/viewItems.aspx?cg=21&c=50"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-forest-600 hover:text-forest-800 hover:underline"
            >
              Buy Muk/Clinton ticket
            </a>
            <a
              href="https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-forest-600 hover:underline"
            >
              Reserve PT/Coupeville
            </a>
          </div>
        )}

        {(weather || hasFerry) && eventsCount !== null && <StripDivider />}

        {/* Events segment */}
        {eventsCount !== null && (
          <Link href="/events" className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-forest-600 transition-colors shrink-0">
            <span aria-hidden="true">📅</span>
            <span className="font-semibold">{eventsCount}</span>
            <span className="text-stone-500 text-xs">event{eventsCount !== 1 ? 's' : ''} today</span>
          </Link>
        )}
      </div>
    </>
  );
}
