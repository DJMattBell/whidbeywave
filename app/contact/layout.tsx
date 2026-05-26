import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — WhidbeyWave',
  description:
    'Get in touch with the WhidbeyWave team. Questions, tips, feedback, or story ideas — we\'d love to hear from you.',
  openGraph: {
    title: 'Contact Us — WhidbeyWave',
    description: 'Get in touch with the WhidbeyWave team — questions, tips, feedback, or story ideas.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — WhidbeyWave',
    description: 'Get in touch with the WhidbeyWave team.',
    images: ['/og-default.png'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
