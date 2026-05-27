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

  // Show at most 2 alerts on the homepage; full list lives on /ferry
  const displayAlerts = freshAlerts.slice(0, 2);

  return (
    <div className="border-t border-parchment-200 pt-3 mt-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden="true">⛴️</span>
        <h3 className="text-sm font-bold text-sound-900">Ferry Alerts</h3>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {displayAlerts.map(alert => {
          const routes = affectedRouteLabels(alert);

          return (
            <div
              key={alert.BulletinID}
              className="flex items-start gap-2 text-sm"
            >
              <span className="shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-sound-700">
                  {routes.join(' · ')}
                </span>
                <p className="text-sm text-stone-700 leading-snug line-clamp-2">
                  {alert.RouteAlertText}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {freshAlerts.length > 2 && (
        <p className="text-xs text-sound-600 mt-2">
          <a href="/ferry" className="hover:text-sound-800 underline underline-offset-2 transition-colors">
            See all {freshAlerts.length} ferry alert{freshAlerts.length !== 1 ? 's' : ''} →
          </a>
        </p>
      )}
    </div>
  );
}
