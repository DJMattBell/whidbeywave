/**
 * Shared constants used across pages and API routes.
 *
 * This is the single source of truth for display mappings like emoji and
 * color badges. Import from here instead of redefining per-file.
 */

import {
  Calendar, Ship, Map, Utensils, Carrot,
  Waves, MessageCircle, Star, ShoppingBag, ArrowLeftRight, Mail,
} from 'lucide-react';

// ── Navigation link groups (shared by Navbar + MobileDrawer) ────────────────

export const NAV_VISIT_LINKS = [
  { href: '/visit',                 label: 'Visitor Guide',  Icon: Map },
  { href: '/visit/this-weekend',    label: 'This Weekend',   Icon: Calendar },
  { href: '/visit/restaurants',     label: 'Restaurants',     Icon: Utensils },
  { href: '/visit/farmers-markets', label: 'Farmers Markets', Icon: Carrot },
  { href: '/visit/ferry-guide',     label: 'Getting Here',   Icon: Ship },
] as const;

export const NAV_COMMUNITY_LINKS = [
  { href: '/tides',           label: 'Tides',           Icon: Waves },
  { href: '/forum',           label: 'Ask the Island',  Icon: MessageCircle },
  { href: '/recommendations', label: 'Local Picks',     Icon: Star },
  { href: '/marketplace',     label: 'Buy & Sell',      Icon: ShoppingBag },
  { href: '/barter',          label: 'Barter & Trade',  Icon: ArrowLeftRight },
  { href: '/newsletter',      label: 'Newsletter',      Icon: Mail },
] as const;

// ── Event category → emoji mapping ───────────────────────────────────────────

export const CATEGORY_EMOJI: Record<string, string> = {
  'Nature & Wildlife':     '🌿',
  'Arts & Culture':        '🎨',
  'Farmers Market':        '🥕',
  'Music & Performance':   '🎵',
  'Outdoors & Recreation': '🌲',
  'Film & Media':          '🎬',
  'Community & Social':    '🤝',
  'Classes & Workshops':   '📚',
  'Food & Drink':          '🍽️',
  'Sports & Fitness':      '🏃',
  'Other':                 '📅',
  // Legacy short names (older static data)
  'Nature':   '🌿',
  'Arts':     '🎨',
  'Market':   '🥕',
  'Film':     '🎬',
  'Outdoors': '🌲',
};

// ── Event category → stripe color for cards (design-system palette) ──────────

export const CATEGORY_STRIPE_COLORS: Record<string, string> = {
  'Nature & Wildlife':     'bg-forest-600',
  'Arts & Culture':        'bg-sound-600',
  'Farmers Market':        'bg-amber-500',
  'Music & Performance':   'bg-sound-500',
  'Outdoors & Recreation': 'bg-forest-500',
  'Film & Media':          'bg-sound-400',
  'Community & Social':    'bg-forest-400',
  'Classes & Workshops':   'bg-sound-600',
  'Food & Drink':          'bg-amber-600',
  'Sports & Fitness':      'bg-forest-600',
  Other:                   'bg-stone-400',
};

// ── Main navigation links (shared by Navbar desktop + MobileDrawer) ──────────

export const NAV_MAIN_LINKS = [
  { href: '/events',  label: "What's On" },
  { href: '/news',    label: 'News' },
  { href: '/guides',  label: 'Guides' },
  { href: '/ferry',   label: 'Ferry' },
] as const;

// ── Forum category → badge color mapping ─────────────────────────────────────

export const FORUM_CATEGORY_COLORS: Record<string, string> = {
  General:              'bg-stone-100 text-stone-700',
  Recommendations:      'bg-amber-100 text-amber-800',
  'Island Life':        'bg-forest-100 text-forest-800',
  Events:               'bg-sound-100 text-sound-800',
  'Lost & Found':       'bg-terra-100 text-terra-700',
  'For Sale / Free':    'bg-amber-100 text-amber-900',
  'Welcome Newcomers':  'bg-forest-50 text-forest-700',
};

// ── Forum category list (includes "All" for filter UI) ──────────────────────

export const FORUM_CATEGORIES = [
  'All',
  'General',
  'Recommendations',
  'Island Life',
  'Events',
  'Lost & Found',
  'For Sale / Free',
  'Welcome Newcomers',
] as const;
