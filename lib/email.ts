/**
 * Shared email layout helpers.
 *
 * All transactional and digest emails share the same visual identity:
 * forest-green header, parchment body, Georgia serif font. These helpers
 * keep that consistent and reduce duplication across API routes.
 *
 * Colors reference (email-safe hex):
 *   forest header  = #1a4a33
 *   parchment bg   = #fdfaf3
 *   warm border    = #e8dfc8
 *   body text      = #57534e
 *   heading text   = #1c3d2c
 *   button bg      = #255c42
 *   muted text     = #a8a29e
 */

import { escapeHtml } from './escapeHtml';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

/** Full HTML email wrapper with header and footer. */
export function emailLayout(opts: {
  title?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  body: string;
  footerHtml?: string;
}): string {
  const {
    title = 'WhidbeyWave',
    headerTitle = '🌊 WhidbeyWave',
    headerSubtitle,
    body,
    footerHtml = `<p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.7;text-align:center;">
      <a href="${SITE_URL}" style="color:#255c42;text-decoration:none;">WhidbeyWave.com</a>
      &nbsp;&middot;&nbsp; Whidbey Island, WA
    </p>`,
  } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f0e2;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0e2;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(101,65,20,0.10);
                    overflow:hidden;width:100%;max-width:600px;">
        <tr>
          <td style="background:#1a4a33;padding:24px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#fdfaf3;">${escapeHtml(headerTitle)}</p>
            ${headerSubtitle ? `<p style="margin:5px 0 0;font-size:13px;color:#6b9e82;">${escapeHtml(headerSubtitle)}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#fdfaf3;border-top:1px solid #e8dfc8;padding:20px 32px;">
            ${footerHtml}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** A styled CTA button for emails. */
export function emailButton(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0">
  <tr><td style="background:#255c42;border-radius:10px;padding:12px 24px;">
    <a href="${escapeHtml(href)}" style="color:#fdfaf3;text-decoration:none;font-size:14px;font-weight:bold;">
      ${escapeHtml(label)}
    </a>
  </td></tr>
</table>`;
}

/** A card-style content block (parchment background, warm border). */
export function emailCard(innerHtml: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"
       style="background:#fdfaf3;border:1px solid #e8dfc8;border-radius:12px;margin-bottom:16px;">
  <tr><td style="padding:20px 24px;">${innerHtml}</td></tr>
</table>`;
}

// ── Reusable email templates ─────────────────────────────────────────

/** Newsletter signup confirmation email. */
export function emailConfirmation(opts: { firstName: string; confirmUrl: string }): string {
  return emailLayout({
    title: 'Confirm your subscription — WhidbeyWave',
    headerSubtitle: 'Newsletter Subscription',
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#57534e;line-height:1.7;">
        Hey ${escapeHtml(opts.firstName)} — thanks for signing up!
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#57534e;line-height:1.7;">
        Click below to confirm your subscription. Once confirmed, you'll start receiving our island updates.
      </p>
      ${emailButton(opts.confirmUrl, 'Confirm Subscription')}
      <p style="margin:24px 0 0;font-size:13px;color:#a8a29e;line-height:1.7;">
        If you didn't sign up, you can safely ignore this email.
      </p>
    `,
  });
}

/** Welcome email after confirmed signup. */
export function emailWelcome(opts: { firstName: string; unsubscribeUrl: string }): string {
  return emailLayout({
    title: 'Welcome to WhidbeyWave!',
    headerSubtitle: 'You\'re confirmed',
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#57534e;line-height:1.7;">
        Welcome aboard, ${escapeHtml(opts.firstName)}! You're now part of the WhidbeyWave community.
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#57534e;line-height:1.7;">
        Expect your first digest on Monday morning — island news, events, and community updates,
        curated by neighbors for neighbors.
      </p>
      ${emailButton(SITE_URL, 'Visit WhidbeyWave')}
    `,
    footerHtml: `<p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.7;text-align:center;">
      <a href="${SITE_URL}" style="color:#255c42;text-decoration:none;">WhidbeyWave.com</a>
      &nbsp;&middot;&nbsp;
      <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#a8a29e;text-decoration:underline;">Unsubscribe</a>
    </p>`,
  });
}

/** Content approval notification (events, listings, guides). */
export function emailApproval(opts: {
  type: 'event' | 'listing' | 'guide';
  title: string;
  viewUrl: string;
}): string {
  const typeLabel = opts.type === 'event' ? 'event' : opts.type === 'listing' ? 'listing' : 'guide';
  return emailLayout({
    title: `Your ${typeLabel} is live — WhidbeyWave`,
    headerSubtitle: `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} Approved`,
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#57534e;line-height:1.7;">
        Great news — your ${typeLabel} has been reviewed and is now live on WhidbeyWave!
      </p>
      ${emailCard(`
        <p style="margin:0;font-size:18px;font-weight:bold;color:#1c3d2c;">${escapeHtml(opts.title)}</p>
      `)}
      ${emailButton(opts.viewUrl, `View Your ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}`)}
    `,
  });
}

/** Forum reply notification. */
export function emailForumReply(opts: {
  postTitle: string;
  replierName: string;
  replyBody: string;
  threadUrl: string;
}): string {
  return emailLayout({
    title: 'New reply to your question — WhidbeyWave',
    headerSubtitle: 'Forum Reply',
    body: `
      <p style="margin:0 0 16px;font-size:16px;color:#57534e;line-height:1.7;">
        <strong style="color:#1c3d2c;">${escapeHtml(opts.replierName)}</strong> replied to your question:
      </p>
      ${emailCard(`
        <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#1c3d2c;">${escapeHtml(opts.postTitle)}</p>
        <p style="margin:0;font-size:14px;color:#57534e;line-height:1.6;">${escapeHtml(opts.replyBody)}</p>
      `)}
      ${emailButton(opts.threadUrl, 'View Thread')}
    `,
  });
}
