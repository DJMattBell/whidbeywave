'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
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

const mobileMainLinks = [
  { href: '/',        label: 'Home' },
  { href: '/events',  label: "What's On" },
  { href: '/news',    label: 'News' },
  { href: '/guides',  label: 'Guides' },
  { href: '/ferry',   label: 'Ferry' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen]         = useState(false);
  const [visitOpen, setVisitOpen]       = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [submitOpen, setSubmitOpen]     = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [authOpen, setAuthOpen]         = useState(false);
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

  // Fetch on mount + poll every 60s; pause when tab is hidden
  usePollingWhenVisible(fetchUnread, 60_000);

  const profileRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const visitRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const wasDrawerOpenRef = useRef(false);

  const visitActive = pathname.startsWith('/visit');
  const communityActive = communityLinks.some(
    l => pathname === l.href || pathname.startsWith(l.href + '/')
  );

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (visitRef.current && !visitRef.current.contains(e.target as Node)) {
        setVisitOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(e.target as Node)) {
        setCommunityOpen(false);
      }
      if (submitRef.current && !submitRef.current.contains(e.target as Node)) {
        setSubmitOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Close dropdowns on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setVisitOpen(false);
        setCommunityOpen(false);
        setSubmitOpen(false);
        setProfileOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI with route change
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  // Uses the position:fixed technique so it also holds on iOS Safari,
  // and restores the exact scroll position on close.
  useEffect(() => {
    if (!menuOpen) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  // Focus management for mobile drawer
  useEffect(() => {
    if (menuOpen) {
      drawerCloseRef.current?.focus();
      wasDrawerOpenRef.current = true;
    } else if (wasDrawerOpenRef.current) {
      hamburgerRef.current?.focus();
      wasDrawerOpenRef.current = false;
    }
  }, [menuOpen]);

  // Trap focus inside mobile drawer
  useEffect(() => {
    if (!menuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const focusable = drawer!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const chevron = (open: boolean) => (
    <svg
      className={`w-3 h-3 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.75"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 4 4 4-4" />
    </svg>
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
                <div
                  ref={visitRef}
                  className="relative"
                  onMouseEnter={() => setVisitOpen(true)}
                  onMouseLeave={() => setVisitOpen(false)}
                >
                  <button
                    onClick={() => setVisitOpen(v => !v)}
                    aria-expanded={visitOpen}
                    aria-haspopup="menu"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                      visitActive
                        ? 'bg-forest-600 text-parchment-50'
                        : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                    }`}
                  >
                    Visit{chevron(visitOpen)}
                  </button>

                  {visitOpen && (
                    <div className="absolute top-full left-0 pt-1 bg-transparent min-w-[240px] z-50">
                      <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
                        {visitLinks.map(({ href, label, Icon }) => {
                          const active = href === '/visit'
                            ? pathname === '/visit'
                            : pathname.startsWith(href);
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setVisitOpen(false)}
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
                      </div>
                    </div>
                  )}
                </div>

                {/* Community dropdown */}
                <div
                  ref={communityRef}
                  className="relative"
                  onMouseEnter={() => setCommunityOpen(true)}
                  onMouseLeave={() => setCommunityOpen(false)}
                >
                  <button
                    onClick={() => setCommunityOpen(v => !v)}
                    aria-expanded={communityOpen}
                    aria-haspopup="menu"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                      communityActive
                        ? 'bg-forest-600 text-parchment-50'
                        : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50'
                    }`}
                  >
                    Community{chevron(communityOpen)}
                  </button>

                  {communityOpen && (
                    <div className="absolute top-full left-0 pt-1 bg-transparent min-w-[240px] z-50">
                      <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
                        {communityLinks.map(({ href, label, Icon }) => {
                          const active = pathname === href || pathname.startsWith(href + '/');
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setCommunityOpen(false)}
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
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Desktop right side: Submit + Search + Profile */}
              <div className="hidden md:flex items-center gap-1 ml-auto pl-2">
                {/* Submit dropdown — pill style */}
                <div
                  ref={submitRef}
                  className="relative"
                  onMouseEnter={() => setSubmitOpen(true)}
                  onMouseLeave={() => setSubmitOpen(false)}
                >
                  <button
                    onClick={() => setSubmitOpen(v => !v)}
                    aria-expanded={submitOpen}
                    aria-haspopup="menu"
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-forest-600 text-forest-600 hover:bg-forest-600 hover:text-parchment-50 transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Submit
                    {chevron(submitOpen)}
                  </button>

                  {submitOpen && (
                    <div className="absolute top-full right-0 pt-1 bg-transparent min-w-[240px] z-50">
                      <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
                        <Link
                          href="/submit-event"
                          onClick={() => setSubmitOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors"
                        >
                          <Calendar size={16} aria-hidden="true" /> Submit an Event
                        </Link>
                        <Link
                          href="/submit-listing"
                          onClick={() => setSubmitOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors border-t border-parchment-100"
                        >
                          <ShoppingBag size={16} aria-hidden="true" /> Post a Listing
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

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
                  <div ref={profileRef} className="relative">
                    <button
                      onClick={() => setProfileOpen(v => !v)}
                      aria-expanded={profileOpen}
                      aria-haspopup="menu"
                      aria-label="Account menu"
                      className={`p-2 rounded-lg transition-colors ${
                        profileOpen
                          ? 'bg-forest-600 text-parchment-50'
                          : 'text-stone-500 hover:text-forest-600 hover:bg-forest-50'
                      }`}
                    >
                      <User size={20} aria-hidden="true" />
                    </button>

                    {profileOpen && (
                      <div className="absolute top-full right-0 pt-1 bg-transparent min-w-[240px] z-50">
                        <div className="bg-white border border-parchment-200 rounded-lg shadow-warm-md overflow-hidden">
                          <Link
                            href="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors"
                          >
                            <User size={16} aria-hidden="true" /> My Profile
                          </Link>
                          <Link
                            href="/profile/notifications"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors"
                          >
                            <Bell size={16} aria-hidden="true" /> Notifications
                          </Link>
                          <button
                            onClick={() => { setProfileOpen(false); signOut(); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-sound-50 hover:text-forest-700 transition-colors border-t border-parchment-100"
                          >
                            <LogOut size={16} aria-hidden="true" /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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

        {/* Mobile drawer overlay — rendered outside the backdrop-blur bar so
            position:fixed resolves against the viewport, not the header. */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 md:hidden"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Mobile slide-in drawer */}
        <nav
          ref={drawerRef}
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
              ref={drawerCloseRef}
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
            {/* Main links */}
            {mobileMainLinks.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(href + '/'));
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
              href="/search"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-5 py-3 text-base font-medium transition-colors ${
                pathname === '/search'
                  ? 'bg-forest-50 text-forest-700 border-r-2 border-forest-600'
                  : 'text-stone-700 hover:bg-parchment-100 hover:text-forest-600'
              }`}
            >
              <Search size={16} aria-hidden="true" />
              Search
            </Link>

            {/* Visit Whidbey */}
            <div className="mt-2 border-t border-parchment-200 pt-2">
              <p className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                Visit Whidbey
              </p>
              {visitLinks.map(({ href, label, Icon }) => {
                const active = href === '/visit'
                  ? pathname === '/visit'
                  : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 pl-7 pr-5 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-forest-50 text-forest-700'
                        : 'text-stone-600 hover:bg-parchment-100 hover:text-forest-600'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Community */}
            <div className="mt-2 border-t border-parchment-200 pt-2">
              <p className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                Community
              </p>
              {communityLinks.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-forest-50 text-forest-700'
                        : 'text-stone-600 hover:bg-parchment-100 hover:text-forest-600'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Profile section (logged in) */}
            {user && (
              <div className="mt-2 border-t border-parchment-200 pt-2">
                <p className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                  Account
                </p>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors ${
                    pathname === '/profile'
                      ? 'bg-forest-50 text-forest-700'
                      : 'text-stone-600 hover:bg-parchment-100 hover:text-forest-600'
                  }`}
                >
                  <User size={16} className="shrink-0" aria-hidden="true" />
                  My Profile
                </Link>
                <Link
                  href="/profile/notifications"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors ${
                    pathname === '/profile/notifications'
                      ? 'bg-forest-50 text-forest-700'
                      : 'text-stone-600 hover:bg-parchment-100 hover:text-forest-600'
                  }`}
                >
                  <Bell size={16} className="shrink-0" aria-hidden="true" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-terra-600 text-white text-[10px] font-bold px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="flex items-center gap-2.5 w-full px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-parchment-100 hover:text-forest-600 transition-colors"
                >
                  <LogOut size={16} className="shrink-0" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Drawer footer — submit */}
          <div className="border-t border-parchment-200 px-5 py-4 space-y-2">
            <Link
              href="/submit-event"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-forest-600 text-parchment-50 hover:bg-forest-700 transition-colors"
            >
              <Calendar size={16} aria-hidden="true" /> Submit an Event
            </Link>
            <Link
              href="/submit-listing"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold border border-forest-600 text-forest-600 hover:bg-forest-50 transition-colors"
            >
              <ShoppingBag size={16} aria-hidden="true" /> Post a Listing
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
