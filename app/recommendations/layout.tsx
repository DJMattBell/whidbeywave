import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Picks — Neighbor-Recommended Businesses on Whidbey Island',
  description:
    'Honest recommendations from Whidbey Island locals. Find the best restaurants, contractors, farms, shops, and services — rated and reviewed by your neighbors.',
  openGraph: {
    title: 'Local Picks — Neighbor-Recommended Businesses on Whidbey Island',
    description: 'Honest recommendations from Whidbey Island locals — rated and reviewed by your neighbors.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local Picks — Whidbey Island Business Recommendations',
    description: 'Honest recommendations from Whidbey Island locals.',
    images: ['/og-default.png'],
  },
};

export default function RecommendationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
