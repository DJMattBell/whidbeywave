'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function MarketplaceSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) {
        next.set('q', value.trim());
      } else {
        next.delete('q');
      }
      router.push(`/marketplace?${next.toString()}`);
    }, 300);
  }

  return (
    <div className="flex-1 relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true">🔍</span>
      <label htmlFor="marketplace-search" className="sr-only">Search listings</label>
      <input
        id="marketplace-search"
        type="search"
        defaultValue={defaultValue}
        onChange={e => handleChange(e.target.value)}
        placeholder="Search listings…"
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-parchment-300 focus:outline-none focus:ring-2 focus:ring-forest-400 text-sm bg-white text-stone-700 placeholder:text-stone-400"
      />
    </div>
  );
}
