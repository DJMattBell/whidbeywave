'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

const mainLinks = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/events',  label: "What's Going On" },
  { href: '/news',    label: 'Island News' },
  { href: '/guides',  label: 'Guides' },
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
  { href: '/barter',          label: '🔄 Barter & Trade' },
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
    ...(user ? [{ href: '/profile', label: '👤 My Profile' }] : []),
    ...baseCommunityLinks,
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
                <Image src="/logo.png" alt="WhidbeyWave logo" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
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
                          ? 'bg-forest-600 text-parchment-50'
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
                    aria-haspopup="menu"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                      visitActive
                        ? 'bg-forest-600 text-parchment-50'
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
                    <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
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
                          ? 'bg-forest-600 text-parchment-50'
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
                  aria-haspopup="menu"
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-forest-600 text-forest-600 hover:bg-forest-600 hover:text-parchment-50 transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
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
                  <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
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
                      ? 'bg-forest-600 text-parchment-50'
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
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-forest-600 text-parchment-50 hover:bg-forest-700 transition-colors min-h-[44px]"
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
                    className="text-xs font-medium bg-forest-600 text-parchment-50 px-3 py-2 rounded-lg hover:bg-forest-700 transition-colors"
                  >
                    Sign in
                  </button>
                )}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg text-stone-600 hover:bg-parchment-200 transition-colors w-11 h-11 flex flex-col items-center justify-center gap-[5px]"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                >
                  <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 origin-center ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block w-5 h-0.5 bg-current transition-transform duration-200 origin-center ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile drawer overlay */}
            {menuOpen && (
              <div
                className="fixed inset-0 z-[60] bg-black/50 md:hidden"
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
              />
            )}

            {/* Mobile slide-in drawer */}
            <nav
              id="mobile-menu"
              className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[70] shadow-2xl md:hidden
                         flex flex-col transition-transform duration-300 ease-in-out
                         ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
              aria-label="Mobile navigation"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-200">
                <span className="text-lg font-bold text-forest-600">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-lg text-stone-500 hover:bg-parchment-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto py-3">
                {[...mainLinks, contactLink].map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`block px-5 py-3 text-base font-medium transition-colors ${
                        active
                          ? 'bg-forest-50 text-forest-700 border-r-2 border-forest-600'
                          : 'text-stone-700 hover:bg-parchment-100 hover:text-forest-600'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                <Link
                  href={searchLink.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-5 py-3 text-base font-medium transition-colors ${
                    pathname === searchLink.href
                      ? 'bg-forest-50 text-forest-700 border-r-2 border-forest-600'
                      : 'text-stone-700 hover:bg-parchment-100 hover:text-forest-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Link>

                {/* Visit Whidbey */}
                <div className="mt-2 border-t border-parchment-200 pt-2">
                  <p className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                    Visit Whidbey
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
                        className={`block pl-7 pr-5 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-forest-50 text-forest-700'
                            : 'text-stone-600 hover:bg-parchment-100 hover:text-forest-600'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Links */}
                <div className="mt-2 border-t border-parchment-200 pt-2">
                  <p className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                    Quick Links
                  </p>
                  {communityLinks.map(({ href, label }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={`block px-5 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-forest-50 text-forest-700'
                            : 'text-stone-600 hover:bg-parchment-100 hover:text-forest-600'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer footer — submit + auth */}
              <div className="border-t border-parchment-200 px-5 py-4 space-y-2">
                <Link
                  href="/submit-event"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-forest-600 text-parchment-50 hover:bg-forest-700 transition-colors"
                >
                  <span aria-hidden="true">📅</span> Submit an Event
                </Link>
                <Link
                  href="/submit-listing"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold border border-forest-600 text-forest-600 hover:bg-forest-50 transition-colors"
                >
                  <span aria-hidden="true">🏷️</span> Post a Listing
                </Link>
              </div>
            </nav>
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
                          ? 'bg-forest-600 text-parchment-50'
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
        <div className="md:hidden bg-forest-50 border-b border-parchment-200 relative overflow-x-auto overflow-y-hidden scrollbar-none">
          {/* Right-edge fade to signal scrollability */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-forest-50 to-transparent pointer-events-none z-10" aria-hidden="true" />
          <nav className="flex items-center gap-1 px-4 h-10 w-max" aria-label="Community navigation">
            {/* Search — pinned first, visually distinct pill */}
            <Link
              href="/search"
              aria-current={pathname === '/search' ? 'page' : undefined}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                pathname === '/search'
                  ? 'bg-forest-600 text-parchment-50'
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
                        ? 'bg-forest-600 text-parchment-50'
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
