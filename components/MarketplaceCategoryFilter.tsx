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
        const isActive   = cat === active;
        const isFree     = cat === 'Free Stuff';
        const label      = isFree ? '🎁 Free Stuff' : cat;
        const activecls  = isFree
          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
          : 'bg-forest-600 text-parchment-50 border-forest-600 shadow-sm';
        const inactivecls = isFree
          ? 'bg-amber-50 text-amber-700 border-amber-300 hover:border-amber-400 hover:bg-amber-100'
          : 'bg-white text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-700';
        return (
          <button
            key={cat}
            type="button"
            onClick={() => handleSelect(cat)}
            className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors min-h-[44px] ${isActive ? activecls : inactivecls}`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
