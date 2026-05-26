import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { timingSafeEqual } from 'crypto';
import { unsubscribeToken } from '@/lib/newsletter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const token = request.nextUrl.searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const expected = unsubscribeToken(normalEmail);

    // Use constant-time comparison to prevent timing attacks
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
    }

    const supabase = createServiceClient();

    await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', normalEmail);

    return NextResponse.redirect(new URL('/newsletter?unsubscribed=true', SITE_URL));
  } catch {
    return NextResponse.redirect(new URL('/newsletter?error=invalid', SITE_URL));
  }
}
