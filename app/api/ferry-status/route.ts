import { NextResponse } from 'next/server';
import { fetchFerryPageData } from '@/lib/ferry';

export const revalidate = 300; // 5 minutes

export async function GET() {
  const data = await fetchFerryPageData();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    },
  });
}
