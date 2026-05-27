import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/lib/userAuth';
import { createServiceClient } from '@/lib/supabase';
import { isWhidbeyLocal } from '@/lib/whidbey-zips';
import { SUPPORTED_FERRY_TERMINALS } from '@/lib/ferry';
import { notifyAll } from '@/lib/notifications';

const VALID_DIRECTIONS = ['departing', 'arriving'] as const;
const VALID_WAIT_MINUTES = [0, 15, 30, 45, 60, 90, 120] as const;
const RATE_LIMIT_MINUTES = 10;
const AUTO_FLAG_WINDOW_MINUTES = 3;
const AUTO_FLAG_THRESHOLD = 60;
const HIGH_WAIT_NOTIFY_THRESHOLD = 45;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

function directionLabel(terminal: string, direction: string): string {
  const isIslandSide = terminal === 'Clinton';
  if (direction === 'departing') {
    return isIslandSide ? 'heading to the mainland' : 'heading to Whidbey';
  }
  return isIslandSide ? 'coming back to Whidbey' : 'arriving on the mainland';
}

/** POST — submit a ferry wait report */
export async function POST(request: NextRequest) {
  const auth = await verifyUserRequest(request);
  if ('error' in auth) return auth.error;

  let terminal: string, direction: string, wait_minutes: number;
  try {
    const json = await request.json();
    terminal = json.terminal;
    direction = json.direction;
    wait_minutes = json.wait_minutes;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate
  if (!(SUPPORTED_FERRY_TERMINALS as readonly string[]).includes(terminal)) {
    return NextResponse.json({ error: `Terminal must be one of: ${SUPPORTED_FERRY_TERMINALS.join(', ')}` }, { status: 400 });
  }
  if (!VALID_DIRECTIONS.includes(direction as typeof VALID_DIRECTIONS[number])) {
    return NextResponse.json({ error: 'Direction must be departing or arriving' }, { status: 400 });
  }
  if (!VALID_WAIT_MINUTES.includes(wait_minutes as typeof VALID_WAIT_MINUTES[number])) {
    return NextResponse.json({ error: 'Wait minutes must be 0, 15, 30, 45, 60, 90, or 120' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Rate limit: one report per user per terminal per 10 minutes
  const rateLimitCutoff = new Date(Date.now() - RATE_LIMIT_MINUTES * 60_000).toISOString();
  const { data: recentReports } = await supabase
    .from('ferry_wait_reports')
    .select('id')
    .eq('reporter_id', auth.user.id)
    .eq('terminal', terminal)
    .gte('created_at', rateLimitCutoff)
    .limit(1);

  if (recentReports && recentReports.length > 0) {
    return NextResponse.json(
      { error: 'You already reported at this terminal recently. Wait a few minutes.' },
      { status: 429 }
    );
  }

  // Compute is_local
  const reporterZip = auth.user.user_metadata?.zip ?? null;
  const local = isWhidbeyLocal(reporterZip);

  // Insert the report
  const { data: report, error: insertError } = await supabase
    .from('ferry_wait_reports')
    .insert({
      terminal,
      direction,
      wait_minutes,
      reporter_id: auth.user.id,
      reporter_zip: reporterZip,
      is_local: local,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }

  // Auto-flag heuristic: check for >60min discrepancy with another LOCAL report
  // in the same terminal+direction within the last 3 minutes
  const autoFlagCutoff = new Date(Date.now() - AUTO_FLAG_WINDOW_MINUTES * 60_000).toISOString();
  const { data: nearbyReports } = await supabase
    .from('ferry_wait_reports')
    .select('wait_minutes')
    .eq('terminal', terminal)
    .eq('direction', direction)
    .eq('is_local', true)
    .eq('flagged', false)
    .neq('id', report.id)
    .gte('created_at', autoFlagCutoff)
    .limit(5);

  let wasAutoFlagged = false;
  if (nearbyReports && nearbyReports.length > 0) {
    const hasDiscrepancy = nearbyReports.some(
      r => Math.abs(r.wait_minutes - wait_minutes) > AUTO_FLAG_THRESHOLD
    );
    if (hasDiscrepancy) {
      await supabase
        .from('ferry_wait_reports')
        .update({ flagged: true, flag_reason: 'auto: large discrepancy with recent local report' })
        .eq('id', report.id);
      wasAutoFlagged = true;
    }
  }

  // Only push for meaningful wait reports; don't notify on "no wait" or short waits,
  // and don't notify on auto-flagged reports (likely false/griefing)
  if (wait_minutes >= HIGH_WAIT_NOTIFY_THRESHOLD && !wasAutoFlagged) {
    try {
      const label = directionLabel(terminal, direction);
      await notifyAll('ferry_high_wait_at_my_terminal', {
        terminal,
        direction,
        directionLabel: label,
        wait_minutes: String(wait_minutes),
        pushTitle: `Ferry wait at ${terminal}`,
        pushBody: `${wait_minutes}-min wait ${label}, reported just now`,
        url: `${SITE_URL}/ferry`,
      });
    } catch {
      // Non-fatal — report still saved
    }
  }

  return NextResponse.json({ report }, { status: 201 });
}

/** GET — fetch recent non-flagged reports (public, no auth) */
export async function GET() {
  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - 90 * 60_000).toISOString();

  const { data, error } = await supabase
    .from('ferry_wait_reports')
    .select('id, terminal, direction, wait_minutes, is_local, created_at, flagged')
    .eq('flagged', false)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}
