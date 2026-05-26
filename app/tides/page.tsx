import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Whidbey Island Tide Tables — 7-Day Predictions',
  description:
    'NOAA tide predictions for Penn Cove, Whidbey Island — 7-day forecast, high and low tides, station 9444900. Plan your beach day, clamming, or ferry trip.',
  openGraph: {
    title: 'Whidbey Island Tide Tables — 7-Day Predictions',
    description: 'NOAA tide predictions for Penn Cove, Whidbey Island — 7-day forecast with high and low tides.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whidbey Island Tide Tables — 7-Day Predictions',
    description: 'NOAA tide predictions for Penn Cove, Whidbey Island — 7-day forecast.',
    images: ['/og-default.png'],
  },
};

export const revalidate = 3600; // 60 minutes

// ── Types ────────────────────────────────────────────────────────────────────

type RawPrediction = { t: string; v: string; type: 'H' | 'L' };

type ParsedTide = {
  id:        string;   // "2026-02-25 14:30" — used for extreme matching
  dateStr:   string;   // "2026-02-25"
  type:      'H' | 'L';
  height:    number;
  isPast:    boolean;
  timeLabel: string;   // "2:30 pm"
};

type DayGroup = {
  dateStr:  string;
  label:    string;   // "Today" | "Tomorrow" | "Wednesday"
  fullDate: string;   // "February 25"
  tides:    ParsedTide[];
};

// ── Data fetch ───────────────────────────────────────────────────────────────

async function fetchTides(): Promise<ParsedTide[] | null> {
  try {
    const todayPacific = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Los_Angeles',
    });
    const beginDate = todayPacific.replace(/-/g, '');

    const res = await fetch(
      'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter' +
      `?begin_date=${beginDate}&range=168&station=9444900` +
      '&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo' +
      '&units=english&application=WhidbeyWave&format=json',
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.predictions || !Array.isArray(data.predictions)) return null;

    // Current Pacific time as "YYYY-MM-DD HH:MM" for past/upcoming comparison.
    // The "sv" locale produces ISO-like strings: "2026-02-25 14:30:00"
    const nowPacific = new Date()
      .toLocaleString('sv', { timeZone: 'America/Los_Angeles' })
      .slice(0, 16);

    return (data.predictions as RawPrediction[]).map(p => {
      const [dateStr, timeStr] = p.t.split(' ');
      const [h, m] = timeStr.split(':').map(Number);
      return {
        id:        p.t,
        dateStr,
        type:      p.type,
        height:    parseFloat(p.v),
        isPast:    p.t <= nowPacific,
        timeLabel: `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`,
      };
    });
  } catch {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupByDay(tides: ParsedTide[]): DayGroup[] {
  const todayStr = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });
  // Compute tomorrow by advancing from today's noon (avoids DST edge cases)
  const tomorrowStr = new Date(
    new Date(`${todayStr}T12:00:00`).getTime() + 86_400_000
  ).toLocaleDateString('en-CA');

  const map = new Map<string, ParsedTide[]>();
  for (const tide of tides) {
    const bucket = map.get(tide.dateStr) ?? [];
    bucket.push(tide);
    map.set(tide.dateStr, bucket);
  }

  return Array.from(map.entries()).map(([dateStr, dayTides]) => {
    const noon = new Date(`${dateStr}T12:00:00`);
    const label =
      dateStr === todayStr    ? 'Today'    :
      dateStr === tomorrowStr ? 'Tomorrow' :
      noon.toLocaleDateString('en-US', { weekday: 'long' });

    const fullDate = noon.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric',
    });

    return { dateStr, label, fullDate, tides: dayTides };
  });
}

