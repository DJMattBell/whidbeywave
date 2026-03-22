// #5 Skeleton Loading States — reusable pulsing placeholders

export function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-3 bg-parchment-200 rounded-full w-20 mb-3" />
      <div className="h-5 bg-parchment-200 rounded-full w-3/4 mb-2" />
      <div className="h-3 bg-parchment-200 rounded-full w-1/2 mb-2" />
      <div className="h-3 bg-parchment-200 rounded-full w-full mb-2" />
      <div className="h-3 bg-parchment-200 rounded-full w-2/3" />
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="card flex flex-col md:flex-row animate-pulse">
      <div className="md:w-36 bg-parchment-200 h-24 md:h-auto rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" />
      <div className="flex-1 p-6">
        <div className="flex gap-2 mb-3">
          <div className="h-5 bg-parchment-200 rounded-full w-24" />
          <div className="h-5 bg-parchment-200 rounded-full w-16" />
        </div>
        <div className="h-5 bg-parchment-200 rounded-full w-3/4 mb-3" />
        <div className="h-3 bg-parchment-200 rounded-full w-1/3 mb-2" />
        <div className="h-3 bg-parchment-200 rounded-full w-full mb-2" />
        <div className="h-3 bg-parchment-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 bg-parchment-200 rounded-xl shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-parchment-200 rounded-full w-3/4 mb-2" />
        <div className="h-3 bg-parchment-200 rounded-full w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEventCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonFeed({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}
