import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/marketplace', SITE_URL));
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('listing_alerts')
      .delete()
      .eq('unsubscribe_token', token);

    if (error) {
      console.error('Unsubscribe error:', error);
    }

    // Redirect regardless — if the token was already used or invalid,
    // the user still ends up on a friendly page.
    return NextResponse.redirect(new URL('/marketplace/unsubscribed', SITE_URL));
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.redirect(new URL('/marketplace', SITE_URL));
  }
}
