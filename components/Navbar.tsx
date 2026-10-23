'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import NavDropdown from '@/components/navbar/NavDropdown';
import MobileDrawer from '@/components/navbar/MobileDrawer';
import { supabase as supabaseBrowser } from '@/lib/supabase';
import { usePollingWhenVisible } from '@/lib/hooks/usePollingWhenVisible';
import {
  Calendar, Newspaper, BookOpen, Ship, Map, Utensils, Carrot,
  Waves, MessageCircle, Star, ShoppingBag, ArrowLeftRight, Mail,
  Plus, Search, User, Bell, LogOut,
} from 'lucide-react';

const mainLinks = [
  { href: '/events',  label: "What's On",   Icon: Calendar },
  { href: '/news',    label: 'News',         Icon: Newspaper },
  { href: '/guides',  label: 'Guides',       Icon: BookOpen },
  { href: '/ferry',   label: 'Ferry',        Icon: Ship },
];

const visitLinks = [
  { href: '/visit',                 label: 'Visitor Guide',  Icon: Map },
  { href: '/visit/this-weekend',    label: 'This Weekend',   Icon: Calendar },
  { href: '/visit/restaurants',     label: 'Restaurants',     Icon: Utensils },
  { href: '/visit/farmers-markets', label: 'Farmers Markets', Icon: Carrot },
  { href: '/visit/ferry-guide',     label: 'Getting Here',   Icon: Ship },
];

const communityLinks = [
  { href: '/tides',           label: 'Tides',           Icon: Waves },
  { href: '/forum',           label: 'Ask the Island',  Icon: MessageCircle },
  { href: '/recommendations', label: 'Local Picks',     Icon: Star },
  { href: '/marketplace',     label: 'Buy & Sell',      Icon: ShoppingBag },
  { href: '/barter',          label: 'Barter & Trade',  Icon: ArrowLeftRight },
  { href: '/newsletter',      label: 'Newsletter',      Icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [authOpen, setAuthOpen]   = useState(false);
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(json.count ?? 0);
      }
    } catch { /* silent */ }
  }, [user]);

  usePollingWhenVisible(fetchUnread, 60_000);

  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const visitActive = pathname.startsWith('/visit');
  const communityActive = communityLinks.some(
    l => pathname === l.href || pathname.startsWith(l.href + '/')
  );

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <header className="sticky top-0 z-50">
        <div className="bg-parchment-50/95 backdrop-blur-md border-b border-parchment-300 shadow-warm-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <Image src="/logo.png" alt="WhidbeyWave logo" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-xl font-bold text-forest-600 group-hover:text-forest-500 transition-colors">
                  WhidbeyWave
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main navigation">
                {mainLinks.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                <NavDropdown
                  trigger={({ open, chevron }) => (
                    <button
                      aria-expanded={open}
                      aria-haspopup="menu"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                        visitActive
                          ? 'bg-forest-600 text-parchment-50'
                          : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                      }`}
                    >
                      Visit{chevron}
                    </button>
                  )}
                >
                  {visitLinks.map(({ href, label, Icon }) => {
                    const active = href === '/visit'
                      ? pathname === '/visit'
                      : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-sound-50 text-forest-700'
                            : 'text-stone-600 hover:bg-sound-50 hover:text-forest-700'
                        }`}
                      >
                        <Icon size={16} className="shrink-0" aria-hidden="true" />
                        {label}
                      </Link>
                    );
                  })}
                </NavDropdown>

                {/* Community dropdown */}
                <NavDropdown
                  trigger={({ open, chevron }) => (
                    <button
                      aria-expanded={open}
                      aria-haspopup="menu"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                        communityActive
                          ? 'bg-forest-600 text-parchment-50'
                          : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                      }`}
                    >
                      Community{chevron}
                    </button>
                  )}
                >
                  {communityLinks.map(({ href, label, Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-sound-50 text-forest-700'
                            : 'text-stone-600 hover:bg-sound-50 hover:text-forest-700'
                        }`}
                      >
                        <Icon size={16} className="shrink-0" aria-hidden="true" />
                        {label}
                      </Link>
                    );
                  })}
                </NavDropdown>
              </nav>

              {/* Desktop right side: Submit + Search + Profile */}
              <div className="hidden md:flex items-center gap-1 ml-auto pl-2">
                {/* Submit dropdown — pill style */}
                <NavDropdown
                  align="right"
                  trigger={({ open, chevron }) => (
                    <button
                      aria-expanded={open}
                      aria-haspopup="menu"
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-forest-600 text-forest-600 hover:bg-forest-600 hover:text-parchment-50 transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
                    >
                      <Plus size={16} aria-hidden="true" />
                      Submit
                      {chevron}
                    </button>
                  )}
                >
                  <Link
                    href="/submit-event"
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors"
                  >
                    <Calendar size={16} aria-hidden="true" /> Submit an Event
                  </Link>
                  <Link
                    href="/submit-listing"
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors border-t border-parchment-100"
                  >
                    <ShoppingBag size={16} aria-hidden="true" /> Post a Listing
                  </Link>
                </NavDropdown>

                {/* Search */}
                <Link
                  href="/search"
                  aria-label="Search"
                  className={`p-2 rounded-lg transition-colors ${
                    pathname === '/search'
                      ? 'bg-forest-600 text-parchment-50'
                      : 'text-stone-500 hover:text-forest-600 hover:bg-forest-50'
                  }`}
                >
                  <Search size={20} aria-hidden="true" />
                </Link>

                {/* Bell icon (logged in only) */}
                {user && (
                  <Link
                    href="/profile/notifications"
                    aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                    className={`relative p-2 rounded-lg transition-colors ${
                      pathname === '/profile/notifications'
                        ? 'bg-forest-600 text-parchment-50'
                        : 'text-stone-500 hover:text-forest-600 hover:bg-forest-50'
                    }`}
                  >
                    <Bell size={20} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-terra-600 text-white text-[10px] font-bold px-1 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile dropdown (logged in) or Sign in (logged out) */}
                {user ? (
                  <NavDropdown
                    align="right"
                    trigger={({ open }) => (
                      <button
                        aria-expanded={open}
                        aria-haspopup="menu"
                        aria-label="Account menu"
                        className={`p-2 rounded-lg transition-colors ${
                          open
                            ? 'bg-forest-600 text-parchment-50'
                            : 'text-stone-500 hover:text-forest-600 hover:bg-forest-50'
                        }`}
                      >
                        <User size={20} aria-hidden="true" />
                      </button>
                    )}
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors"
                    >
                      <User size={16} aria-hidden="true" /> My Profile
                    </Link>
                    <Link
                      href="/profile/notifications"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors"
                    >
                      <Bell size={16} aria-hidden="true" /> Notifications
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors border-t border-parchment-100"
                    >
                      <LogOut size={16} aria-hidden="true" /> Sign out
                    </button>
                  </NavDropdown>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-forest-600 text-parchment-50 hover:bg-forest-700 transition-colors min-h-[44px]"
                  >
                    Sign in
                  </button>
                )}
              </div>

              {/* Mobile: sign in + hamburger */}
              <div className="md:hidden flex items-center gap-2">
                {!user && (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="text-xs font-medium bg-forest-600 text-parchment-50 px-3 py-2 rounded-lg hover:bg-forest-700 transition-colors"
                  >
                    Sign in
                  </button>
                )}
                <button
                  ref={hamburgerRef}
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
          </div>
        </div>

        <MobileDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          unreadCount={unreadCount}
          hamburgerRef={hamburgerRef}
        />
      </header>
    </>
  );
}
