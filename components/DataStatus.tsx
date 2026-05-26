'use client';

type DataState = 'live' | 'cached' | 'on-island-time';

type DataStatusProps = {
  state: DataState;
  label: string;
  lastUpdated?: Date | string | null;
};

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}

export default function DataStatus({ state, label, lastUpdated }: DataStatusProps) {
  const updatedDate = lastUpdated
    ? (typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated)
    : null;

  const dotColor =
    state === 'live' ? 'bg-forest-700' :
    state === 'cached' ? 'bg-amber-600' :
    'bg-terra-600';

  const caption =
    state === 'live' ? 'Live' :
    state === 'cached' && updatedDate ? `Updated ${formatTime(updatedDate)}` :
    'On Island Time';

  return (
    <div
      className="inline-flex items-center gap-1.5 text-xs text-stone-500 opacity-70"
      title={`${label} — ${caption}${updatedDate ? ` (${relativeTime(updatedDate)})` : ''}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${state === 'on-island-time' ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      <span>{caption}</span>
    </div>
  );
}
