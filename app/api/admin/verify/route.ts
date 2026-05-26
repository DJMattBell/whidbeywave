import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/admin/verify
 * Verifies that the caller's Supabase JWT belongs to the configured admin.
 * Uses server-side ADMIN_EMAIL — never exposed to the client bundle.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL env var is not set');
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }

  const supabase = createServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  return NextResponse.json({ isAdmin: user.email === adminEmail });
}
