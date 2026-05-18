import { NextResponse } from 'next/server';
import { fetchFerryPageData } from '@/lib/ferry';

export const revalidate = 60;

export async function GET() {
  try {
    const data = await fetchFerryPageData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch {
    return NextResponse.json({ schedules: [], alerts: [] }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  }
}
