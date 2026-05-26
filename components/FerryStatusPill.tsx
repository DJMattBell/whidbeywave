// #17 Ferry Status Persistent Pill — server component
// Shows color-coded ferry status at a glance

import { fetchFerryBarStatus } from '@/lib/ferry';
import type { RouteStatus } from '@/lib/ferry';
import Link from 'next/link';

export default async function FerryStatusPill() {
  let data;
  try {
    data = await fetchFerryBarStatus();
  } catch {
    return null;
  }

  if (!data) return null;

  const routes = [data.mukilteoClinton, data.ptCoupeville].filter(Boolean);
  if (routes.length === 0) return null;

  // Determine worst status across routes
  const statuses: RouteStatus[] = routes.map(r => r!.status);
  const worst: RouteStatus = statuses.includes('cancelled')
    ? 'cancelled'
    : statuses.includes('delays')
    ? 'delays'
    : 'on-schedule';

  const dotColor =
    worst === 'cancelled' ? 'bg-red-500' :
    worst === 'delays' ? 'bg-amber-500' :
    'bg-emerald-500';

  const label =
    worst === 'cancelled' ? 'Ferry issues' :
    worst === 'delays' ? 'Ferry delays' :
    'Ferries on time';

  return (
    <Link
      href="/ferry"
      className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment-100 border border-parchment-200 text-xs font-medium text-stone-600 hover:bg-forest-50 hover:border-forest-300 transition-colors min-h-[32px]"
    >
      <span className={`w-2 h-2 rounded-full ${dotColor} ${worst !== 'on-schedule' ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </Link>
  );
}
