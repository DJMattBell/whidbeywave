/**
 * User authentication helper for API routes that require a logged-in user.
 *
 * Extracts a Bearer token from the Authorization header, validates it against
 * Supabase Auth, and returns the authenticated user along with a Supabase
 * client scoped to that user's RLS permissions.
 *
 * Usage in an API route:
 *   const auth = await verifyUserRequest(request);
 *   if ('error' in auth) return auth.error;
 *   const { user, displayName, supabase } = auth;
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

type UserAuthOk = {
  user: User;
  displayName: string;
  supabase: SupabaseClient;
};

type UserAuthFail = {
  error: NextResponse;
};

export async function verifyUserRequest(
  request: NextRequest
): Promise<UserAuthOk | UserAuthFail> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'Anonymous';

  return { user, displayName, supabase };
}
