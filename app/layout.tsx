import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: {
    default: 'WhidbeyWave.com – Whidbey Island Events, News & Marketplace',
    template: '%s | WhidbeyWave.com',
  },
  description:
    'Your local guide to Whidbey Island. Discover events, read the latest news, browse the marketplace, and connect with the community.',
  keywords: [
    'Whidbey Island events',
    'Whidbey Island news',
    'Whidbey Island marketplace',
    'Whidbey Island community',
    'Oak Harbor events',
    'Langley WA',
    'Coupeville events',
  ],
  alternates: {
    types: {
      'application/rss+xml': 'https://whidbeywave.com/feed.xml',
    },
  },
  openGraph: {
    title: 'WhidbeyWave.com – Whidbey Island Events, News & Marketplace',
    description: 'Your local guide to Whidbey Island.',
    url: 'https://whidbeywave.com',
    siteName: 'WhidbeyWave',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'WhidbeyWave' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhidbeyWave.com',
    description: 'Whidbey Island Events, News & Marketplace',
    images: ['/og-default.png'],
  },
  metadataBase: new URL('https://whidbeywave.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-forest-600 focus:text-parchment-50 focus:rounded-xl focus:font-semibold focus:text-sm"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
