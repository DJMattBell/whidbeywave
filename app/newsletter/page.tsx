'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ConfirmBanner() {
  const params = useSearchParams();
  const confirmed    = params.get('confirmed');
  const unsubscribed = params.get('unsubscribed');
  const error        = params.get('error');

  if (confirmed === 'true') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-forest-50 border border-forest-200 rounded-2xl px-6 py-5 flex items-start gap-4">
          <span className="text-3xl shrink-0" aria-hidden="true">🌿</span>
          <div>
            <p className="font-semibold text-forest-800 text-base">You&apos;re confirmed — welcome aboard!</p>
            <p className="text-forest-700 text-sm mt-0.5">
              You&apos;re now subscribed to the WhidbeyWave Weekly. Expect your first issue next Monday morning.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (unsubscribed === 'true') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex items-start gap-4">
          <span className="text-3xl shrink-0" aria-hidden="true">👋</span>
          <div>
            <p className="font-semibold text-amber-800 text-base">You&apos;ve been unsubscribed.</p>
            <p className="text-amber-700 text-sm mt-0.5">
              We&apos;ve removed you from the mailing list. You&apos;re always welcome back if you change your mind.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex items-start gap-4">
          <span className="text-3xl shrink-0" aria-hidden="true">🌧️</span>
          <div>
            <p className="font-semibold text-red-800 text-base">That link didn&apos;t work.</p>
            <p className="text-red-700 text-sm mt-0.5">
              It may have already been used or expired. Sign up again below and we&apos;ll send a fresh one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const NEWSLETTER_TAGS = [
  'News',
  'Events',
  'Community',
  'Arts & Culture',
  'Nature & Outdoors',
  'Local Business',
  'Farmers Markets',
  'Food & Dining',
];

// Inline sample data for the preview (avoids importing the entire lib/data module)
const sampleEvents = [
  {
    id: 'sample-1',
    title: 'Langley Whale Center Open House',
    date: '2026-03-01',
    time: '10:00 AM – 4:00 PM',
    town: 'Langley',
    emoji: '🐋',
  },
  {
    id: 'sample-2',
    title: 'Coupeville Arts & Crafts Festival',
    date: '2026-03-07',
    time: '9:00 AM – 5:00 PM',
    town: 'Coupeville',
    emoji: '🎨',
  },
];

const sampleNews = {
  emoji: '👨‍🍳',
  title: 'Michelin-Starred Chef Johnny Spero to Open "Passage" at the Inn at Langley',
  excerpt: 'The D.C. chef behind Reverie is bringing a multicourse tasting menu to Langley\'s waterfront when the renovated Inn reopens May 17.',
};

