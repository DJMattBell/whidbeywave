import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createServerClient } from '@/lib/supabase';
import { getResend } from '@/lib/resend';
import { unsubscribeUrl } from '@/lib/newsletter';
import { verifyCronRequest } from '@/lib/cronAuth';
import { CATEGORY_EMOJI } from '@/lib/constants';
import { escapeHtml } from '@/lib/escapeHtml';

const resend = getResend();


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

// ── Types ────────────────────────────────────────────────────

type Subscriber = {
  email: string;
  first_name: string;
};

type EventRow = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  town: string;
  category: string;
  description: string | null;
};

// ── Helpers ──────────────────────────────────────────────────

// CATEGORY_EMOJI is imported from @/lib/constants

function emojiFor(category: string) {
  return CATEGORY_EMOJI[category] ?? '📅';
}

/** Returns the ISO date strings for the coming Fri / Sat / Sun from a given date. */
function getWeekendDates(from: Date): { friday: string; saturday: string; sunday: string } {
  const day = from.getDay(); // 0 Sun … 4 Thu … 6 Sat
  const daysToFriday = ((5 - day + 7) % 7) || 7; // if already Fri → next Fri

  const friday   = new Date(from);
  friday.setDate(from.getDate() + daysToFriday);

  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);

  const sunday   = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  return {
    friday:   friday.toISOString().split('T')[0],
    saturday: saturday.toISOString().split('T')[0],
    sunday:   sunday.toISOString().split('T')[0],
  };
}

function formatDateLabel(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function formatShortDay(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
  });
}

function formatSubjectRange(friday: string, sunday: string) {
  const fri = new Date(friday + 'T12:00:00');
  const sun = new Date(sunday + 'T12:00:00');
  const friLabel = fri.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  // Only show month on Sunday if it differs from Friday
  const sunLabel = fri.getMonth() === sun.getMonth()
    ? sun.getDate().toString()
    : sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${friLabel}–${sunLabel}`;
}

// ── Email builder ────────────────────────────────────────────

function buildEventCard(ev: EventRow) {
  const emoji = emojiFor(ev.category);
  const desc  = ev.description
    ? `<p style="margin:6px 0 0;font-size:13px;color:#57534e;line-height:1.55;">${escapeHtml(ev.description)}</p>`
    : '';
  const locationLine = [ev.time, ev.location, ev.town].filter(Boolean).map(escapeHtml).join(' · ');

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#fdfaf3;border:1px solid #e8dfc8;border-radius:12px;margin-bottom:10px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0;font-size:15px;font-weight:bold;color:#1c3d2c;">
            ${emoji} ${escapeHtml(ev.title)}
          </p>
          <p style="margin:3px 0 0;font-size:12px;color:#9ca3af;line-height:1.4;">
            ${locationLine}
          </p>
          ${desc}
        </td>
      </tr>
    </table>`;
}

function buildDaySection(dayLabel: string, events: EventRow[]) {
  if (events.length === 0) return '';

  const cards = events.map(buildEventCard).join('');
  return `
    <tr>
      <td style="padding:18px 36px 4px;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:bold;text-transform:uppercase;
                  letter-spacing:0.1em;color:#255c42;border-bottom:1px solid #e8dfc8;padding-bottom:6px;">
          ${dayLabel}
        </p>
        ${cards}
      </td>
    </tr>`;
}

