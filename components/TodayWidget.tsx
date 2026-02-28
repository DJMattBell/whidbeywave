// Server component — "Today at a Glance" snapshot card.
// Fetches weather, ferry status, next tide, events today, and new listings.
// Every section fails silently — a failed fetch hides that cell, never errors.

import Link from 'next/link';
import { fetchFerryBarStatus } from '@/lib/ferry';
import { createServerClient, isConfigured } from '@/lib/supabase';
import type { RouteStatus } from '@/lib/ferry';

// ── Weather code maps (same coords as WeatherTideWidget) ────────────────────

const WMO_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  66: '🌨️', 67: '🌨️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
  80: '🌦️', 81: '🌦️', 82: '🌦️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WMO_LABELS: Record<number, string> = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

// ── Data fetch helpers ───────────────────────────────────────────────────────

type WeatherData = { temp: number; code: number; wind: number };
type TideData    = { type: 'H' | 'L'; time: string; height: string };

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=48.2193&longitude=-122.6879' +
      '&current=temperature_2m,weathercode,windspeed_10m' +
      '&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FLos_Angeles',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m as number),
      code: data.current.weathercode  as number,
      wind: Math.round(data.current.windspeed_10m as number),
    };
  } catch { return null; }
}

async function fetchNextTide(): Promise<TideData | null> {
  try {
    const res = await fetch(
      'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter' +
      '?date=today&station=9444900&product=predictions&datum=MLLW' +
      '&time_zone=lst_ldt&interval=hilo&units=english' +
      '&application=WhidbeyWave&format=json',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.predictions) return null;

    const now  = new Date();
    const next = (data.predictions as { t: string; v: string; type: 'H' | 'L' }[])
      .find(p => {
        const [d, t] = p.t.split(' ');
        return new Date(`${d}T${t}`) > now;
      });
    if (!next) return null;

    const [, timePart] = next.t.split(' ');
    const [h, m] = timePart.split(':').map(Number);
    return {
      type:   next.type,
      time:   `${h % 12 || 12}:${m.toString().padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`,
      height: parseFloat(next.v).toFixed(1),
    };
  } catch { return null; }
}

async function fetchEventsToday(): Promise<number | null> {
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

async function fetchNewListings(): Promise<number | null> {
  if (!isConfigured) return null;
  try {
    const since = new Date(Date.now() - 86_400_000).toISOString();
    const { count, error } = await createServerClient()
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);
    if (error) return null;
    return count ?? 0;
  } catch { return null; }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2.5">
      {children}
    </p>
  );
}

function FerryDot({ status }: { status: RouteStatus }) {
  const cls =
    status === 'cancelled' ? 'bg-red-500'    :
    status === 'delays'    ? 'bg-amber-500'  :
                             'bg-forest-500' ;
  return (
    <span className={`inline-block w-2 h-2 rounded-full shrink-0 mt-0.5 ${cls}`} aria-hidden="true" />
  );
}

function ferryLabel(s: RouteStatus) {
  return s === 'cancelled' ? 'Cancelled' : s === 'delays' ? 'Delays' : 'On Schedule';
}

