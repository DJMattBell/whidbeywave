import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit an Event — WhidbeyWave',
  description:
    'Share your Whidbey Island event with the community. Submit concerts, markets, workshops, fundraisers, and more.',
  openGraph: {
    title: 'Submit an Event — WhidbeyWave',
    description: 'Share your Whidbey Island event with the community.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit an Event — WhidbeyWave',
    description: 'Share your Whidbey Island event with the community.',
    images: ['/og-default.png'],
  },
};

export default function SubmitEventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
