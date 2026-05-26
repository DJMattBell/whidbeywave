'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface GuidesFilterProps {
  categories: string[];
}

export default function GuidesFilter({ categories }: GuidesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get('cat') || 'All';

  const setCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('cat');
    } else {
      params.set('cat', cat);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by category">
      <button
        onClick={() => setCategory('All')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
          active === 'All'
            ? 'bg-forest-700 text-parchment-50'
            : 'bg-parchment-100 text-stone-600 hover:bg-parchment-200'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
            active === cat
              ? 'bg-forest-700 text-parchment-50'
              : 'bg-parchment-100 text-stone-600 hover:bg-parchment-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
