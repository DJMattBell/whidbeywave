import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribed — WhidbeyWave Marketplace',
};

export default function UnsubscribedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-5" aria-hidden="true">🌿</div>
        <h1
          className="text-2xl font-bold text-stone-800 mb-3"
        >
          You&apos;re unsubscribed
        </h1>
        <p className="text-stone-500 text-base leading-relaxed mb-8">
          You won&apos;t receive any more marketplace alerts from WhidbeyWave.
          You can always sign up again from the marketplace page.
        </p>
        <Link href="/marketplace" className="btn-primary">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
