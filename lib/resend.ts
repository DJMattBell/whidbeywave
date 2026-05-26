import { Resend } from 'resend';

let _resend: Resend | null = null;

/**
 * Returns a Resend instance, lazy-initialized and cached.
 * Safe to call at module scope — only logs a warning if key is missing.
 * Actual sends will fail with an auth error from Resend's API.
 */
export function getResend(): Resend {
  if (_resend) return _resend;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[resend] RESEND_API_KEY is not configured — email sends will fail');
  }

  _resend = new Resend(key ?? '');
  return _resend;
}
