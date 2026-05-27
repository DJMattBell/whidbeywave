import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Barter & Trade — WhidbeyWave',
  description: 'Trade, swap, and barter with your Whidbey Island neighbors. Got something to offer? Looking for something? This is the spot.',
  openGraph: {
    title: 'Barter & Trade — WhidbeyWave',
    description: 'Trade, swap, and barter with your Whidbey Island neighbors.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barter & Trade — WhidbeyWave',
    description: 'Trade, swap, and barter with your Whidbey Island neighbors.',
    images: ['/og-default.png'],
  },
};

export default function BarterPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-terra-600 font-medium mb-2 tracking-wide uppercase text-sm">Trade & Swap</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Barter & Trade
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            Got something to offer? Looking for something? This is the spot.
          </p>
        </div>
      </div>

      {/* Coming soon body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="text-7xl mb-6" aria-hidden="true">🤝</div>

        <h2
          className="text-3xl font-bold text-stone-800 mb-5"
        >
          Something good is coming
        </h2>

        <p className="text-stone-600 text-lg leading-relaxed mb-4 max-w-xl mx-auto">
          Islanders have always traded — eggs for firewood, a spare kayak for a cord of wood,
          babysitting for garden help. We&apos;re building a proper home for that.
        </p>

        <p className="text-stone-500 leading-relaxed mb-10 max-w-lg mx-auto">
          No money, no fees — just neighbors working things out.
          Let us know what you&apos;d like to see here.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/contact" className="btn-primary">
            Tell us what you need
          </Link>
          <Link href="/marketplace" className="btn-secondary">
            Browse Buy &amp; Sell instead →
          </Link>
        </div>

        <div className="mt-16 bg-parchment-100 rounded-2xl border border-parchment-300 p-8 text-left max-w-xl mx-auto">
          <h3 className="text-lg font-semibold text-stone-700 mb-3">
            What are we building?
          </h3>
          <ul className="space-y-2 text-stone-600 text-sm">
            <li className="flex gap-2"><span className="text-terra-500 shrink-0">✦</span> Post what you have to offer — skill, time, or stuff</li>
            <li className="flex gap-2"><span className="text-terra-500 shrink-0">✦</span> Post what you&apos;re looking for</li>
            <li className="flex gap-2"><span className="text-terra-500 shrink-0">✦</span> Connect directly — no middleman, no fees</li>
            <li className="flex gap-2"><span className="text-terra-500 shrink-0">✦</span> Island-only, neighbor-to-neighbor</li>
          </ul>
        </div>
      </div>
    </>
  );
}
