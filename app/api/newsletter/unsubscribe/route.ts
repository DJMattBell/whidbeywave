import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

/** Generate an HMAC token for a given email — same logic used when building email links. */
export function unsubscribeToken(email: string): string {
  const secret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'whidbeywave';
  return createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex').slice(0, 32);
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const token = request.nextUrl.searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }

  const normalEmail = email.toLowerCase().trim();
  const expected = unsubscribeToken(normalEmail);

  if (token !== expected) {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', normalEmail);

    return NextResponse.redirect(new URL('/newsletter?unsubscribed=true', SITE_URL));
  } catch {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }
}
