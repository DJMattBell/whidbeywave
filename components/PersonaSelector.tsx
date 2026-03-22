'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export type Persona = 'local' | 'visitor' | 'ferry' | 'dashboard';

const COOKIE_NAME = 'ww-persona';
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

function setPersonaCookie(persona: Persona) {
  document.cookie = `${COOKIE_NAME}=${persona}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearPersonaCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

const personas: {
  key: Persona;
  emoji: string;
  label: string;
  subtitle: string;
  color: string;
  hoverColor: string;
  borderColor: string;
}[] = [
  {
    key: 'local',
    emoji: '🏡',
    label: 'I Live Here',
    subtitle: 'Events, news, forum & marketplace',
    color: 'bg-forest-50',
    hoverColor: 'hover:bg-forest-100',
    borderColor: 'border-forest-300',
  },
  {
    key: 'visitor',
    emoji: '🗺️',
    label: "I'm Visiting",
    subtitle: 'Things to do, eat & see',
    color: 'bg-sound-50',
    hoverColor: 'hover:bg-sound-100',
    borderColor: 'border-sound-300',
  },
  {
    key: 'ferry',
    emoji: '⛴️',
    label: 'Ferry Info',
    subtitle: 'Live status & schedules',
    color: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-100',
    borderColor: 'border-amber-400',
  },
  {
    key: 'dashboard',
    emoji: '⚡',
    label: 'Quick View',
    subtitle: 'Everything at a glance',
    color: 'bg-terra-50',
    hoverColor: 'hover:bg-terra-100',
    borderColor: 'border-terra-300',
  },
];

/**
 * Full-hero persona chooser shown on first visit (no cookie).
 * After selection, sets cookie and navigates.
 */
export default function PersonaSelector() {
  const router = useRouter();

  function handleSelect(persona: Persona) {
    setPersonaCookie(persona);

    if (persona === 'ferry') {
      router.push('/ferry');
    } else if (persona === 'dashboard') {
      router.push('/dashboard');
    } else {
      // local or visitor — refresh to get server-side reorder
      router.refresh();
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-forest-900 via-forest-800 to-sound-800 text-parchment-100 overflow-hidden">
      {/* Atmospheric blobs */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-forest-600 opacity-20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sound-700 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-800 opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-24 text-center">
        <div className="hidden sm:inline-flex items-center gap-2 bg-parchment-50/10 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium mb-6 border border-parchment-50/20">
          <span>🌊</span>
          <span className="text-parchment-200">Whidbey Island, Washington</span>
        </div>

        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3 md:mb-4 text-parchment-50"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          WhidbeyWave
        </h1>

        <p className="text-lg md:text-xl text-parchment-200 max-w-lg mx-auto mb-8 md:mb-12 leading-relaxed">
          What brings you to the island today?
        </p>

        {/* Persona cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto mb-6">
          {personas.map(({ key, emoji, label, subtitle, color, hoverColor, borderColor }) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`${color} ${hoverColor} border-2 ${borderColor} rounded-2xl p-5 sm:p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-warm-lg group`}
            >
              <span className="text-3xl sm:text-4xl block mb-2">{emoji}</span>
              <span
                className="text-base sm:text-lg font-semibold text-stone-800 block mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {label}
              </span>
              <span className="text-xs sm:text-sm text-stone-500 leading-snug block">
                {subtitle}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setPersonaCookie('local');
            router.refresh();
          }}
          className="text-sm text-parchment-400 hover:text-parchment-200 transition-colors"
        >
          Just browsing — skip this
        </button>
      </div>

      {/* Wave transition */}
      <svg className="absolute bottom-0 left-0 w-full hidden sm:block" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M0 60L60 50C120 40 240 20 360 18C480 16 600 32 720 36C840 40 960 32 1080 26C1200 20 1320 16 1380 14L1440 12V60H0Z" fill="#fdfaf3" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full sm:hidden" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M0 40L60 33C120 26 240 13 360 12C480 11 600 21 720 24C840 27 960 21 1080 17C1200 13 1320 11 1380 9L1440 8V40H0Z" fill="#fdfaf3" />
      </svg>
    </section>
  );
}

/**
 * Small bar shown on return visits when persona is already set.
 * Allows changing persona.
 */
export function PersonaBar({ persona }: { persona: Persona }) {
  const router = useRouter();
  const current = personas.find((p) => p.key === persona);

  function handleChange(newPersona: Persona) {
    setPersonaCookie(newPersona);

    if (newPersona === 'ferry') {
      router.push('/ferry');
    } else if (newPersona === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.refresh();
    }
  }

  if (!current) return null;

  return (
    <div className="bg-parchment-100 border-b border-parchment-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2">
        <span className="text-sm text-stone-600">
          <span className="mr-1">{current.emoji}</span>
          Browsing as <strong className="text-stone-800">{current.label}</strong>
        </span>
        <div className="flex items-center gap-1">
          {personas
            .filter((p) => p.key !== persona)
            .map((p) => (
              <button
                key={p.key}
                onClick={() => handleChange(p.key)}
                className="text-xs px-2.5 py-1 rounded-full bg-parchment-200 text-stone-600 hover:bg-forest-100 hover:text-forest-700 transition-colors"
              >
                {p.emoji} {p.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
