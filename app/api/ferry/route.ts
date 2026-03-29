import { NextResponse } from 'next/server';
import { fetchFerryPageData } from '@/lib/ferry';

// Client-side polling endpoint — always fresh data
export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchFerryPageData(true);
  return NextResponse.json(data);
}