export default function NewsletterPage() {
  const [firstName, setFirstName]         = useState('');
  const [email, setEmail]                 = useState('');
  const [tags, setTags]                   = useState<string[]>([]);
  const [frequency, setFrequency]         = useState<'weekly' | 'immediate'>('weekly');
  const [weekendDigest, setWeekendDigest] = useState(true);
  const [status, setStatus]               = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email:     email.trim().toLowerCase(),
          tags,
          frequency,
          weekendDigest,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === 'duplicate') { setStatus('duplicate'); return; }
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-800 to-amber-800 text-parchment-100 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-300 font-medium mb-2 tracking-wide uppercase text-sm">Weekly Digest</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-parchment-50">
            The WhidbeyWave Weekly
          </h1>
          <p className="text-parchment-300 text-lg max-w-2xl mx-auto leading-relaxed">
            A digest of island news, events, and community updates — delivered every Monday morning.
            No noise, no filler. Just Whidbey.
          </p>
        </div>
      </div>

      <Suspense>
        <ConfirmBanner />
      </Suspense>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* ── Right: Signup Form — first on mobile ────────────────── */}
          <div className="order-first lg:order-last">
            <div className="bg-parchment-50 rounded-2xl shadow-warm-md border border-parchment-200 p-8 lg:sticky lg:top-24">
              <h2 className="text-2xl text-stone-900 mb-1 font-semibold">
                Join the neighborhood
              </h2>
              <p className="text-stone-500 text-sm mb-6">Free. Unsubscribe any time.</p>

              {status === 'success' ? (
                <div className="text-center py-10">
                  <div className="text-6xl mb-4" aria-hidden="true">📬</div>
                  <h3 className="text-xl font-bold text-forest-700 mb-2">Check your inbox, {firstName}.</h3>
                  <p className="text-stone-500 text-base leading-relaxed">
                    We sent a confirmation link to <strong>{email}</strong>. Click it to complete your signup — then you&rsquo;re on the list.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="nl-first-name" className="block text-sm font-medium text-stone-700 mb-1.5">
                      First name <span className="text-red-400" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="nl-first-name"
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                      autoComplete="given-name"
                      className="w-full px-4 py-3 border border-parchment-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="nl-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Email address <span className="text-red-400" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="nl-email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      autoComplete="email"
                      className="w-full px-4 py-3 border border-parchment-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                      aria-describedby={status === 'duplicate' ? 'nl-dup-msg' : status === 'error' ? 'nl-err-msg' : undefined}
                    />
                    {status === 'duplicate' && (
                      <p id="nl-dup-msg" className="text-amber-700 text-sm mt-1" role="alert">
                        You&apos;re already on the list — we&apos;ve got you covered.
                      </p>
                    )}
                    {status === 'error' && (
                      <p id="nl-err-msg" className="text-red-500 text-sm mt-1" role="alert">
                        Something went wrong. Try again in a moment.
                      </p>
                    )}
                  </div>

                  {/* Topic preferences */}
                  <fieldset>
                    <legend className="block text-sm font-medium text-stone-700 mb-1">
                      Topics you care about <span className="text-stone-600 font-normal">(optional — pick any)</span>
                    </legend>
                    <p className="text-sm text-stone-600 mb-3">We&apos;ll highlight these in your digest.</p>
                    <div className="flex flex-wrap gap-2">
                      {NEWSLETTER_TAGS.map(tag => {
                        const on = tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            aria-pressed={on}
                            className={`px-3 py-2 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
                              on
                                ? 'bg-forest-500 text-parchment-50 border-forest-500'
                                : 'bg-white text-stone-600 border-parchment-300 hover:border-forest-400 hover:text-forest-600'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Frequency */}
                  <fieldset>
                    <legend className="block text-sm font-medium text-stone-700 mb-2">
                      How often would you like to hear from us?
                    </legend>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: 'weekly' as const,
                          label: 'Weekly digest',
                          sub: 'Every Monday morning',
                        },
                        {
                          value: 'immediate' as const,
                          label: 'More frequent',
                          sub: 'As major news is published',
                        },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={frequency === opt.value}
                          onClick={() => setFrequency(opt.value)}
                          className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                            frequency === opt.value
                              ? 'border-forest-500 bg-forest-50 ring-1 ring-forest-400'
                              : 'border-parchment-300 bg-white hover:border-forest-300'
                          }`}
                        >
                          <p className="text-sm font-semibold text-stone-800">{opt.label}</p>
                          <p className="text-sm text-stone-600 mt-0.5">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Weekend digest opt-in */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <input
                      id="nl-weekend"
                      type="checkbox"
                      checked={weekendDigest}
                      onChange={e => setWeekendDigest(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-amber-300 text-forest-600 focus:ring-forest-400 shrink-0 cursor-pointer"
                    />
                    <label htmlFor="nl-weekend" className="text-sm text-stone-700 leading-snug cursor-pointer select-none">
                      <span className="font-semibold">This Weekend digest</span>
                      <span className="text-stone-500 font-normal"> (Thursdays)</span>
                      <br />
                      <span className="text-stone-600 text-xs">A short email every Thursday with what&apos;s happening that Friday–Sunday.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Signing you up…' : 'Sign Me Up'}
                  </button>

                  <p className="text-sm text-stone-600 text-center">
                    No spam, no selling your email. Just your island.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ── Left: Description + Sample — second on mobile ──────── */}
          <div className="order-last lg:order-first">
            <h2 className="text-2xl text-stone-900 mb-4 font-semibold">What you&apos;ll get</h2>
            <p className="text-stone-500 text-base leading-relaxed mb-6">
              The WhidbeyWave digest is written for people who live here — unhurried, local, and honest.
              It&apos;s not a marketing pitch. It&apos;s more like a note from a neighbor who happens to know
              what&apos;s going on this week.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                ['📅', 'Events that match your interests', 'Filtered to the topics you actually care about.'],
                ['📰', 'A story worth knowing', 'One local news item worth your time, written for neighbors.'],
                ['⭐', 'Community highlights', 'New recommendations, forum threads, and local finds.'],
                ['🌿', 'A quiet island moment', 'Something to remind you why you live here.'],
              ].map(([emoji, title, desc]) => (
                <li key={title} className="flex gap-3 items-start p-4 bg-parchment-100 rounded-xl border border-parchment-200">
                  <span className="text-2xl shrink-0" aria-hidden="true">{emoji}</span>
                  <div>
                    <p className="font-semibold text-stone-800 text-base">{title}</p>
                    <p className="text-stone-500 text-sm mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Sample newsletter preview */}
            <h2 className="text-xl text-stone-900 mb-4 font-semibold">Here&apos;s a sample issue</h2>
            <div className="border border-parchment-300 rounded-2xl overflow-hidden shadow-warm-md bg-white">
              <div className="bg-forest-800 text-parchment-100 px-6 py-4 flex items-center gap-3">
                <img src="/logo.png" alt="" aria-hidden="true" role="presentation" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-sm">The WhidbeyWave Weekly</p>
                  <p className="text-forest-300 text-sm">Monday, March 2 &nbsp;·&nbsp; Your island digest</p>
                </div>
              </div>

              <div className="p-6 space-y-6 text-base">
                <p className="text-stone-600 italic leading-relaxed border-l-4 border-parchment-300 pl-4">
                  Good morning. It&apos;s grey and quiet and the herons are out early. Here&apos;s what&apos;s worth knowing this week.
                </p>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-forest-600 mb-3">📅 Coming Up</p>
                  <div className="space-y-3">
                    {sampleEvents.map(ev => (
                      <div key={ev.id} className="flex gap-3 items-start p-3 bg-parchment-50 rounded-lg border border-parchment-200">
                        <div className="shrink-0 w-10 h-10 bg-forest-600 text-parchment-50 rounded-lg flex flex-col items-center justify-center" aria-hidden="true">
                          <span className="text-xs font-bold leading-none">
                            {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-base font-extrabold leading-none">
                            {new Date(ev.date + 'T12:00:00').getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{ev.emoji} {ev.title}</p>
                          <p className="text-stone-500 text-sm">{ev.time} · {ev.town}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sound-600 mb-3">📰 Worth Knowing</p>
                  <div className="p-3 bg-sound-50 rounded-lg border border-sound-100">
                    <p className="font-semibold text-stone-800">{sampleNews.emoji} {sampleNews.title}</p>
                    <p className="text-stone-500 text-sm mt-1 leading-relaxed">{sampleNews.excerpt}</p>
                  </div>
                </div>

                <p className="text-sm text-stone-600 text-center border-t border-parchment-200 pt-4">
                  You&apos;re getting this because you signed up at WhidbeyWave.com · Unsubscribe anytime
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
