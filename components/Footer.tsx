import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-parchment-100 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌊</span>
              <span
                className="text-xl font-bold text-parchment-100"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                WhidbeyWave
              </span>
            </div>
            <p className="text-forest-300 text-sm leading-relaxed">
              Your neighbor&apos;s guide to everything happening on Whidbey Island, Washington.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3
              className="font-semibold mb-3 text-parchment-200"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Around the Island
            </h3>
            <ul className="space-y-2 text-sm text-forest-300">
              <li><Link href="/events"      className="hover:text-parchment-100 transition-colors">What&apos;s Going On</Link></li>
              <li><Link href="/news"        className="hover:text-parchment-100 transition-colors">Island News</Link></li>
              <li><Link href="/marketplace" className="hover:text-parchment-100 transition-colors">Buy &amp; Sell</Link></li>
              <li><Link href="/barter"      className="hover:text-parchment-100 transition-colors">Barter &amp; Trade</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3
              className="font-semibold mb-3 text-parchment-200"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Community
            </h3>
            <ul className="space-y-2 text-sm text-forest-300">
              <li><Link href="/forum"           className="hover:text-parchment-100 transition-colors">Ask the Island</Link></li>
              <li><Link href="/recommendations" className="hover:text-parchment-100 transition-colors">Local Picks</Link></li>
              <li><Link href="/newsletter"      className="hover:text-parchment-100 transition-colors">Newsletter</Link></li>
              <li><Link href="/contact"         className="hover:text-parchment-100 transition-colors">Say Hello</Link></li>
              <li><Link href="/how-it-works"   className="hover:text-parchment-100 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Towns */}
          <div>
            <h3
              className="font-semibold mb-3 text-parchment-200"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Island Towns
            </h3>
            <ul className="space-y-2 text-sm text-forest-300">
              <li>Oak Harbor</li>
              <li>Langley</li>
              <li>Coupeville</li>
              <li>Freeland</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-forest-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-forest-300">
          <p>&copy; {new Date().getFullYear()} WhidbeyWave.com &nbsp;·&nbsp; Whidbey Island, WA</p>
          <Link href="/contact" className="hover:text-parchment-300 transition-colors">
            Something not right? Let us know →
          </Link>
        </div>
      </div>
    </footer>
  );
}
