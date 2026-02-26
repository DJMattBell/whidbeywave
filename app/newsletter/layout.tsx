import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The WhidbeyWave Weekly Digest — Island News by Email',
  description:
    'Sign up for the WhidbeyWave newsletter — weekly island news, upcoming events, and community updates delivered to your inbox.',
  openGraph: {
    title: 'The WhidbeyWave Weekly Digest — Island News by Email',
    description: 'Weekly island news, upcoming events, and community updates from Whidbey Island.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The WhidbeyWave Weekly Digest',
    description: 'Weekly island news and events from Whidbey Island.',
    images: ['/og-default.png'],
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
