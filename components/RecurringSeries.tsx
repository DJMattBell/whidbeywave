import Link from 'next/link';

type SiblingEvent = { id: string; date: string };

function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export default function RecurringSeries({
  events,
  currentDate,
}: {
  events: SiblingEvent[];
  currentDate: string;
}) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <h3
        className="text-base font-semibold text-amber-900 mb-1"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        This event repeats
      </h3>
      <p className="text-sm text-amber-700 mb-3">
        You&apos;re viewing the {formatShortDate(currentDate)} date. It also happens on:
      </p>
      <div className="flex flex-wrap gap-2">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/events/${e.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-full text-sm font-medium text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-colors"
          >
            <span className="text-amber-500">📅</span>
            {formatShortDate(e.date)}
          </Link>
        ))}
      </div>
    </div>
  );
}
