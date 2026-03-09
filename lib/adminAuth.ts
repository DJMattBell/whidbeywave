import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

type AdminOk = { email: string };
type AdminFail = { error: NextResponse };

/**
 * Verifies that the incoming request carries a valid Supabase JWT for the
 * configured admin email. Uses ADMIN_EMAIL (private) — never the public var.
 *
 * Usage in an API route:
 *   const auth = await verifyAdminRequest(request);
 *   if ('error' in auth) return auth.error;
 */
export async function verifyAdminRequest(
  request: NextRequest
): Promise<AdminOk | AdminFail> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL env var is not set');
    return { error: NextResponse.json({ error: 'Server misconfigured' }, { status: 500 }) };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (user.email !== adminEmail) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { email: user.email };
}
