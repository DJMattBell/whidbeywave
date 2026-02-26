'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EVENT_TAGS } from '@/lib/data';
import type { EventTag } from '@/lib/data';

const EVENT_CATEGORIES = [
  'Nature & Wildlife',
  'Arts & Culture',
  'Farmers Market',
  'Music & Performance',
  'Outdoors & Recreation',
  'Film & Media',
  'Community & Social',
  'Classes & Workshops',
  'Food & Drink',
  'Sports & Fitness',
  'Other',
];

const TOWNS = [
  'Oak Harbor',
  'Coupeville',
  'Langley',
  'Freeland',
  'Greenbank',
  'Clinton',
  'Bayview',
  'Maxwelton',
  'Other',
];

const inputCls = 'w-full px-4 py-2.5 border border-parchment-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400';
const labelCls = 'block text-sm font-medium text-stone-700 mb-1.5';

export default function SubmitEventPage() {
  const [form, setForm] = useState({
    title: '', date: '', time: '', location: '', town: 'Oak Harbor',
    category: 'Community & Social', description: '',
    submitter_name: '', submitter_email: '',
  });
  const [tags, setTags]     = useState<EventTag[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function toggleTag(tag: EventTag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/events/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Could not reach the server. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-5" aria-hidden="true">🌿</div>
          <h1 className="text-2xl text-forest-800 mb-3">
            Submission received — thank you!
          </h1>
          <p className="text-stone-500 leading-relaxed mb-6">
            We&apos;ll review your event and you&apos;ll get a confirmation email when it goes live.
            Usually within a day or two.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/events" className="btn-primary">See All Events</Link>
            <button
              onClick={() => {
                setStatus('idle');
                setForm({ title: '', date: '', time: '', location: '', town: 'Oak Harbor', category: 'Community & Social', description: '', submitter_name: '', submitter_email: '' });
                setTags([]);
              }}
              className="btn-secondary"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-forest-800 to-sound-700 text-parchment-100 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-300 font-medium mb-2 tracking-wide uppercase text-sm">📅 Community Calendar</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-parchment-50">
            Submit an Event
          </h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            Got something happening on Whidbey? Fill this out and we&apos;ll get it on the calendar.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Event details */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-5">
            <h2 className="text-lg text-stone-900 font-semibold">Event details</h2>

            <div>
              <label htmlFor="ev-title" className={labelCls}>
                Event name <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <input
                id="ev-title"
                type="text"
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Langley Whale Watch Weekend"
                className={inputCls}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ev-date" className={labelCls}>
                  Date <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ev-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="ev-time" className={labelCls}>
                  Time <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ev-time"
                  type="text"
                  required
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                  placeholder="10:00 AM – 4:00 PM"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ev-location" className={labelCls}>
                  Venue / address <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ev-location"
                  type="text"
                  required
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="Coupeville Wharf"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="ev-town" className={labelCls}>
                  Town <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="ev-town"
                  required
                  value={form.town}
                  onChange={e => set('town', e.target.value)}
                  className={inputCls}
                >
                  {TOWNS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ev-category" className={labelCls}>Category</label>
              <select
                id="ev-category"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className={inputCls}
              >
                {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="ev-description" className={labelCls}>Description</label>
              <textarea
                id="ev-description"
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Tell people what to expect — who it's for, what to bring, cost if any…"
                className={inputCls + ' resize-none'}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6">
            <h2 className="text-lg text-stone-900 mb-1 font-semibold">
              Tags <span className="text-stone-400 font-normal text-sm">(pick all that apply)</span>
            </h2>
            <p className="text-xs text-stone-400 mb-4">Help people find your event through filters.</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Event tags">
              {EVENT_TAGS.map(tag => {
                const on = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={on}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
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
          </div>

          {/* Submitter info */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-4">
            <h2 className="text-lg text-stone-900 font-semibold">Your contact info</h2>
            <p className="text-xs text-stone-400 -mt-2">
              We&apos;ll email you when your event is approved. Not shown publicly.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ev-submitter-name" className={labelCls}>
                  Your name <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ev-submitter-name"
                  type="text"
                  required
                  value={form.submitter_name}
                  onChange={e => set('submitter_name', e.target.value)}
                  placeholder="Jane Smith"
                  className={inputCls}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="ev-submitter-email" className={labelCls}>
                  Your email <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ev-submitter-email"
                  type="email"
                  required
                  value={form.submitter_email}
                  onChange={e => set('submitter_email', e.target.value)}
                  placeholder="jane@example.com"
                  className={inputCls}
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-sm px-1" role="alert">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit My Event'}
          </button>

          <p className="text-xs text-stone-400 text-center">
            All events are reviewed before going live — usually within 48 hours.
          </p>
        </form>
      </div>
    </>
  );
}
