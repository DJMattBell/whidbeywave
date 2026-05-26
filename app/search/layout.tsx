import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search — WhidbeyWave',
  description:
    'Search events, news, marketplace listings, forum posts, and more across WhidbeyWave.',
  openGraph: {
    title: 'Search — WhidbeyWave',
    description: 'Search events, news, listings, and more on Whidbey Island.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search — WhidbeyWave',
    description: 'Search events, news, listings, and more on Whidbey Island.',
    images: ['/og-default.png'],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
