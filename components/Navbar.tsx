'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

const links = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/events',  label: "What's Going On" },
  { href: '/news',    label: 'Island News' },
  { href: '/contact', label: 'Say Hello' },
];

const searchLink = { href: '/search', label: 'Search' };

const baseCommunityLinks = [
  { href: '/ferry',           label: '🚢 Ferry Status' },
  { href: '/forum',           label: 'Ask the Island' },
  { href: '/recommendations', label: 'Local Picks' },
  { href: '/marketplace',     label: 'Buy & Sell' },
  { href: '/barter',          label: 'Barter & Trade' },
  { href: '/newsletter',      label: 'Newsletter' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();

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
                {links.map(({ href, label }) => {
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
              </nav>

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
                  className="p-2 rounded-lg text-stone-600 hover:bg-parchment-200 transition-colors min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1"
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
                {links.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
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
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-2 ${
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
                <div className="px-4 pt-3 pb-1 text-xs font-semibold text-stone-400 uppercase tracking-wider">
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
                      className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
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
            <span className="text-xs font-semibold text-forest-600 mr-1 shrink-0" aria-hidden="true">🌿</span>
            {communityLinks.map(({ href, label }, i) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <span key={href} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-parchment-400 text-xs" aria-hidden="true">·</span>}
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