function ferryTextCls(s: RouteStatus) {
  return s === 'cancelled' ? 'text-red-600 font-semibold'   :
         s === 'delays'    ? 'text-amber-600 font-semibold' :
                             'text-forest-600';
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

  const [weather, ferry, tide, eventsCount, listingsCount] = await Promise.all([
    fetchWeather(),
    fetchFerryBarStatus(),
    fetchNextTide(),
    fetchEventsToday(),
    fetchNewListings(),
  ]);

  const hasMuk      = ferry.mukilteoCliton != null;
  const hasPT       = ferry.ptCoupeville  != null;
  const hasFerry    = hasMuk || hasPT;
  const showListings = listingsCount !== null && listingsCount > 0;

  // Hide the whole widget if there is truly nothing to show
  if (!weather && !hasFerry && !tide && eventsCount === null && !showListings) return null;

  return (
    <section className="bg-parchment-50 border-b border-parchment-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">

        {/* Header row */}
        <div className="flex items-baseline justify-between mb-3">
          <h2
            className="text-base font-bold text-forest-800"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Today on Whidbey
          </h2>
          <span className="text-xs text-stone-600 hidden sm:block">{todayLabel}</span>
        </div>

        {/* Card — flex row on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-parchment-200 border border-parchment-200 rounded-xl overflow-hidden bg-white">

          {/* ── 1. Weather ─────────────────────────────────────────── */}
          {weather && (
            <div className="flex-1 px-4 py-4 min-w-0">
              <SectionLabel>Weather</SectionLabel>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none" aria-hidden="true">
                  {WMO_ICONS[weather.code] ?? '🌤️'}
                </span>
                <div>
                  <p className="text-xl font-bold text-stone-800 leading-none">{weather.temp}°F</p>
                  <p className="text-xs text-stone-600 mt-0.5">{WMO_LABELS[weather.code] ?? ''}</p>
                </div>
              </div>
              {weather.wind > 0 && (
                <p className="text-xs text-stone-600 mt-1.5">💨 {weather.wind} mph</p>
              )}
            </div>
          )}

          {/* ── 2. Ferry ───────────────────────────────────────────── */}
          {hasFerry && (
            <Link href="/ferry" className="flex-1 px-4 py-4 min-w-0 hover:bg-parchment-50 transition-colors">
              <SectionLabel>Ferry</SectionLabel>
              <div className="space-y-2">
                {hasMuk && (
                  <div className="flex items-start gap-1.5">
                    <FerryDot status={ferry.mukilteoCliton!.status} />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-600 leading-tight">Mukilteo / Clinton</p>
                      <p className={`text-sm leading-tight ${ferryTextCls(ferry.mukilteoCliton!.status)}`}>
                        {ferryLabel(ferry.mukilteoCliton!.status)}
                      </p>
                    </div>
                  </div>
                )}
                {hasPT && (
                  <div className="flex items-start gap-1.5">
                    <FerryDot status={ferry.ptCoupeville!.status} />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-600 leading-tight">PT / Coupeville</p>
                      <p className={`text-sm leading-tight ${ferryTextCls(ferry.ptCoupeville!.status)}`}>
                        {ferryLabel(ferry.ptCoupeville!.status)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* ── 3. Next Tide ───────────────────────────────────────── */}
          {tide && (
            <div className="flex-1 px-4 py-4 min-w-0">
              <SectionLabel>Next Tide</SectionLabel>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none" aria-hidden="true">🌊</span>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide leading-none ${
                    tide.type === 'H' ? 'text-forest-600' : 'text-stone-600'
                  }`}>
                    {tide.type === 'H' ? 'High' : 'Low'}
                  </p>
                  <p className="text-xl font-bold text-stone-800 leading-tight mt-0.5">{tide.time}</p>
                  <p className="text-xs text-stone-600">{tide.height} ft</p>
                </div>
              </div>
            </div>
          )}

          {/* ── 4. Events Today ────────────────────────────────────── */}
          {eventsCount !== null && (
            <Link href="/events" className="flex-1 px-4 py-4 min-w-0 hover:bg-parchment-50 transition-colors">
              <SectionLabel>Events Today</SectionLabel>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none" aria-hidden="true">
                  {eventsCount > 0 ? '📅' : '🌿'}
                </span>
                <div>
                  {eventsCount > 0 ? (
                    <>
                      <p className="text-xl font-bold text-stone-800 leading-none">{eventsCount}</p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        event{eventsCount !== 1 ? 's' : ''} today
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-stone-600 leading-snug">
                      Quiet day<br />on the island
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* ── 5. New Listings ────────────────────────────────────── */}
          {showListings && (
            <Link href="/marketplace" className="flex-1 px-4 py-4 min-w-0 hover:bg-parchment-50 transition-colors">
              <SectionLabel>New Listings</SectionLabel>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none" aria-hidden="true">🛒</span>
                <div>
                  <p className="text-xl font-bold text-stone-800 leading-none">{listingsCount}</p>
                  <p className="text-xs text-stone-600 mt-0.5">new today</p>
                </div>
              </div>
            </Link>
          )}

        </div>

        {/* Mobile date label */}
        <p className="text-xs text-stone-600 mt-2 sm:hidden">{todayLabel}</p>
      </div>
    </section>
  );
}
