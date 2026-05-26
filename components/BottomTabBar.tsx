'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

// #1 Bottom Tab Bar + #2 Hide-on-Scroll + #17 Ferry Status Pill

const tabs = [
  { href: '/',            label: 'Home',       icon: HomeIcon,        activeIcon: HomeIconFilled },
  { href: '/events',      label: 'Events',     icon: CalendarIcon,    activeIcon: CalendarIconFilled },
  { href: '/forum',       label: 'Community',  icon: PeopleIcon,      activeIcon: PeopleIconFilled },
  { href: '/marketplace', label: 'Marketplace',icon: BagIcon,         activeIcon: BagIconFilled },
  { href: '/more',        label: 'More',       icon: MoreIcon,        activeIcon: MoreIconFilled },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const lastScrollY = useRef(0);
  const moreRef = useRef<HTMLDivElement>(null);

  // #2 Hide-on-scroll
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y > lastScrollY.current && y > 80) {
        setVisible(false);
        setMoreOpen(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close "More" on outside click
  useEffect(() => {
    if (!moreOpen) return;
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [moreOpen]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  const moreLinks = [
    { href: '/ferry',           emoji: '🚢', label: 'Ferry Status' },
    { href: '/tides',           emoji: '🌊', label: 'Tides' },
    { href: '/news',            emoji: '📰', label: 'Island News' },
    { href: '/guides',          emoji: '📖', label: 'Guides' },
    { href: '/recommendations', emoji: '⭐', label: 'Local Picks' },
    { href: '/barter',          emoji: '🔄', label: 'Barter & Trade' },
    { href: '/newsletter',      emoji: '📬', label: 'Newsletter' },
    { href: '/visit',           emoji: '🗺️', label: 'Visitor Guide' },
    { href: '/dashboard',       emoji: '⚡', label: 'Quick View' },
    { href: '/search',          emoji: '🔍', label: 'Search' },
    { href: '/contact',         emoji: '👋', label: 'Say Hello' },
    { href: '/about',           emoji: '🏝️', label: 'About' },
  ];

  const moreActive = moreLinks.some(l => isActive(l.href));

  return (
    <div className="md:hidden" ref={moreRef}>
      {/* More menu sheet */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-[59] bg-black/30"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-[68px] left-0 right-0 z-[60] px-3 pb-2 animate-slideUp">
            <div className="bg-white rounded-xl shadow-2xl border border-parchment-200 overflow-hidden max-h-[60vh] overflow-y-auto">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">More</p>
              </div>
              <div className="grid grid-cols-3 gap-1 px-3 pb-3">
                {moreLinks.map(({ href, emoji, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-center transition-colors ${
                      isActive(href)
                        ? 'bg-forest-50 text-forest-700'
                        : 'text-stone-600 hover:bg-parchment-100'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[11px] font-medium leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab bar */}
      <nav
        aria-label="Main navigation"
        className={`fixed bottom-0 left-0 right-0 z-[58] bg-white/95 backdrop-blur-md border-t border-parchment-200 transition-transform duration-300 ease-in-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-[60px] max-w-lg mx-auto">
          {tabs.map(({ href, label, icon: Icon, activeIcon: ActiveIcon }) => {
            if (href === '/more') {
              const active = moreActive;
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(v => !v)}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                    active || moreOpen ? 'text-forest-600' : 'text-stone-400'
                  }`}
                  aria-label="More options"
                  aria-expanded={moreOpen}
                >
                  {active || moreOpen ? <ActiveIcon /> : <Icon />}
                  <span className={`text-[10px] font-medium ${active || moreOpen ? 'text-forest-600' : 'text-stone-500'}`}>
                    {label}
                  </span>
                </button>
              );
            }

            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                  active ? 'text-forest-600' : 'text-stone-400'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {active ? <ActiveIcon /> : <Icon />}
                <span className={`text-[10px] font-medium ${active ? 'text-forest-600' : 'text-stone-500'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Simple SVG icons (outlined + filled variants for active state)
function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function HomeIconFilled() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.97-.97V19.5a1.5 1.5 0 01-1.5 1.5h-3a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75h-3a1.5 1.5 0 01-1.5-1.5v-6.88l-.97.97a.75.75 0 01-1.06-1.06l8.69-8.69z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function CalendarIconFilled() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}
function PeopleIconFilled() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 17.243a11.948 11.948 0 00-3.312 1.688 5.988 5.988 0 01-.425-1.372A3.75 3.75 0 016.31 14.81a5.97 5.97 0 00-.001 2.433zm11.38 0a5.97 5.97 0 000-2.432 3.75 3.75 0 013.737 2.75 5.99 5.99 0 01-.425 1.37 11.955 11.955 0 00-3.312-1.688zM12 12.75a5.25 5.25 0 00-5.21 4.563 11.958 11.958 0 0010.42 0A5.25 5.25 0 0012 12.75z" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
function BagIconFilled() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}
function MoreIconFilled() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
    </svg>
  );
}
