'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

const mainLinks = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/events',  label: "What's Going On" },
  { href: '/news',    label: 'Island News' },
];

const contactLink = { href: '/contact', label: 'Say Hello' };

const visitLinks = [
  { href: '/visit',                 label: '🗺️ Visitor Guide' },
  { href: '/visit/this-weekend',    label: '📅 This Weekend' },
  { href: '/visit/restaurants',     label: '🍽️ Restaurants' },
  { href: '/visit/farmers-markets', label: '🥕 Farmers Markets' },
  { href: '/visit/ferry-guide',     label: '🚢 Getting Here' },
];

const searchLink = { href: '/search', label: 'Search' };

const baseCommunityLinks = [
  { href: '/ferry',           label: '🚢 Ferry Status' },
  { href: '/tides',           label: '🌊 Tides' },
  { href: '/forum',           label: 'Ask the Island' },
  { href: '/recommendations', label: 'Local Picks' },
  { href: '/marketplace',     label: 'Buy & Sell' },
  { href: '/barter',          label: 'Barter & Trade' },
  { href: '/newsletter',      label: 'Newsletter' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [visitOpen, setVisitOpen]   = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);
  const { user, signOut } = useAuth();

  const visitActive = pathname.startsWith('/visit');

  const communityLinks = [
    ...baseCommunityLinks,
    ...(user ? [{ href: '/profile', label: 'My Profile' }] : []),
  ];

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <header className="sticky top-0 z-50">

        {/* Main bar */}
        <div className="bg-parchment-50/95 backdrop-blur-md border-b border-parchment-300 shadow-warm-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl" aria-hidden="true">🌊</span>
                <span className="text-xl font-bold text-forest-600 group-hover:text-forest-500 transition-colors">
                  WhidbeyWave
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                {mainLinks.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-forest-500 text-parchment-50'
                          : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}

                {/* Visit Whidbey dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setVisitOpen(true)}
                  onMouseLeave={() => setVisitOpen(false)}
                >
                  <button
                    onClick={() => setVisitOpen(v => !v)}
                    aria-expanded={visitOpen}
                    aria-haspopup="listbox"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                      visitActive
                        ? 'bg-forest-500 text-parchment-50'
                        : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                    }`}
                  >
                    <span>🗺️</span>
                    <span>Visit Whidbey</span>
                    <svg
                      className={`w-3 h-3 transition-transform shrink-0 ${visitOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.75"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 4 4 4-4" />
                    </svg>
                  </button>

                  {visitOpen && (
                    <div className="absolute top-full left-0 pt-1 bg-transparent min-w-[210px] z-50">
                    <div className="bg-white border border-parchment-200 rounded-xl shadow-warm-md overflow-hidden">
                      {visitLinks.map(({ href, label }) => {
                        const active = href === '/visit'
                          ? pathname === '/visit'
                          : pathname.startsWith(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setVisitOpen(false)}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                              active
                                ? 'bg-forest-50 text-forest-700'
                                : 'text-stone-600 hover:bg-forest-50 hover:text-forest-700'
                            }`}
                          >
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                    </div>
                  )}
                </div>

                {/* Contact */}
                {(() => {
                  const active = pathname === contactLink.href;
                  return (
                    <Link
                      href={contactLink.href}
                      aria-current={active ? 'page' : undefined}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-forest-500 text-parchment-50'
                          : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                      }`}
                    >
                      {contactLink.label}
                    </Link>
                  );
                })()}
              </nav>

              {/* Submit dropdown — desktop */}
              <div
                className="hidden md:flex items-center ml-2 relative"
                onMouseEnter={() => setSubmitOpen(true)}
                onMouseLeave={() => setSubmitOpen(false)}
              >
                <button
                  onClick={() => setSubmitOpen(v => !v)}
                  aria-expanded={submitOpen}
                  aria-haspopup="listbox"
                  className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-forest-500 text-forest-600 hover:bg-forest-500 hover:text-parchment-50 transition-colors inline-flex items-center gap-1.5 min-h-[40px]"
                >
                  <span aria-hidden="true">＋</span>
                  <span>Submit</span>
                  <svg
                    className={`w-3 h-3 transition-transform shrink-0 ${submitOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.75"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 4 4 4-4" />
                  </svg>
                </button>

                {submitOpen && (
                  <div className="absolute top-full left-0 pt-1 bg-transparent min-w-[190px] z-50">
                  <div className="bg-white border border-parchment-200 rounded-xl shadow-warm-md overflow-hidden">
                    <Link
                      href="/submit-event"
                      onClick={() => setSubmitOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-stone-600 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                    >
                      <span aria-hidden="true">📅</span> Submit an Event
                    </Link>
                    <Link
                      href="/submit-listing"
                      onClick={() => setSubmitOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-stone-600 hover:bg-forest-50 hover:text-forest-700 transition-colors border-t border-parchment-100"
                    >
                      <span aria-hidden="true">🏷️</span> Post a Listing
                    </Link>
                  </div>
                  </div>
                )}
              </div>

              {/* Search icon — desktop */}
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link
                  href={searchLink.href}
                  aria-label="Search"
                  className={`p-2 rounded-lg transition-colors ${
                    pathname === searchLink.href
                      ? 'bg-forest-500 text-parchment-50'
                      : 'text-stone-500 hover:text-forest-600 hover:bg-forest-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              </div>

              {/* Auth button — desktop */}
              <div className="hidden md:flex items-center gap-2 ml-0">
                {user ? (
                  <button
                    onClick={signOut}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-forest-600 hover:bg-forest-50 transition-colors min-h-[44px]"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-forest-500 text-parchment-50 hover:bg-forest-600 transition-colors min-h-[44px]"
                  >
                    Sign in
                  </button>
                )}
              </div>

              {/* Mobile: auth + hamburger */}
              <div className="md:hidden flex items-center gap-2">
                {user ? (
                  <button
                    onClick={signOut}
                    className="text-xs text-stone-500 px-3 py-2 rounded-lg hover:bg-parchment-200 transition-colors"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="text-xs font-medium bg-forest-500 text-parchment-50 px-3 py-2 rounded-lg hover:bg-forest-600 transition-colors"
                  >
                    Sign in
                  </button>
                )}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg text-stone-600 hover:bg-parchment-200 transition-colors min-w-[52px] min-h-[52px] flex flex-col items-center justify-center gap-1"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                >
                  <span className="block w-5 h-0.5 bg-current" />
                  <span className="block w-5 h-0.5 bg-current" />
                  <span className="block w-5 h-0.5 bg-current" />
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
              <nav id="mobile-menu" className="md:hidden pb-4 border-t border-parchment-200 pt-3 flex flex-col gap-1">
                {[...mainLinks, contactLink].map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`px-4 py-4 rounded-lg text-base font-medium transition-colors ${
                        active
                          ? 'bg-forest-500 text-parchment-50'
                          : 'text-stone-700 hover:bg-parchment-200 hover:text-forest-600'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                <Link
                  href={searchLink.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === searchLink.href ? 'page' : undefined}
                  className={`px-4 py-4 rounded-lg text-base font-medium transition-colors flex items-center gap-2 ${
                    pathname === searchLink.href
                      ? 'bg-forest-500 text-parchment-50'
                      : 'text-stone-700 hover:bg-parchment-200 hover:text-forest-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Link>

                {/* Visit Whidbey — flat indented sub-links */}
                <div className="mt-1 border-t border-parchment-200 pt-2">
                  <p className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                    visitActive ? 'text-forest-700' : 'text-stone-600'
                  }`}>
                    🗺️ Visit Whidbey
                  </p>
                  {visitLinks.map(({ href, label }) => {
                    const active = href === '/visit'
                      ? pathname === '/visit'
                      : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={`block pl-8 pr-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          active
                            ? 'bg-forest-500 text-parchment-50'
                            : 'text-stone-600 hover:bg-parchment-200 hover:text-forest-600'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>

                {/* Submit shortcuts */}
                <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
                  <Link
                    href="/submit-event"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold bg-forest-500 text-parchment-50 hover:bg-forest-600 transition-colors min-h-[48px]"
                  >
                    <span aria-hidden="true">📅</span> Submit an Event
                  </Link>
                  <Link
                    href="/submit-listing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold border-2 border-forest-500 text-forest-600 hover:bg-forest-50 transition-colors min-h-[48px]"
                  >
                    <span aria-hidden="true">🏷️</span> Post a Listing
                  </Link>
                </div>

                <div className="px-4 pt-1 pb-1 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Community
                </div>
                {communityLinks.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`px-4 py-4 rounded-lg text-base font-medium transition-colors ${
                        active
                          ? 'bg-forest-500 text-parchment-50'
                          : 'text-stone-700 hover:bg-parchment-200 hover:text-forest-600'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* Community strip — desktop */}
        <div className="hidden md:block bg-forest-50 border-b border-parchment-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1 h-10" aria-label="Community navigation">
              <span className="text-xs font-semibold text-forest-700 mr-2 flex items-center gap-1" aria-hidden="true">
                🌿 Community
              </span>
              {communityLinks.map(({ href, label }, i) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <span key={href} className="flex items-center gap-1">
                    {i > 0 && <span className="text-parchment-400 text-xs" aria-hidden="true">·</span>}
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-forest-500 text-parchment-50'
                          : 'text-forest-700 hover:text-forest-900 hover:bg-forest-100'
                      }`}
                    >
                      {label}
                    </Link>
                  </span>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Community strip — mobile (always visible, horizontal scroll) */}
        <div className="md:hidden bg-forest-50 border-b border-parchment-200 overflow-x-auto">
          <nav className="flex items-center gap-1 px-4 h-10 w-max min-w-full" aria-label="Community navigation">
            {/* Search — pinned first, visually distinct pill */}
            <Link
              href="/search"
              aria-current={pathname === '/search' ? 'page' : undefined}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                pathname === '/search'
                  ? 'bg-forest-500 text-parchment-50'
                  : 'bg-forest-100 text-forest-700 hover:bg-forest-200 hover:text-forest-900'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Link>
            <span className="text-parchment-400 text-xs shrink-0" aria-hidden="true">·</span>
            {communityLinks.map(({ href, label }, i) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <span key={href} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-parchment-400 text-xs" aria-hidden="true">·</span>}
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-forest-500 text-parchment-50'
                        : 'text-forest-700 hover:text-forest-900 hover:bg-forest-100'
                    }`}
                  >
                    {label}
                  </Link>
                </span>
              );
            })}
          </nav>
        </div>

      </header>
    </>
  );
}
