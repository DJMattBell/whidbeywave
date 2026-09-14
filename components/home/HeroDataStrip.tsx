// Compact at-a-glance strip for the hero bottom edge.
// Shows weather, ferry status (both routes), and events today count.
// Tappable — scrolls to the full Today panel below.
// All data optional; renders nothing if everything fails.

import { fetchFerryBarStatus } from '@/lib/ferry';
import { createServerClient, isConfigured } from '@/lib/supabase';
import { WMO_ICONS } from '@/lib/wmo-codes';

async function fetchWeatherCompact() {
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

function FerryDotCompact({ status }: { status: string }) {
  const cls =
    status === 'cancelled' ? 'bg-terra-400' :
    status === 'delays'    ? 'bg-amber-400' :
                             'bg-forest-400';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${cls}`} aria-hidden="true" />;
}

function ferryLabelCompact(s: string) {
  return s === 'cancelled' ? 'Cancelled' : s === 'delays' ? 'Delays' : 'OK';
}

export default async function HeroDataStrip() {
  const [weather, ferry, eventsCount] = await Promise.all([
    fetchWeatherCompact(),
    fetchFerryBarStatus(),
    fetchEventsTodayCount(),
  ]);

  const hasMuk = ferry.mukilteoClinton != null;
  const hasPT  = ferry.ptCoupeville != null;
  const hasAny = weather || hasMuk || hasPT || (eventsCount !== null && eventsCount > 0);

  if (!hasAny) return null;

  return (
    <a
      href="#today-panel"
      className="absolute bottom-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm border-t border-white/10"
      aria-label="Jump to today's details"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-x-4 sm:gap-x-6 h-9 text-xs text-parchment-100 overflow-x-auto scrollbar-none whitespace-nowrap">
          {/* Weather */}
          {weather && (
            <span className="flex items-center gap-1 shrink-0">
              <span aria-hidden="true">{WMO_ICONS[weather.code] ?? '🌤️'}</span>
              <span className="font-semibold">{weather.temp}°F</span>
            </span>
          )}

          {/* Ferry — Clinton/Mukilteo
              When Phase 1c adds ferry ticket links here, the deep-link targets are:
              - Mukilteo/Clinton tickets: https://wave2go.wsdot.com/webstore/shop/viewItems.aspx?cg=21&c=50
              - PT/Coupeville reservations: https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/default.aspx
              These are deep-linked into WSF's Wave2Go ticketing system and the VRS reservation
              system respectively. They may need updating if WSF restructures their site. */}
          {hasMuk && (
            <span className="flex items-center gap-1 shrink-0">
              <FerryDotCompact status={ferry.mukilteoClinton!.status} />
              <span>Clinton</span>
              <span className="font-semibold">{ferryLabelCompact(ferry.mukilteoClinton!.status)}</span>
            </span>
          )}

          {/* Ferry — Coupeville/PT */}
          {hasPT && (
            <span className="flex items-center gap-1 shrink-0">
              <FerryDotCompact status={ferry.ptCoupeville!.status} />
              <span>PT</span>
              <span className="font-semibold">{ferryLabelCompact(ferry.ptCoupeville!.status)}</span>
            </span>
          )}

          {/* Events today */}
          {eventsCount !== null && eventsCount > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <span className="font-semibold">{eventsCount}</span>
              <span>event{eventsCount !== 1 ? 's' : ''} today</span>
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
