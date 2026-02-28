'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { MARKETPLACE_CATEGORIES as CATEGORIES } from '@/lib/marketplace';

export { CATEGORIES };

export default function MarketplaceCategoryFilter({ current }: { current?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = current ?? 'All';

  function handleSelect(cat: string) {
    const next = new URLSearchParams(params.toString());
    if (cat === 'All') {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    router.push(`/marketplace?${next.toString()}`);
  }

  return (
    <div
      className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
      role="group"
      aria-label="Filter by category"
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => handleSelect(cat)}
            className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors min-h-[44px] ${
              isActive
                ? 'bg-forest-600 text-parchment-50 border-forest-600 shadow-sm'
                : 'bg-white text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-700'
            }`}
            aria-pressed={isActive}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
