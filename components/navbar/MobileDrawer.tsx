'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  Calendar, ShoppingBag,
  Search, User, Bell, LogOut,
} from 'lucide-react';
import { NAV_VISIT_LINKS, NAV_COMMUNITY_LINKS } from '@/lib/constants';

const mobileMainLinks = [
  { href: '/',        label: 'Home' },
  { href: '/events',  label: "What's On" },
  { href: '/news',    label: 'News' },
  { href: '/guides',  label: 'Guides' },
  { href: '/ferry',   label: 'Ferry' },
];

const visitLinks = NAV_VISIT_LINKS;
const communityLinks = NAV_COMMUNITY_LINKS;

export default function MobileDrawer({
  open,
  onClose,
  unreadCount,
  hamburgerRef,
}: {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  hamburgerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Close on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync UI with route change
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      hamburgerRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open, hamburgerRef]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
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
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Slide-in drawer */}
      <nav
        ref={drawerRef}
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[70] shadow-2xl md:hidden
                   flex flex-col transition-transform duration-300 ease-in-out
                   ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-200">
          <span className="text-lg font-bold text-forest-600">Menu</span>
          <button
            ref={closeRef}
            onClick={onClose}
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
          {mobileMainLinks.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(href + '/'));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
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
            onClick={onClose}
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
              const active = href === '/visit' ? pathname === '/visit' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
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
                  onClick={onClose}
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

          {/* Account (logged in) */}
          {user && (
            <div className="mt-2 border-t border-parchment-200 pt-2">
              <p className="px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                Account
              </p>
              <Link
                href="/profile"
                onClick={onClose}
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
                onClick={onClose}
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
                onClick={() => { onClose(); signOut(); }}
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
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-forest-600 text-parchment-50 hover:bg-forest-700 transition-colors"
          >
            <Calendar size={16} aria-hidden="true" /> Submit an Event
          </Link>
          <Link
            href="/submit-listing"
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold border border-forest-600 text-forest-600 hover:bg-forest-50 transition-colors"
          >
            <ShoppingBag size={16} aria-hidden="true" /> Post a Listing
          </Link>
        </div>
      </nav>
    </>
  );
}
