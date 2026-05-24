import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/escapeHtml';
import { verifyCronRequest } from '@/lib/cronAuth';
import { scrapeWica } from '@/lib/scrapers/wica';
import { scrapeOakHarbor } from '@/lib/scrapers/oakharbor';
import { scrapeLangleyLibrary } from '@/lib/scrapers/langley-library';
import { scrapeCoupevilleLibrary } from '@/lib/scrapers/coupeville-library';
import { scrapeThirstyCrab } from '@/lib/scrapers/thirsty-crab';
import { scrapeWhidbeyTelecomEvents } from '@/lib/scrapers/whidbey-telecom';
import { scrapeLangleyWhaleCenter } from '@/lib/scrapers/langley-whale-center';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

/** Normalize a title for dedup comparison: lowercase, collapse whitespace, strip punctuation edges */
function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function sendAdminEmail(subject: string, html: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  try {
    await resend.emails.send({
      from: 'WhidbeyWave <hello@whidbeywave.com>',
      to: adminEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error('[scrape] failed to send admin email:', err);
  }
}

export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[scrape] SUPABASE_SERVICE_ROLE_KEY is not set — cannot run scraper');
    return NextResponse.json(
      { error: 'Supabase service role key not configured' },
      { status: 500 }
    );
  }

  // Per-source schedule: some scrapers only need to run monthly
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Whale Center only runs on the 1st of each month (events don't change often)
  const runWhaleCenter = dayOfMonth === 1;

  // Run all scrapers in parallel — each has its own 6s timeout; failures return []
  const [
    wicaEvents, oakHarborEvents,
    langleyLibEvents, coupevilleLibEvents,
    thirstyCrabEvents, whidbeyTelEvents, whaleCenterEvents,
  ] = await Promise.all([
    scrapeWica(),
    scrapeOakHarbor(),
    scrapeLangleyLibrary(),
    scrapeCoupevilleLibrary(),
    scrapeThirstyCrab(),
    scrapeWhidbeyTelecomEvents(),
    runWhaleCenter ? scrapeLangleyWhaleCenter() : Promise.resolve([]),
  ]);

  const candidates = [
    ...wicaEvents, ...oakHarborEvents,
    ...langleyLibEvents, ...coupevilleLibEvents,
    ...thirstyCrabEvents, ...whidbeyTelEvents, ...whaleCenterEvents,
  ];
  console.log(
    `[scrape] found ${candidates.length} candidate events — ` +
    `WICA:${wicaEvents.length} OakHarbor:${oakHarborEvents.length} ` +
    `LangleyLib:${langleyLibEvents.length} CoupevilleLib:${coupevilleLibEvents.length} ` +
    `ThirstyCrab:${thirstyCrabEvents.length} WhidbeyTel:${whidbeyTelEvents.length} ` +
    `WhaleCenter:${whaleCenterEvents.length}`
  );

  // If all scrapers returned empty, send a warning email
  if (candidates.length === 0) {
    await sendAdminEmail(
      'WhidbeyWave scraper found 0 events',
      `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;background:#fdfaf3;">
          <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;">🌊</span>
            <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
            <h2 style="color:#1c3d2c;margin:0 0 12px;font-size:18px;">Scraper ran but found 0 events</h2>
            <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0;">
              The nightly event scraper ran successfully but returned no events from any source.
              The sites may be blocking the scraper or their data structure has changed.
            </p>
          </div>
        </div>
      `
    );
    return NextResponse.json({ ok: true, found: 0, added: 0 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Dedup: fetch existing submissions from the last 90 days
  // Uses normalized title + date + source to catch duplicates even with
  // minor whitespace/casing differences between scrape runs
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: existing } = await supabase
    .from('event_submissions')
    .select('title, date, source')
    .gte('date', cutoff);

  const existingKeys = new Set(
    (existing ?? []).map((e: { title: string; date: string; source?: string }) =>
      `${normalizeTitle(e.title)}|${e.date}|${(e.source ?? '').toLowerCase()}`
    )
  );

  // Locations that no longer exist — skip events tied to them
  const blockedLocations = ['greenbank cidery'];

  const newEvents = candidates.filter(
    e =>
      !existingKeys.has(`${normalizeTitle(e.title)}|${e.date}|${e.source.toLowerCase()}`) &&
      !blockedLocations.some(bl => (e.location ?? '').toLowerCase().includes(bl))
  );

  if (newEvents.length > 0) {
    const rows = newEvents.map(e => ({
      title:           e.title,
      date:            e.date,
      time:            e.time ?? '',
      location:        e.location ?? '',
      town:            e.town,
      category:        e.category,
      description:     e.description,
      tags:            [] as string[],
      source:          e.source,
      submitter_name:  'Event Scraper',
      submitter_email: 'noreply@whidbeywave.com',
      status:          'pending',
    }));

    const { error } = await supabase.from('event_submissions').insert(rows);
    if (error) {
      console.error('[scrape] insert error:', error);
      return NextResponse.json(
        { error: 'DB insert failed' },
        { status: 500 }
      );
    }

    // Build event list rows for email
    const eventRows = newEvents.map(e => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfc8;font-weight:600;color:#1c3d2c;">${escapeHtml(e.title)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfc8;color:#57534e;">${escapeHtml(e.date)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfc8;color:#57534e;">${escapeHtml(e.town)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8dfc8;color:#888;font-size:13px;">${escapeHtml(e.source)}</td>
      </tr>
    `).join('');

    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com'}/admin/events`;

    await sendAdminEmail(
      `🌊 ${newEvents.length} new event${newEvents.length !== 1 ? 's' : ''} need${newEvents.length === 1 ? 's' : ''} your approval`,
      `
        <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:24px;background:#fdfaf3;">
          <div style="background:#1a4a33;padding:20px 28px;border-radius:12px 12px 0 0;">
            <span style="font-size:24px;">🌊</span>
            <span style="color:#fdfaf3;font-size:18px;font-weight:bold;margin-left:10px;">WhidbeyWave</span>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8dfc8;border-top:none;">
            <h2 style="color:#1c3d2c;margin:0 0 8px;font-size:20px;">
              ${newEvents.length} new event${newEvents.length !== 1 ? 's' : ''} need your approval
            </h2>
            <p style="color:#57534e;font-size:15px;line-height:1.7;margin:0 0 20px;">
              The nightly event scraper found <strong>${newEvents.length} new event${newEvents.length !== 1 ? 's' : ''}</strong>
              and added ${newEvents.length === 1 ? 'it' : 'them'} as pending submissions.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;background:#fdfaf3;border-radius:8px;overflow:hidden;border:1px solid #e8dfc8;">
              <thead>
                <tr style="background:#f0ebe0;">
                  <th style="padding:10px 12px;text-align:left;color:#57534e;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Event</th>
                  <th style="padding:10px 12px;text-align:left;color:#57534e;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Date</th>
                  <th style="padding:10px 12px;text-align:left;color:#57534e;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Town</th>
                  <th style="padding:10px 12px;text-align:left;color:#57534e;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Source</th>
                </tr>
              </thead>
              <tbody>${eventRows}</tbody>
            </table>
            <div style="margin-top:8px;">
              <a href="${adminUrl}" style="background:#255c42;color:#fdfaf3;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:bold;display:inline-block;">
                Review &amp; Approve Events →
              </a>
            </div>
            <p style="color:#a8a29e;font-size:13px;margin-top:20px;">
              Tap Approve or Reject for each one in the admin panel.
            </p>
          </div>
        </div>
      `
    );
  }

  console.log(`[scrape] added ${newEvents.length} new events (${candidates.length - newEvents.length} dupes skipped)`);
  return NextResponse.json({
    ok:    true,
    found: candidates.length,
    added: newEvents.length,
  });
}
