import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile — WhidbeyWave',
  description: 'Manage your WhidbeyWave profile, listings, posts, and activity.',
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
