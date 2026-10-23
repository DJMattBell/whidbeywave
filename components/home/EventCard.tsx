import Link from 'next/link';
import { formatShortDate, categoryColors } from '@/lib/data';
import { CATEGORY_EMOJI } from '@/lib/constants';
import AddToCalendar from '@/components/AddToCalendar';
import { Calendar, MapPin } from 'lucide-react';

// Category → stripe color for event cards (design-system palette)
const categoryStripeColors: Record<string, string> = {
  'Nature & Wildlife':     'bg-forest-600',
  'Arts & Culture':        'bg-sound-600',
  'Farmers Market':        'bg-amber-500',
  'Music & Performance':   'bg-sound-500',
  'Outdoors & Recreation': 'bg-forest-500',
  'Film & Media':          'bg-sound-400',
  'Community & Social':    'bg-forest-400',
  'Classes & Workshops':   'bg-sound-600',
  'Food & Drink':          'bg-amber-600',
  'Sports & Fitness':      'bg-forest-600',
  Other:                   'bg-stone-400',
};

export type EventCardEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  town: string;
  category: string;
  description: string | null;
};

export default function EventCard({ event }: { event: EventCardEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="card-pressable group flex flex-col min-h-[280px]">
      <div className={`h-1 ${categoryStripeColors[event.category] ?? 'bg-forest-600'}`} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${categoryColors[event.category] ?? 'bg-parchment-200 text-stone-700'}`}>
            {event.category}
          </span>
          <span className="text-2xl">{CATEGORY_EMOJI[event.category] ?? '📅'}</span>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-forest-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-stone-600 mb-1">
          <Calendar size={14} className="inline -mt-0.5 mr-1" aria-hidden="true" />
          <time dateTime={event.date}>{formatShortDate(event.date)}</time> · {event.time}
        </p>
        <p className="text-sm text-stone-600 mb-4"><MapPin size={14} className="inline -mt-0.5 mr-0.5 text-stone-400" aria-hidden="true" />{event.town}</p>
        <p className="text-base text-stone-600 line-clamp-2 mb-4">{event.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-parchment-200">
          <AddToCalendar
            event={{
              title:       event.title,
              date:        event.date,
              time:        event.time,
              location:    event.town,
              description: event.description ?? undefined,
            }}
          />
          <span className="text-sm text-forest-600 group-hover:text-forest-800 transition-colors shrink-0">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
