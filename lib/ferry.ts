// WSDOT Ferry Schedule API utilities
// Shared by WeatherTideWidget (status bar only) and /ferry page (full data)

const BASE = 'https://www.wsdot.wa.gov/ferries/api/schedule/rest';

// ── Types ──────────────────────────────────────────────────────────────────

export type RouteStatus = 'on-schedule' | 'delays' | 'cancelled';

export type Departure = {
  time: string;       // "10:15 AM"
  vessel: string;
  isCancelled: boolean;
  epochMs: number;    // UTC ms — for client-side relative-time countdown
};

export type RouteBarStatus = {
  status: RouteStatus;
};

export type FerryBarData = {
  mukilteoCliton: RouteBarStatus | null;
  ptCoupeville:   RouteBarStatus | null;
};

export type RouteFullData = {
  status:       RouteStatus;
  alertText:    string | null;
  fromMainland: Departure[];   // next 3 sailings from mainland terminal
  fromWhidbey:  Departure[];   // next 3 sailings from Whidbey terminal
  lastUpdated:  string;
};

export type FerryPageData = {
  mukilteoCliton: RouteFullData | null;
  ptCoupeville:   RouteFullData | null;
  lastUpdated:    string;
  configured:     boolean;
};

// ── Internal helpers ───────────────────────────────────────────────────────

function isFerryConfigured(): boolean {
  const key = process.env.WSDOT_API_KEY;
  return Boolean(key && key !== 'your-api-key-here' && key.trim().length > 5);
}

// Parse .NET JSON dates: /Date(1234567890000-0700)/
function parseDotNetDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const m = dateStr.match(/\/Date\((-?\d+)(?:[+-]\d{4})?\)\//);
  if (!m) return null;
  return new Date(parseInt(m[1], 10));
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });
}

// Returns { data, success } so callers can distinguish "no alerts" from "API failed"
async function fetchAlerts(fresh = false): Promise<{ data: any[]; success: boolean }> {
  const key = process.env.WSDOT_API_KEY;
  if (!isFerryConfigured()) return { data: [], success: false };
  try {
    const opts: RequestInit = fresh
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 } };
    const res = await fetch(`${BASE}/alerts?apiaccesscode=${key}`, opts);
    if (!res.ok) return { data: [], success: false };
    const raw = await res.json();
    return { data: Array.isArray(raw) ? raw : [], success: true };
  } catch {
    return { data: [], success: false };
  }
}

async function fetchScheduleData(routeId: number, fresh = false): Promise<any | null> {
  const key = process.env.WSDOT_API_KEY;
  if (!isFerryConfigured()) return null;
  try {
    const opts: RequestInit = fresh
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 } };
    const res = await fetch(
      `${BASE}/scheduletoday/${routeId}/true?apiaccesscode=${key}`,
      opts,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function extractStatus(
  alerts: any[],
  routeId: number
): { status: RouteStatus; alertText: string | null } {
  const mine = alerts.filter(
    a => Array.isArray(a.Routes) && a.Routes.some((r: any) => r.RouteID === routeId)
  );
  if (mine.length === 0) return { status: 'on-schedule', alertText: null };

  for (const alert of mine) {
    const probe = (
      alert.DisruptionDescription ??
      alert.AlertDescription ??
      alert.BulletinText ??
      ''
    ).toLowerCase();

    if (probe.includes('cancel') || probe.includes('suspend')) {
      return {
        status: 'cancelled',
        alertText: alert.BulletinText ?? alert.AlertDescription ?? null,
      };
    }
    if (probe.includes('delay') || probe.includes('late')) {
      return {
        status: 'delays',
        alertText: alert.BulletinText ?? alert.AlertDescription ?? null,
      };
    }
  }

  // Has alerts but no severity keywords — informational
  return {
    status: 'on-schedule',
    alertText: mine[0]?.BulletinText ?? null,
  };
}

function extractDepartures(
  scheduleData: any,
  terminalName: string,
  limit = 3
): Departure[] {
  if (!scheduleData) return [];
  const combos: any[] = scheduleData.TerminalCombos ?? scheduleData.terminalCombos ?? [];
  const combo = combos.find((c: any) =>
    (c.DepartingTerminalName ?? '').toLowerCase().includes(terminalName.toLowerCase())
  );
  if (!combo) return [];

  const now = new Date();
  const results: Departure[] = [];

  for (const t of (combo.Times ?? [])) {
    const dt = parseDotNetDate(t.DepartureTime ?? t.DepartingTime);
    if (!dt || dt <= now) continue;
    results.push({
      time:        formatTime(dt),
      vessel:      t.VesselName ?? 'Ferry',
      isCancelled: t.IsCancelled ?? false,
      epochMs:     dt.getTime(),
    });
    if (results.length >= limit) break;
  }
  return results;
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Lightweight — only fetches alerts. Used by the Whidbey Now bar. */
export async function fetchFerryBarStatus(): Promise<FerryBarData> {
  const { data: alerts, success } = await fetchAlerts();
  if (!success) return { mukilteoCliton: null, ptCoupeville: null };

  return {
    mukilteoCliton: { status: extractStatus(alerts, 7).status },
    ptCoupeville:   { status: extractStatus(alerts, 8).status },
  };
}

/** Full data — alerts + schedules. Used by the /ferry page and API route.
 *  Pass fresh=true to bypass the Next.js fetch data cache (used by client-polling API route). */
export async function fetchFerryPageData(fresh = false): Promise<FerryPageData> {
  const configured = isFerryConfigured();

  const lastUpdated = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  if (!configured) {
    return { mukilteoCliton: null, ptCoupeville: null, lastUpdated, configured: false };
  }

  const [{ data: alerts, success }, mukData, ptData] = await Promise.all([
    fetchAlerts(fresh),
    fetchScheduleData(7, fresh),
    fetchScheduleData(8, fresh),
  ]);

  if (!success) {
    return { mukilteoCliton: null, ptCoupeville: null, lastUpdated, configured: true };
  }

  const mukAlert = extractStatus(alerts, 7);
  const ptAlert  = extractStatus(alerts, 8);

  return {
    configured: true,
    lastUpdated,
    mukilteoCliton: {
      status:       mukAlert.status,
      alertText:    mukAlert.alertText,
      fromMainland: extractDepartures(mukData, 'Mukilteo', 6),
      fromWhidbey:  extractDepartures(mukData, 'Clinton', 6),
      lastUpdated,
    },
    ptCoupeville: {
      status:       ptAlert.status,
      alertText:    ptAlert.alertText,
      fromMainland: extractDepartures(ptData, 'Port Townsend', 6),
      fromWhidbey:  extractDepartures(ptData, 'Coupeville', 6),
      lastUpdated,
    },
  };
}
