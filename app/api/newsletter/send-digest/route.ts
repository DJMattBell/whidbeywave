import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { newsPosts } from '@/lib/data';

const resend = new Resend(process.env.RESEND_API_KEY);
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
  town: string;
  emoji?: string;
};

type ForumPostRow = {
  id: string;
  title: string;
  reply_count: number;
};

// ── Helpers ──────────────────────────────────────────────────

function mondayDateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function shortMonth(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' });
}

function dayNum(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').getDate();
}

// ── Email builder ────────────────────────────────────────────

function buildDigestHtml(
  sub: Subscriber,
  events: EventRow[],
  forumPosts: ForumPostRow[],
) {
  const dateLabel = mondayDateLabel();
  const newsItems = newsPosts.slice(0, 2);

  const eventsSection = events.length === 0
    ? `<p style="font-size:14px;color:#9ca3af;font-style:italic;">
        No upcoming events this week —
        <a href="${SITE_URL}/events" style="color:#255c42;">check the calendar</a> for anything new.
       </p>`
    : events.map(ev => `
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#fdfaf3;border:1px solid #e8dfc8;border-radius:12px;margin-bottom:10px;">
          <tr>
            <td style="width:52px;padding:12px 0 12px 16px;vertical-align:top;">
              <div style="background:#255c42;border-radius:8px;width:44px;text-align:center;padding:6px 0;">
                <div style="font-size:10px;font-weight:bold;text-transform:uppercase;color:#6b9e82;letter-spacing:0.05em;">
                  ${shortMonth(ev.date)}
                </div>
                <div style="font-size:20px;font-weight:900;color:#fdfaf3;line-height:1;">
                  ${dayNum(ev.date)}
                </div>
              </div>
            </td>
            <td style="padding:12px 16px;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:15px;font-weight:bold;color:#1c3d2c;">
                ${ev.emoji ?? '📅'} ${ev.title}
              </p>
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                ${ev.time}${ev.town ? ' · ' + ev.town : ''}
              </p>
            </td>
          </tr>
        </table>
      `).join('');

  const newsSection = newsItems.map(n => `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f0f7ff;border:1px solid #c7dff7;border-radius:12px;margin-bottom:10px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#1c3d2c;">
            ${n.emoji} ${n.title}
          </p>
          <p style="margin:0;font-size:13px;color:#57534e;line-height:1.5;">
            ${n.excerpt}
          </p>
        </td>
      </tr>
    </table>
  `).join('');

  const forumSection = forumPosts.length === 0
    ? `<p style="font-size:14px;color:#9ca3af;font-style:italic;">
        Nothing active this week —
        <a href="${SITE_URL}/forum" style="color:#255c42;">be the first to ask</a>.
       </p>`
    : forumPosts.map(p => `
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border:1px solid #e8dfc8;border-radius:12px;margin-bottom:10px;">
          <tr>
            <td style="padding:14px 20px;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#1c3d2c;">
                <a href="${SITE_URL}/forum/${p.id}" style="color:#1c3d2c;text-decoration:none;">
                  ${p.title}
                </a>
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                ${p.reply_count} ${p.reply_count === 1 ? 'reply' : 'replies'}
              </p>
            </td>
          </tr>
        </table>
      `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(101,65,20,0.10);overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:#1a4a33;padding:28px 36px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#fdfaf3;">
              🌊 WhidbeyWave Weekly
            </p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b9e82;">
              ${dateLabel}
            </p>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:32px 36px 16px;">
            <p style="margin:0;font-size:17px;color:#1c3d2c;line-height:1.6;">
              Good morning, <strong>${sub.first_name}</strong>.
              Here&rsquo;s what&rsquo;s worth knowing on Whidbey this week.
            </p>
          </td>
        </tr>

        <!-- Events -->
        <tr>
          <td style="padding:16px 36px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:bold;text-transform:uppercase;
                      letter-spacing:0.1em;color:#255c42;">
              📅 &nbsp;Coming Up
            </p>
            ${eventsSection}
            <p style="margin:12px 0 0;">
              <a href="${SITE_URL}/events" style="font-size:13px;color:#255c42;font-weight:bold;text-decoration:none;">
                See all events →
              </a>
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:8px 36px;">
          <div style="height:1px;background:#e8dfc8;"></div>
        </td></tr>

        <!-- News -->
        <tr>
          <td style="padding:16px 36px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:bold;text-transform:uppercase;
                      letter-spacing:0.1em;color:#255c42;">
              📰 &nbsp;Worth Knowing
            </p>
            ${newsSection}
            <p style="margin:12px 0 0;">
              <a href="${SITE_URL}/news" style="font-size:13px;color:#255c42;font-weight:bold;text-decoration:none;">
                Read more →
              </a>
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:8px 36px;">
          <div style="height:1px;background:#e8dfc8;"></div>
        </td></tr>

        <!-- Forum -->
        <tr>
          <td style="padding:16px 36px 32px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:bold;text-transform:uppercase;
                      letter-spacing:0.1em;color:#255c42;">
              💬 &nbsp;On the Forum
            </p>
            ${forumSection}
            <p style="margin:12px 0 0;">
              <a href="${SITE_URL}/forum" style="font-size:13px;color:#255c42;font-weight:bold;text-decoration:none;">
                Join the conversation →
              </a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fdfaf3;border-top:1px solid #e8dfc8;padding:20px 36px;">
            <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.6;text-align:center;">
              You&rsquo;re receiving this because you signed up at
              <a href="${SITE_URL}" style="color:#255c42;text-decoration:none;">WhidbeyWave.com</a>.
              Whidbey Island, WA &nbsp;&middot;&nbsp;
              <a href="${SITE_URL}/newsletter" style="color:#255c42;text-decoration:none;">Unsubscribe</a>
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
  // Security: allow Vercel cron invocations OR requests with the CRON_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const cronSecret   = process.env.CRON_SECRET;
  const hasValidSecret =
    cronSecret &&
    request.headers.get('authorization') === `Bearer ${cronSecret}`;

  if (!isVercelCron && !hasValidSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    );
  }

  // Admin client bypasses RLS — used only to read confirmed subscribers
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Anon client for public data (events, forum posts)
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch confirmed subscribers
  const { data: subscribers, error: subError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, first_name')
    .eq('confirmed', true)
    .order('created_at', { ascending: true });

  if (subError) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, total: 0 });
  }

  // Fetch upcoming approved events (next 14 days)
  const today = new Date().toISOString().split('T')[0];
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: events } = await supabaseAnon
    .from('event_submissions')
    .select('id, title, date, time, town, category')
    .eq('status', 'approved')
    .gte('date', today)
    .lte('date', twoWeeks)
    .order('date', { ascending: true })
    .limit(5);

  // Fetch recent active forum posts
  const { data: forumPosts } = await supabaseAnon
    .from('forum_posts')
    .select('id, title, reply_count')
    .gt('reply_count', 0)
    .order('updated_at', { ascending: false })
    .limit(3);

  const upcomingEvents = (events ?? []) as EventRow[];
  const activeForumPosts = (forumPosts ?? []) as ForumPostRow[];

  // Send in chunks of 10 to respect rate limits
  const CHUNK_SIZE = 10;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
    const chunk = (subscribers as Subscriber[]).slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(sub =>
        resend.emails.send({
          from: 'WhidbeyWave <hello@whidbeywave.com>',
          to: sub.email,
          subject: `WhidbeyWave Weekly — ${mondayDateLabel()}`,
          html: buildDigestHtml(sub, upcomingEvents, activeForumPosts),
        })
      )
    );
    results.forEach(r => (r.status === 'fulfilled' ? sent++ : failed++));
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
}