function buildWeekendHtml(
  sub: Subscriber,
  events: EventRow[],
  friday: string,
  saturday: string,
  sunday: string,
) {
  const range     = formatSubjectRange(friday, sunday);
  const introDate = `${formatDateLabel(friday)} – ${new Date(sunday + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

  const fridayEvents   = events.filter(e => e.date === friday);
  const saturdayEvents = events.filter(e => e.date === saturday);
  const sundayEvents   = events.filter(e => e.date === sunday);

  const hasEvents = events.length > 0;

  const eventsBody = hasEvents
    ? `
      ${buildDaySection(formatShortDay(friday),   fridayEvents)}
      ${buildDaySection(formatShortDay(saturday), saturdayEvents)}
      ${buildDaySection(formatShortDay(sunday),   sundayEvents)}
      <tr>
        <td style="padding:8px 36px 16px;">
          <a href="${SITE_URL}/events"
             style="font-size:13px;color:#255c42;font-weight:bold;text-decoration:none;">
            See all upcoming events →
          </a>
        </td>
      </tr>`
    : `
      <tr>
        <td style="padding:16px 36px 32px;">
          <div style="background:#fdfaf3;border:1px solid #e8dfc8;border-radius:14px;padding:28px;text-align:center;">
            <p style="margin:0 0 6px;font-size:32px;">🌊</p>
            <p style="margin:0;font-size:15px;color:#57534e;line-height:1.6;">
              A quiet weekend on the island — perfect for a walk on the beach.
            </p>
            <p style="margin:12px 0 0;">
              <a href="${SITE_URL}/events"
                 style="font-size:13px;color:#255c42;font-weight:bold;text-decoration:none;">
                Check the calendar for anything new →
              </a>
            </p>
          </div>
        </td>
      </tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>This Weekend on Whidbey</title>
</head>
<body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(101,65,20,0.10);overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:#1a4a33;padding:28px 36px;">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#fdfaf3;">
              🌊 Your Whidbey Weekend
            </p>
            <p style="margin:5px 0 0;font-size:13px;color:#6b9e82;">
              ${introDate}
            </p>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:28px 36px 8px;">
            <p style="margin:0;font-size:16px;color:#1c3d2c;line-height:1.65;">
              Hi <strong>${escapeHtml(sub.first_name)}</strong> —
              here&rsquo;s what&rsquo;s happening around the island this weekend.
            </p>
          </td>
        </tr>

        <!-- Events by day -->
        ${eventsBody}

        <!-- Divider -->
        <tr><td style="padding:4px 36px 20px;">
          <div style="height:1px;background:#e8dfc8;"></div>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fdfaf3;border-top:1px solid #e8dfc8;padding:20px 36px;">
            <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.7;text-align:center;">
              You&rsquo;re receiving this weekend digest because you signed up at
              <a href="${SITE_URL}" style="color:#255c42;text-decoration:none;">WhidbeyWave.com</a>.
              &nbsp;&middot;&nbsp; Whidbey Island, WA
              &nbsp;&middot;&nbsp;
              <a href="${unsubscribeUrl(sub.email)}" style="color:#255c42;text-decoration:none;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Route handler ────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const supabaseAdmin = createServiceClient();
  const supabaseAnon = createServerClient();

  // Determine the coming Friday–Sunday
  const { friday, saturday, sunday } = getWeekendDates(new Date());

  // Fetch weekend events
  const { data: events } = await supabaseAnon
    .from('event_submissions')
    .select('id, title, date, time, location, town, category, description')
    .eq('status', 'approved')
    .gte('date', friday)
    .lte('date', sunday)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  const weekendEvents = (events ?? []) as EventRow[];

  // Fetch opted-in confirmed subscribers
  const { data: subscribers, error: subError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, first_name')
    .eq('confirmed', true)
    .eq('weekend_digest', true)
    .order('created_at', { ascending: true });

  if (subError) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, total: 0, events: weekendEvents.length });
  }

  const subject = `This Weekend on Whidbey 🌊 ${formatSubjectRange(friday, sunday)}`;

  // Send in chunks of 10
  const CHUNK_SIZE = 10;
  let sent   = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
    const chunk   = (subscribers as Subscriber[]).slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(sub =>
        resend.emails.send({
          from:    'WhidbeyWave <hello@whidbeywave.com>',
          to:      sub.email,
          subject,
          html:    buildWeekendHtml(sub, weekendEvents, friday, saturday, sunday),
        })
      )
    );
    results.forEach(r => (r.status === 'fulfilled' ? sent++ : failed++));
    if (i + CHUNK_SIZE < subscribers.length) await new Promise(r => setTimeout(r, 1000));
  }

  return NextResponse.json({
    ok: true, sent, failed, total: subscribers.length, events: weekendEvents.length,
  });
}
