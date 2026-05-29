import Link from 'next/link';
import Image from 'next/image';
import TextSizeFooterToggle from '@/components/TextSizeFooterToggle';
import LandAcknowledgment from '@/components/LandAcknowledgment';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-parchment-100 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo.png" alt="" aria-hidden={true} role="presentation" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              <span className="text-xl font-bold text-parchment-100 font-heading">
                WhidbeyWave
              </span>
            </div>
            <p className="text-forest-300 text-sm leading-relaxed mb-3">
              Your neighbor&apos;s guide to everything happening on Whidbey Island, Washington.
            </p>
            <a
              href="https://maps.google.com/?q=Whidbey+Island,+Washington"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-forest-400 hover:text-parchment-200 transition-colors"
            >
              📍 Whidbey Island, WA
            </a>
          </div>

          {/* Explore */}
          <div className="pt-6 border-t border-forest-800 sm:pt-0 sm:border-t-0">
            <h3 className="font-semibold mb-3 text-parchment-200">
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
          <div className="pt-6 border-t border-forest-800 sm:pt-0 sm:border-t-0">
            <h3 className="font-semibold mb-3 text-parchment-200">
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
          <div className="pt-6 border-t border-forest-800 sm:pt-0 sm:border-t-0">
            <h3 className="font-semibold mb-3 text-parchment-200">
              Island Towns
            </h3>
            <ul className="space-y-2 text-sm text-forest-300">
              {[
                ['Oak Harbor',  'Oak Harbor'],
                ['Coupeville',  'Coupeville'],
                ['Langley',     'Langley'],
                ['Freeland',    'Freeland'],
                ['Greenbank',   'Greenbank'],
                ['Clinton',     'Clinton'],
              ].map(([label, town]) => (
                <li key={town}>
                  <Link
                    href={`/events?town=${encodeURIComponent(town)}`}
                    className="hover:text-parchment-100 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <LandAcknowledgment />

        <div className="border-t border-forest-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-forest-300">
          <p>&copy; {new Date().getFullYear()} WhidbeyWave.com &nbsp;·&nbsp; Whidbey Island, WA</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-parchment-300 transition-colors">Privacy</Link>
            <span className="text-forest-700">·</span>
            <Link href="/terms" className="hover:text-parchment-300 transition-colors">Terms</Link>
            <span className="text-forest-700">·</span>
            <Link href="/contact" className="hover:text-parchment-300 transition-colors">Contact</Link>
            <span className="text-forest-700">·</span>
            <TextSizeFooterToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
