import Link from 'next/link';
import { getLeadStory, type LeadStory } from '@/lib/lead-story';
import { categoryColors } from '@/lib/data';

const ACCENT_CLASSES: Record<LeadStory['accent'], string> = {
  amber:  'bg-amber-500',
  forest: 'bg-forest-600',
  sound:  'bg-sound-600',
};

const LABEL_CLASSES: Record<LeadStory['accent'], string> = {
  amber:  'bg-amber-100 text-amber-800',
  forest: 'bg-forest-100 text-forest-800',
  sound:  'bg-sound-100 text-sound-800',
};

export default async function LeadStoryCard() {
  const lead = await getLeadStory();
  if (!lead) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
      <Link href={lead.href} className="card-pressable group block">
        {/* Accent bar */}
        <div className={`h-1 ${ACCENT_CLASSES[lead.accent]}`} />

        <div className="p-6 sm:p-8">
          {/* Type label */}
          <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${LABEL_CLASSES[lead.accent]}`}>
            {lead.typeLabel}
          </span>

          {/* Title */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 group-hover:text-forest-600 transition-colors leading-tight mb-3">
            {lead.title}
          </h2>

          {/* Context line */}
          <p className="text-base text-stone-600 line-clamp-2 mb-4">
            {lead.subtitle}
          </p>

          {/* Category badge + read prompt */}
          <div className="flex items-center justify-between">
            {lead.category && (
              <span className={`badge ${categoryColors[lead.category] ?? 'bg-parchment-200 text-stone-700'}`}>
                {lead.category}
              </span>
            )}
            <span className="text-sm text-forest-600 group-hover:text-forest-800 transition-colors ml-auto">
              {lead.type === 'event' ? 'View event →' : lead.type === 'news' ? 'Read more →' : 'Join the conversation →'}
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}

/** Re-export the fetcher so page.tsx can get the lead story for downstream exclusions */
export { getLeadStory };
