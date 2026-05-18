/**
 * Cron job authentication for Vercel-triggered endpoints.
 *
 * Accepts either the `x-vercel-cron` header (set automatically by Vercel Cron)
 * or a Bearer token matching CRON_SECRET (for manual/test invocations).
 *
 * Usage in an API route:
 *   const authError = verifyCronRequest(request);
 *   if (authError) return authError;
 */

import { NextRequest, NextResponse } from 'next/server';

export function verifyCronRequest(request: NextRequest): NextResponse | null {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const cronSecret = process.env.CRON_SECRET;
  const hasValidSecret =
    cronSecret &&
    request.headers.get('authorization') === `Bearer ${cronSecret}`;

  if (!isVercelCron && !hasValidSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // authorized
}
