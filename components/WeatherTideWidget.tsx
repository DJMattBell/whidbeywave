// Async server component — fetches live data from Open-Meteo, NOAA, and WSDOT.
// Revalidates: weather/tides every 30 min, ferry every 5 min.
// All APIs fail silently — missing data is hidden, not shown as an error.

import Link from 'next/link';
import { fetchFerryBarStatus } from '@/lib/ferry';
import type { RouteStatus } from '@/lib/ferry';

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

type TidePrediction = { t: string; v: string; type: 'H' | 'L' };

async function fetchWeather() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=48.2193&longitude=-122.6879' +
      '&current=temperature_2m,weathercode,windspeed_10m,wind_direction_10m' +
      '&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FLos_Angeles',
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m as number),
      code: data.current.weathercode as number,
      wind: Math.round(data.current.windspeed_10m as number),
    };
  } catch {
    return null;
  }
}

async function fetchTides() {
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

    const now = new Date();
    const upcoming = (data.predictions as TidePrediction[])
      .filter(p => {
        const [datePart, timePart] = p.t.split(' ');
        return new Date(`${datePart}T${timePart}`) > now;
      })
      .slice(0, 2);

    return upcoming.map(p => {
      const [, timePart] = p.t.split(' ');
      const [h, m] = timePart.split(':').map(Number);
      return {
        type:   p.type as 'H' | 'L',
        time:   `${h % 12 || 12}:${m.toString().padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`,
        height: parseFloat(p.v).toFixed(1),
      };
    });
  } catch {
    return null;
  }
}

function FerryStatusText({ status }: { status: RouteStatus }) {
  if (status === 'cancelled') return <span style={{ color: '#991B1B' }} className="font-semibold">CANCELLED</span>;
  if (status === 'delays')    return <span style={{ color: '#B45309' }} className="font-semibold">DELAYS</span>;
  return <span>On Schedule</span>;
}

export default async function WeatherTideWidget() {
  const [weather, tides, ferry] = await Promise.all([
    fetchWeather(),
    fetchTides(),
    fetchFerryBarStatus(),
  ]);

  const hasMuk  = ferry.mukilteoCliton !== null;
  const hasPT   = ferry.ptCoupeville   !== null;
  const hasTides = tides && tides.length > 0;

  if (!weather && !hasTides && !hasMuk && !hasPT) return null;

  const icon  = weather ? (WMO_ICONS[weather.code]  ?? '🌤️') : null;
  const label = weather ? (WMO_LABELS[weather.code] ?? '')    : null;

  return (
    <div className="bg-sound-50 border-b border-sound-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-x-6 text-sm text-sound-800 overflow-x-auto scrollbar-none">

        {/* Location label */}
        <span className="font-semibold text-sound-700 shrink-0 whitespace-nowrap">
          🗺️ Whidbey Now
        </span>

        {/* Weather */}
        {weather && (
          <>
            <span className="text-sound-300 shrink-0" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span aria-hidden="true">{icon}</span>
              <span className="font-semibold">{weather.temp}°F</span>
              <span className="text-sound-600">{label}</span>
              {weather.wind > 0 && (
                <span className="text-sound-500">· {weather.wind} mph wind</span>
              )}
            </span>
          </>
        )}

        {/* Ferry — Clinton/Mukilteo */}
        {hasMuk && (
          <>
            <span className="text-sound-300 shrink-0" aria-hidden="true">·</span>
            <Link href="/ferry" className="flex items-center gap-1.5 shrink-0 whitespace-nowrap hover:text-sound-600 transition-colors">
              <span aria-hidden="true">🚢</span>
              <span className="text-sound-600 font-medium">Clinton–Mukilteo:</span>
              <FerryStatusText status={ferry.mukilteoCliton!.status} />
            </Link>
          </>
        )}

        {/* Ferry — Coupeville/PT */}
        {hasPT && (
          <>
            <span className="text-sound-300 shrink-0" aria-hidden="true">·</span>
            <Link href="/ferry" className="flex items-center gap-1.5 shrink-0 whitespace-nowrap hover:text-sound-600 transition-colors">
              <span aria-hidden="true">⛴</span>
              <span className="text-sound-600 font-medium">Coupeville–PT:</span>
              <FerryStatusText status={ferry.ptCoupeville!.status} />
            </Link>
          </>
        )}

        {/* Tides */}
        {hasTides && (
          <>
            <span className="text-sound-300 shrink-0" aria-hidden="true">·</span>
            <span className="flex items-center gap-3 shrink-0 whitespace-nowrap">
              <span className="text-sound-600 font-medium">🌊 Tides:</span>
              {tides!.map((tide, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className={`font-semibold text-xs uppercase tracking-wide ${
                    tide.type === 'H' ? 'text-forest-600' : 'text-stone-500'
                  }`}>
                    {tide.type === 'H' ? 'High' : 'Low'}
                  </span>
                  <span>{tide.time}</span>
                  <span className="text-sound-500">({tide.height} ft)</span>
                  {i < tides!.length - 1 && <span className="text-sound-300 mx-1">·</span>}
                </span>
              ))}
            </span>
          </>
        )}

        {/* Attribution */}
        <span className="ml-auto text-xs text-sound-400 hidden md:block shrink-0">
          NOAA · Open-Meteo · WSDOT
        </span>
      </div>
    </div>
  );
}
