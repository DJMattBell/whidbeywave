'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Waves, Newspaper, BookOpen, MessageCircle, Star,
  ArrowLeftRight, Mail, Map, Zap, Search, MessageSquare, Info, Type,
} from 'lucide-react';

// Bottom tab bar: Home | Events | Ferry | Marketplace | More
// Ferry promoted to top-level per homepage redesign (replaces Community)

const tabs = [
  { href: '/',            label: 'Home',        icon: HomeIcon,     activeIcon: HomeIconFilled },
  { href: '/events',      label: 'Events',      icon: CalendarIcon, activeIcon: CalendarIconFilled },
  { href: '/ferry',       label: 'Ferry',       icon: ShipIcon,     activeIcon: ShipIconFilled },
  { href: '/marketplace', label: 'Marketplace', icon: BagIcon,      activeIcon: BagIconFilled },
  { href: '/more',        label: 'More',        icon: MoreIcon,     activeIcon: MoreIconFilled },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [textLarge, setTextLarge] = useState(false);
  const lastScrollY = useRef(0);
  const moreRef = useRef<HTMLDivElement>(null);

  // Text-size toggle state
  useEffect(() => {
    const saved = localStorage.getItem('whidbey-text-size');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage on mount
    if (saved === 'large') setTextLarge(true);
  }, []);

  // Hide-on-scroll
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

  function toggleTextSize() {
    const next = !textLarge;
    setTextLarge(next);
    if (next) {
      document.documentElement.classList.add('text-large');
      localStorage.setItem('whidbey-text-size', 'large');
    } else {
      document.documentElement.classList.remove('text-large');
      localStorage.setItem('whidbey-text-size', 'normal');
    }
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  const moreSections = [
    {
      label: 'Quick Access',
      links: [
        { href: '/search',          Icon: Search,         label: 'Search' },
        { href: '/tides',           Icon: Waves,          label: 'Tides' },
        { href: '/dashboard',       Icon: Zap,            label: 'Quick View' },
      ],
    },
    {
      label: 'Community',
      links: [
        { href: '/forum',           Icon: MessageCircle,  label: 'Forum' },
        { href: '/recommendations', Icon: Star,           label: 'Local Picks' },
        { href: '/news',            Icon: Newspaper,      label: 'Island News' },
      ],
    },
    {
      label: 'Explore',
      links: [
        { href: '/visit',           Icon: Map,            label: 'Visitor Guide' },
        { href: '/guides',          Icon: BookOpen,       label: 'Guides' },
        { href: '/barter',          Icon: ArrowLeftRight,  label: 'Barter' },
      ],
    },
    {
      label: 'Stay Connected',
      links: [
        { href: '/newsletter',      Icon: Mail,           label: 'Newsletter' },
        { href: '/contact',         Icon: MessageSquare,  label: 'Say Hello' },
        { href: '/about',           Icon: Info,           label: 'About' },
      ],
    },
  ];

  const moreLinks = moreSections.flatMap(s => s.links);

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
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">More</p>
              </div>
              <div className="px-3 pb-2 space-y-3">
                {moreSections.map((section) => (
                  <div key={section.label}>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2 mb-1">
                      {section.label}
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {section.links.map(({ href, Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMoreOpen(false)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-center transition-colors ${
                            isActive(href)
                              ? 'bg-forest-50 text-forest-700'
                              : 'text-stone-600 hover:bg-parchment-100'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-[11px] font-medium leading-tight">{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Text size toggle */}
              <div className="border-t border-parchment-200 mx-3 mb-3 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-600">
                  <Type size={18} />
                  <span className="text-sm font-medium">Text size</span>
                </div>
                <button
                  onClick={toggleTextSize}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[32px] ${
                    textLarge ? 'bg-amber-500 text-white' : 'bg-parchment-100 text-stone-600'
                  }`}
                >
                  {textLarge ? 'Large ✓' : 'Default'}
                </button>
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

// SVG icons — outline + filled variants
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
function ShipIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 18h1.5a1.5 1.5 0 001.28-.72l.44-.66a1.5 1.5 0 012.56 0l.44.66a1.5 1.5 0 001.28.72h1.5a1.5 1.5 0 001.28-.72l.44-.66a1.5 1.5 0 012.56 0l.44.66a1.5 1.5 0 001.28.72h1.5M4 15l-1.5 3M20 15l1.5 3M6.5 15l1-9h9l1 9M12 6V3" />
    </svg>
  );
}
function ShipIconFilled() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a.75.75 0 01.75.75V6h3.5a.75.75 0 01.743.648l1 9a.75.75 0 01-.743.852H6.75a.75.75 0 01-.743-.852l1-9A.75.75 0 017.75 6h3.5V3.75A.75.75 0 0112 3zM3.75 18h1.5a1.5 1.5 0 001.28-.72l.44-.66a1.5 1.5 0 012.56 0l.44.66a1.5 1.5 0 001.28.72h1.5a1.5 1.5 0 001.28-.72l.44-.66a1.5 1.5 0 012.56 0l.44.66a1.5 1.5 0 001.28.72h1.5a.75.75 0 010 1.5h-1.5a3 3 0 01-2.56-1.44l-.44-.66-.44.66A3 3 0 0112.75 19.5h-1.5a3 3 0 01-2.56-1.44l-.44-.66-.44.66A3 3 0 015.25 19.5h-1.5a.75.75 0 010-1.5z" />
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
