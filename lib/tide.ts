// Shared NOAA tide data fetch — used by TodayWidget and homepage action cards.
// Station 9444900 = Greenbank, Whidbey Island.

export type TideData = { type: 'H' | 'L'; time: string; height: string };

export async function fetchNextTide(): Promise<TideData | null> {
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
      time:   `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`,
      height: parseFloat(next.v).toFixed(1),
    };
  } catch { return null; }
}
