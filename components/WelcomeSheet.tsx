'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

// #18 First-Visit Welcome — non-blocking banner, expands to sheet on tap

const areas = ['South Whidbey', 'Central Whidbey', 'Oak Harbor', 'Coupeville', 'Langley', 'Clinton'];
const interests = [
  { key: 'events',      emoji: '📅', label: 'Events' },
  { key: 'news',        emoji: '📰', label: 'News' },
  { key: 'forum',       emoji: '💬', label: 'Forum' },
  { key: 'marketplace', emoji: '🛒', label: 'Marketplace' },
  { key: 'outdoors',    emoji: '🌲', label: 'Outdoors' },
  { key: 'food',        emoji: '🍽️', label: 'Food & Drink' },
];

const STORAGE_KEY = 'ww-welcome-done';

export default function WelcomeSheet() {
  const [mode, setMode] = useState<'hidden' | 'banner' | 'sheet'>('hidden');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    const hasPersona = document.cookie.includes('ww-persona=');
    if (done || hasPersona) return;

    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      setMode('banner');
      window.removeEventListener('scroll', onScroll);
      clearTimeout(fallback);
    };

    const onScroll = () => {
      if (window.scrollY > 200) reveal();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const fallback = setTimeout(reveal, 10_000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(fallback);
    };
  }, []);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (mode === 'sheet') {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mode]);

  function toggleArea(area: string) {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  }

  function toggleInterest(key: string) {
    setSelectedInterests(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function handleDone() {
    localStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new CustomEvent('ww-welcome-done'));
    if (selectedAreas.length > 0) {
      localStorage.setItem('ww-areas', JSON.stringify(selectedAreas));
    }
    if (selectedInterests.length > 0) {
      localStorage.setItem('ww-interests', JSON.stringify(selectedInterests));
    }
    setMode('hidden');
  }

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new CustomEvent('ww-welcome-done'));
    setMode('hidden');
  }

  if (mode === 'hidden') return null;

  /* ── Non-blocking banner ──────────────────────────── */
  if (mode === 'banner') {
    return (
      <div className="fixed bottom-[60px] left-0 right-0 z-59 md:bottom-0 animate-slide-up">
        <div className="mx-3 mb-2 md:mx-auto md:max-w-lg md:mb-4 flex items-center gap-3 bg-white rounded-xl shadow-warm-lg border border-parchment-200 px-4 py-3">
          <Image src="/logo.png" alt="" aria-hidden width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
          <button
            onClick={() => setMode('sheet')}
            className="flex-1 text-left text-sm font-medium text-stone-700 hover:text-forest-600 transition-colors"
          >
            Personalize your feed →
          </button>
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-parchment-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Expanded sheet (only when user taps "Personalize") ── */
  return (
    <>
      <div
        className="fixed inset-0 z-70 bg-black/40 animate-fade-in"
        onClick={handleDismiss}
      />
      <div className="fixed bottom-0 left-0 right-0 z-71 animate-slide-up">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-parchment-300 rounded-full" />
          </div>
          <div className="px-5 pb-6 pt-2">
            <div className="text-center mb-5">
              <Image src="/logo.png" alt="" aria-hidden={true} role="presentation" width={56} height={56} className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
              <h2 className="text-xl font-bold text-stone-800">Welcome to WhidbeyWave</h2>
              <p className="text-sm text-stone-500 mt-1">Help us show you what matters most</p>
            </div>

            {/* Area selection */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Your area <span className="normal-case font-normal">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors min-h-[44px] ${
                      selectedAreas.includes(area)
                        ? 'bg-forest-500 text-parchment-50 border-forest-500'
                        : 'bg-parchment-50 text-stone-600 border-parchment-300 hover:border-forest-300'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest selection */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Interests <span className="normal-case font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {interests.map(({ key, emoji, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleInterest(key)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-colors min-h-[44px] ${
                      selectedInterests.includes(key)
                        ? 'bg-forest-50 border-forest-400 text-forest-700'
                        : 'bg-parchment-50 border-parchment-200 text-stone-600 hover:border-forest-200'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleDone} className="w-full btn-primary justify-center mb-2">
              Get Started
            </button>
            <button
              onClick={handleDismiss}
              className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors py-2 min-h-[44px]"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
