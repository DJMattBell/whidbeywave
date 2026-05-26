'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MarketplaceLocationFilter({
  locations,
  current,
}: {
  locations: string[];
  current?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function handleChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== 'All Locations') {
      next.set('location', value);
    } else {
      next.delete('location');
    }
    router.push(`/marketplace?${next.toString()}`);
  }

  return (
    <>
      <label htmlFor="marketplace-location" className="sr-only">Filter by location</label>
      <select
        id="marketplace-location"
        value={current ?? 'All Locations'}
        onChange={e => handleChange(e.target.value)}
        className="input-base w-full sm:w-auto"
      >
        {locations.map(loc => <option key={loc}>{loc}</option>)}
      </select>
    </>
  );
}
