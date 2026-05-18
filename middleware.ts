import { NextRequest, NextResponse } from 'next/server';

// ── Rate limiter ────────────────────────────────────────────────────────────
// Edge middleware on Vercel runs in a long-lived V8 isolate per region, so
// this Map persists across requests and provides real rate limiting without
// any external dependency. Not shared across regions, but more than adequate
// for a small community site.

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Periodically prune expired entries so the Map doesn't grow unbounded.
function pruneStore() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

function isAllowed(key: string, max: number, windowMs: number): boolean {
  // Prune once every ~500 checks to avoid O(n) cost on every request.
  if (Math.random() < 0.002) pruneStore();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}

// ── Route config ────────────────────────────────────────────────────────────
const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/events/submit':      { max: 3,  windowMs: 60 * 60 * 1000 },  // 3 / hour
  '/api/contact':            { max: 5,  windowMs: 60 * 60 * 1000 },  // 5 / hour
  '/api/newsletter':         { max: 3,  windowMs: 60 * 60 * 1000 },  // 3 / hour
  '/api/newsletter/resend':  { max: 2,  windowMs: 10 * 60 * 1000 },  // 2 / 10 min
  '/api/reviews':            { max: 10, windowMs: 60 * 60 * 1000 },  // 10 / hour
  '/api/forum/reply':        { max: 20, windowMs: 60 * 60 * 1000 },  // 20 / hour
  '/api/listings/submit':    { max: 5,  windowMs: 60 * 60 * 1000 },  // 5 / hour
  '/api/feedback':           { max: 5,  windowMs: 60 * 60 * 1000 },  // 5 / hour
  '/api/listings/contact':   { max: 10, windowMs: 60 * 60 * 1000 },  // 10 / hour
};

// ── Middleware ───────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  // Only rate-limit state-changing requests.
  if (request.method !== 'POST') return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  const limit = LIMITS[pathname];
  if (!limit) return NextResponse.next();

  // Best-effort IP extraction — Vercel always sets x-forwarded-for.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const key = `${ip}:${pathname}`;

  if (!isAllowed(key, limit.max, limit.windowMs)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests — please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/events/submit',
    '/api/contact',
    '/api/newsletter',
    '/api/newsletter/resend',
    '/api/reviews',
    '/api/forum/reply',
    '/api/listings/submit',
    '/api/feedback',
    '/api/listings/contact',
  ],
};
