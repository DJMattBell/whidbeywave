import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';
import InstallPrompt from '@/components/InstallPrompt';
import TextSizeToggle from '@/components/TextSizeToggle';
import FeedbackButton from '@/components/FeedbackButton';
import BottomTabBar from '@/components/BottomTabBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import WelcomeSheet from '@/components/WelcomeSheet';
import BackToTop from '@/components/BackToTop';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2d5016',
};

export const metadata: Metadata = {
  title: {
    default: 'WhidbeyWave.com – Whidbey Island Events, News & Marketplace',
    template: '%s | WhidbeyWave.com',
  },
  description:
    'WhidbeyWave is the community hub for Whidbey Island, WA — events in Oak Harbor, Langley, Coupeville & Freeland, local news, ferry schedules, tides, and the island marketplace.',
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WhidbeyWave',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-forest-600 focus:text-parchment-50 focus:rounded-lg focus:font-semibold focus:text-sm"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <BottomTabBar />
          <FloatingActionButton />
          <InstallPrompt />
          <WelcomeSheet />
          <BackToTop />
        </AuthProvider>
        <TextSizeToggle />
        <FeedbackButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
