import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🌊</div>
      <h1 className="text-3xl font-bold text-forest-800 mb-3">Page Not Found</h1>
      <p className="text-stone-500 text-lg mb-8 max-w-md">
        The tide took this page out. Let&apos;s get you back to shore.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-8">
        {[
          { href: '/events', label: "What's On", emoji: '📅' },
          { href: '/news', label: 'Island News', emoji: '📰' },
          { href: '/marketplace', label: 'Buy & Sell', emoji: '🛒' },
          { href: '/ferry', label: 'Ferry Info', emoji: '⛴️' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center p-4 rounded-xl bg-parchment-100
                       hover:bg-forest-50 border border-parchment-200 transition-colors"
          >
            <span className="text-2xl mb-1">{link.emoji}</span>
            <span className="text-sm font-medium text-forest-700">{link.label}</span>
          </Link>
        ))}
      </div>

      <Link href="/" className="text-forest-600 underline hover:text-forest-800 transition-colors">
        ← Back to WhidbeyWave Home
      </Link>
    </div>
  );
}