function findExtremes(tides: ParsedTide[]): { maxHighId: string; minLowId: string } {
  const highs = tides.filter(t => t.type === 'H');
  const lows  = tides.filter(t => t.type === 'L');
  const maxHigh = highs.length > 0 ? highs.reduce((a, b) => b.height > a.height ? b : a, highs[0]) : null;
  const minLow  = lows.length > 0 ? lows.reduce((a, b)  => b.height < a.height ? b : a, lows[0]) : null;
  return {
    maxHighId: maxHigh?.id ?? '',
    minLowId:  minLow?.id  ?? '',
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TideEntry({
  tide,
  isMaxHigh,
  isMinLow,
  large = false,
}: {
  tide: ParsedTide;
  isMaxHigh: boolean;
  isMinLow: boolean;
  large?: boolean;
}) {
  const isHigh  = tide.type === 'H';
  const pastCls = tide.isPast ? 'opacity-40' : '';

  const bgCls   = isHigh
    ? 'bg-forest-50 border-forest-200'
    : 'bg-sound-50  border-sound-200';
  const lblCls  = isHigh ? 'text-forest-700' : 'text-sound-700';
  const htCls   = isHigh ? 'text-forest-800' : 'text-sound-800';

  return (
    <div className={`relative border rounded-xl px-4 ${large ? 'py-4' : 'py-3'} ${bgCls} ${pastCls}`}>

      {/* Extreme badges */}
      {isMaxHigh && (
        <span className="absolute -top-2.5 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 shadow-sm">
          Week High
        </span>
      )}
      {isMinLow && (
        <span className="absolute -top-2.5 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-300 text-slate-800 shadow-sm">
          Week Low
        </span>
      )}

      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${lblCls}`}>
        {isHigh ? '▲ High' : '▽ Low'}
      </p>
      <p className={`font-bold leading-none ${large ? 'text-2xl' : 'text-lg'} text-stone-800`}>
        {tide.timeLabel}
      </p>
      <p className={`text-sm font-semibold mt-1 ${htCls}`}>
        {tide.height.toFixed(1)} ft
      </p>
      <p className="text-xs text-stone-600 mt-1">
        {tide.isPast ? '✓ Passed' : '↑ Upcoming'}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TidesPage() {
  const allTides = await fetchTides();
  const failed   = allTides === null;

  const days       = allTides ? groupByDay(allTides)    : [];
  const extremes   = allTides ? findExtremes(allTides)  : { maxHighId: '', minLowId: '' };
  const todayTides = days[0]?.tides ?? [];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sound-700 font-medium mb-2 tracking-wide uppercase text-sm">
            Penn Cove · Station 9444900
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Whidbey Island Tides
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            NOAA tide predictions for Penn Cove — 7-day forecast, updated hourly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* ── NOAA unavailable ─────────────────────────────────────────────── */}
        {failed && (
          <div className="error-banner">
            <p className="font-semibold mb-1">Tides are on island time.</p>
            <p className="text-sm">
              We can&apos;t reach NOAA right now. We&apos;ll keep trying. In the meantime, visit{' '}
              <a
                href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9444900"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-600 underline underline-offset-2 hover:text-terra-800"
              >
                NOAA directly
              </a>
              .
            </p>
          </div>
        )}

        {!failed && (
          <>
            {/* ── Today's Tides ────────────────────────────────────────────── */}
            <section>
              <h2
                className="text-2xl font-semibold text-stone-800 mb-5"
                  >
                Today&apos;s Tides
                <span className="ml-3 text-sm font-normal text-stone-600">
                  {days[0]?.fullDate}
                </span>
              </h2>

              {todayTides.length === 0 ? (
                <p className="text-stone-600 italic">No tide data for today.</p>
              ) : (
                <div className="bg-parchment-50 rounded-xl border border-parchment-200 shadow-warm-md">
                  <div className="h-1.5 bg-gradient-to-r from-sound-400 to-forest-500 rounded-t-2xl" />
                  <div className="p-6">
                    <div className={`grid gap-4 pt-4 ${
                      todayTides.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
                      todayTides.length === 3 ? 'grid-cols-1 sm:grid-cols-3'  :
                                                'grid-cols-2'
                    }`}>
                      {todayTides.map(tide => (
                        <TideEntry
                          key={tide.id}
                          tide={tide}
                          isMaxHigh={tide.id === extremes.maxHighId}
                          isMinLow={tide.id === extremes.minLowId}
                          large
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ── 7-Day Table ──────────────────────────────────────────────── */}
            <section>
              <h2
                className="text-2xl font-semibold text-stone-800 mb-5"
                  >
                7-Day Forecast
              </h2>

              <div className="space-y-3">
                {days.map((day, di) => (
                  <div
                    key={day.dateStr}
                    className={`rounded-xl border ${
                      di === 0
                        ? 'border-forest-200 bg-forest-50/30'
                        : 'border-parchment-200 bg-parchment-50'
                    }`}
                  >
                    {/* Day header */}
                    <div className={`px-5 py-3 flex items-baseline gap-3 border-b ${
                      di === 0 ? 'border-forest-200 bg-forest-50' : 'border-parchment-200 bg-parchment-100/60'
                    }`}>
                      <span
                        className={`font-bold text-base ${di === 0 ? 'text-forest-800' : 'text-stone-700'}`}
                                  >
                        {day.label}
                      </span>
                      <span className="text-sm text-stone-600">{day.fullDate}</span>
                    </div>

                    {/* Tides row */}
                    <div className="px-4 pb-4">
                      <div className={`grid gap-4 mt-3 pt-4 ${
                        day.tides.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
                        day.tides.length === 3 ? 'grid-cols-1 sm:grid-cols-3'  :
                                                 'grid-cols-2'
                      }`}>
                        {day.tides.map(tide => (
                          <TideEntry
                            key={tide.id}
                            tide={tide}
                            isMaxHigh={tide.id === extremes.maxHighId}
                            isMinLow={tide.id === extremes.minLowId}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Helpful context ──────────────────────────────────────────── */}
            <section>
              <h2
                className="text-2xl font-semibold text-stone-800 mb-5"
                  >
                Good to Know
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    emoji: '📏',
                    title: 'What is MLLW?',
                    body:  'Heights are measured from Mean Lower Low Water — the average of the lowest daily tides over many years. A negative reading means the water is lower than that average.',
                    color: 'bg-parchment-50 border-parchment-200',
                  },
                  {
                    emoji: '🦀',
                    title: 'Low Tides Are the Good Ones',
                    body:  'Minus tides and very low tides are perfect for beachcombing, clamming, and tide-pooling. The lower the number, the more beach you get.',
                    color: 'bg-sound-50 border-sound-200',
                  },
                  {
                    emoji: '⛴️',
                    title: 'Ferries & High Tides',
                    body:  'Very high tides can affect the Port Townsend / Coupeville loading ramp. If you\'re heading to the ferry on a big tide day, leave a little extra time.',
                    color: 'bg-forest-50 border-forest-200',
                  },
                ].map(({ emoji, title, body, color }) => (
                  <div key={title} className={`rounded-xl border p-5 ${color}`}>
                    <p className="text-2xl mb-2" aria-hidden="true">{emoji}</p>
                    <p
                      className="font-semibold text-stone-800 mb-1.5"
                              >
                      {title}
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 bg-parchment-50 rounded-xl border border-parchment-200 px-6 py-4">
                <p className="text-sm text-stone-600">
                  Catching a ferry today? Check live status before you head to the dock.
                </p>
                <Link
                  href="/ferry"
                  className="shrink-0 text-sm font-semibold text-forest-600 hover:text-forest-800 transition-colors"
                >
                  🚢 Ferry Status →
                </Link>
              </div>
            </section>
          </>
        )}

        {/* ── Attribution ──────────────────────────────────────────────────── */}
        <p className="text-xs text-stone-600 text-center pb-2">
          Tide data from{' '}
          <a
            href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9444900"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-600 hover:text-forest-800 underline underline-offset-2"
          >
            NOAA Tides and Currents
          </a>
          {' '}· Station 9444900 · Penn Cove, Whidbey Island
        </p>

      </div>
    </>
  );
}
