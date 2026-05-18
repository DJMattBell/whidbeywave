// Server component — fetches live WSF alerts, filtered to Whidbey routes only
const MUKILTEO_CLINTON    = 7;
const PT_COUPEVILLE       = 8;
const WHIDBEY_ROUTE_IDS   = new Set([MUKILTEO_CLINTON, PT_COUPEVILLE]);

const ROUTE_LABEL: Record<number, string> = {
  [MUKILTEO_CLINTON]: 'Mukilteo / Clinton',
  [PT_COUPEVILLE]:    'Port Townsend / Coupeville',
};

type WsfAlert = {
  BulletinID:      number;
  AlertFullTitle:  string;
  RouteAlertText:  string;
  AllRoutesFlag:   boolean;
  AffectedRouteIDs: number[];
  PublishDate:     string; // "/Date(1234567890000-0800)/"
};

function parseMsDate(d: string): Date | null {
  const m = d.match(/\/Date\((\d+)/);
  return m ? new Date(parseInt(m[1])) : null;
}

function affectedRouteLabels(alert: WsfAlert): string[] {
  if (alert.AllRoutesFlag) {
    return [ROUTE_LABEL[MUKILTEO_CLINTON], ROUTE_LABEL[PT_COUPEVILLE]];
  }
  return alert.AffectedRouteIDs
    .filter(id => WHIDBEY_ROUTE_IDS.has(id))
    .map(id => ROUTE_LABEL[id]);
}

async function getWhidbeyAlerts(): Promise<WsfAlert[]> {
  const key = process.env.WSDOT_API_KEY;
  if (!key) return [];
  const res = await fetch(
    `https://www.wsdot.wa.gov/ferries/api/schedule/rest/alerts?apiaccesscode=${key}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const all: WsfAlert[] = await res.json();
  return all.filter(a =>
    a.AllRoutesFlag || a.AffectedRouteIDs.some(id => WHIDBEY_ROUTE_IDS.has(id))
  );
}

export default async function FerryAlerts() {
  let alerts: WsfAlert[] = [];
  try {
    alerts = await getWhidbeyAlerts();
  } catch {
    return null;
  }

  // Filter out stale alerts older than 30 days
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = new Date();
  const freshAlerts = alerts.filter(alert => {
    const posted = parseMsDate(alert.PublishDate);
    if (!posted) return true; // keep if we can't parse the date
    return now.getTime() - posted.getTime() < THIRTY_DAYS_MS;
  });

  if (freshAlerts.length === 0) return null;

  return (
    <section className="bg-sound-50 border-y border-sound-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-2xl" aria-hidden="true">⛴️</span>
          <div>
            <h2
              className="text-lg font-bold text-sound-900 leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              WSF Ferry Alerts
            </h2>
            <p className="text-xs text-sound-600 mt-0.5">Mukilteo / Clinton &nbsp;·&nbsp; Port Townsend / Coupeville</p>
          </div>
          <span className="ml-auto text-xs text-sound-500 hidden sm:block">
            Via Washington State Ferries
          </span>
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {freshAlerts.map(alert => {
            const routes  = affectedRouteLabels(alert);
            const pubDate = parseMsDate(alert.PublishDate);

            return (
              <div
                key={alert.BulletinID}
                className="bg-white rounded-xl border border-sound-200 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                {/* Icon */}
                <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">⚠️</span>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  {/* Route badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {routes.map(r => (
                      <span
                        key={r}
                        className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sound-100 text-sound-800 border border-sound-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {alert.RouteAlertText}
                  </p>

                  {/* Date */}
                  {pubDate && (
                    <p className="text-xs text-stone-600 mt-1.5">
                      Posted{' '}
                      <time dateTime={pubDate.toISOString()}>
                        {pubDate.toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </time>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer link */}
        <p className="text-xs text-sound-500 mt-4 text-right">
          <a
            href="https://www.wsdot.wa.gov/ferries"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sound-700 underline underline-offset-2 transition-colors"
          >
            Full schedule & updates at wsdot.wa.gov/ferries →
          </a>
        </p>
      </div>
    </section>
  );
}
