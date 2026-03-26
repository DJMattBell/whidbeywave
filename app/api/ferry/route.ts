import { NextResponse } from 'next/server';
import { fetchFerryPageData } from '@/lib/ferry';

// Client-side polling endpoint — no caching, always fresh
export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchFerryPageData();
  return NextResponse.json(data);
}
