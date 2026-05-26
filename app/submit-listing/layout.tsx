import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a Listing — WhidbeyWave Marketplace',
  description:
    'List something for sale, for free, or wanted on the Whidbey Island community marketplace.',
  openGraph: {
    title: 'Post a Listing — WhidbeyWave Marketplace',
    description: 'List something for sale, for free, or wanted on the Whidbey Island marketplace.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post a Listing — WhidbeyWave Marketplace',
    description: 'List something for sale or wanted on the Whidbey Island marketplace.',
    images: ['/og-default.png'],
  },
};

export default function SubmitListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
