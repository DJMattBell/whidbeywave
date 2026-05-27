import Link from 'next/link';
import { Suspense } from 'react';
import HeroDataStrip from './HeroDataStrip';

/*
 * Hero section — gradient placeholder, photo-ready.
 *
 * To add a hero photo later:
 *   1. Add an optimized image to /public/images/hero/ (WebP or AVIF, ≤200KB, ~1600×900)
 *   2. Pass heroSrc="/images/hero/your-photo.webp" to this component
 *   3. The gradient becomes a dark scrim overlay via the existing overlay div
 *   4. Use next/image with priority, sizes="100vw", fill, object-cover
 *
 * No other changes needed — the text is already white-on-dark.
 */

function getGreeting(): string {
  const hour = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'America/Los_Angeles',
  });
  const h = parseInt(hour, 10);
  if (h < 12) return 'Good morning, Whidbey';
  if (h < 17) return 'Good afternoon, Whidbey';
  return 'Good evening, Whidbey';
}

export default function HeroSection() {
  const greeting = getGreeting();

  return (
    <section className="relative h-[200px] md:h-[300px] bg-gradient-to-br from-forest-700 via-forest-600 to-sound-600 overflow-hidden">
      {/* Overlay — becomes a scrim when a photo is added */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pb-5">
        <p className="text-sm text-parchment-200 mb-2">{greeting}</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 text-parchment-50">
          Your island, at a glance
        </h1>
        <Link
          href="/events"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base
                     bg-parchment-50 text-forest-800 font-semibold rounded-lg
                     hover:bg-parchment-100 transition-all duration-200
                     shadow-warm hover:shadow-warm-md hover:-translate-y-0.5 active:translate-y-0
                     min-h-[44px]"
        >
          See What&apos;s On
        </Link>
      </div>

      {/* At-a-glance data strip — pinned to bottom edge */}
      <Suspense fallback={null}>
        <HeroDataStrip />
      </Suspense>
    </section>
  );
}
