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
  'Other',
];

const inputCls = 'input-base';
const labelCls = 'block text-base font-medium text-stone-700 mb-2';

export default function SubmitEventPage() {
  const [form, setForm] = useState({
    title: '', date: '', time: '', location: '', town: 'Oak Harbor',
    category: 'Community & Social', description: '',
    submitter_name: '', submitter_email: '',
  });
  const [tags, setTags]         = useState<EventTag[]>([]);
  const [showExtra, setShowExtra] = useState(false);
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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
            Got it — thank you! 🌿
          </h1>
          <p className="text-stone-500 leading-relaxed mb-6">
            We&apos;ll email you at{' '}
            <strong className="text-stone-700">{form.submitter_email}</strong>{' '}
            when it&apos;s live on the calendar. Usually within a day or two.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/events" className="btn-primary">See All Events</Link>
            <button
              onClick={() => {
                setStatus('idle');
                setForm({ title: '', date: '', time: '', location: '', town: 'Oak Harbor', category: 'Community & Social', description: '', submitter_name: '', submitter_email: '' });
                setTags([]);
                setShowExtra(false);
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
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-700 font-medium mb-2 tracking-wide uppercase text-sm">Community Calendar</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-stone-900">
            Submit an Event
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            Got something happening on Whidbey? Fill this out and we&apos;ll get it on the calendar.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Warm intro note */}
        <p className="text-stone-500 text-base leading-relaxed mb-8">
          You don&apos;t need an account. Just fill in the basics and we&apos;ll review it — usually within a day or two.
        </p>

        <form onSubmit={handleSubmit} className="space-y-7" noValidate>

          {/* Warm section header */}
          <p className="text-xl text-stone-800 font-semibold leading-snug">
            Tell us about your event — just the basics are fine, we&apos;ll take care of the rest.
          </p>

          {/* Event name */}
          <div>
            <label htmlFor="ev-title" className={labelCls}>
              Event name <span className="text-terra-600" aria-hidden="true">*</span>
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

          {/* Date */}
          <div>
            <label htmlFor="ev-date" className={labelCls}>
              Date <span className="text-terra-600" aria-hidden="true">*</span>
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

          {/* Time */}
          <div>
            <label htmlFor="ev-time" className={labelCls}>
              Time <span className="text-terra-600" aria-hidden="true">*</span>
            </label>
            <input
              id="ev-time"
              type="text"
              required
              value={form.time}
              onChange={e => set('time', e.target.value)}
              placeholder="10:00 AM – 2:00 PM or just '2:00 PM' if you're not sure when it ends"
              className={inputCls}
            />
          </div>

          {/* Where is it */}
          <div>
            <label htmlFor="ev-location" className={labelCls}>
              Where is it happening? <span className="text-terra-600" aria-hidden="true">*</span>
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

          {/* Town */}
          <div>
            <label htmlFor="ev-town" className={labelCls}>
              Town <span className="text-terra-600" aria-hidden="true">*</span>
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

          {/* Category */}
          <div>
            <label htmlFor="ev-category" className={labelCls}>
              What kind of event is this?
            </label>
            <select
              id="ev-category"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={inputCls}
            >
              {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="ev-submitter-email" className={labelCls}>
              Your email — so we can let you know when it goes live <span className="text-terra-600" aria-hidden="true">*</span>
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

          {/* Optional details toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowExtra(v => !v)}
              className="flex items-center gap-2 text-forest-600 font-semibold text-base min-h-[48px] hover:text-forest-800 transition-colors"
            >
              <span className="text-xl leading-none">{showExtra ? '–' : '+'}</span>
              <span>{showExtra ? 'Hide extra details' : 'Add more details (optional)'}</span>
            </button>

            {showExtra && (
              <div className="mt-6 space-y-7">

                {/* Description */}
                <div>
                  <label htmlFor="ev-description" className={labelCls}>Description</label>
                  <textarea
                    id="ev-description"
                    rows={4}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Tell people what to expect — who it's for, what to bring, cost if any…"
                    className="input-base resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <p className={labelCls}>Tags <span className="text-stone-600 font-normal">(pick all that apply)</span></p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Event tags">
                    {EVENT_TAGS.map(tag => {
                      const on = tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          aria-pressed={on}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all min-h-[44px] ${
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

                {/* Your name */}
                <div>
                  <label htmlFor="ev-submitter-name" className={labelCls}>Your name</label>
                  <input
                    id="ev-submitter-name"
                    type="text"
                    value={form.submitter_name}
                    onChange={e => set('submitter_name', e.target.value)}
                    placeholder="Jane Smith"
                    className={inputCls}
                    autoComplete="name"
                  />
                </div>

              </div>
            )}
          </div>

          {status === 'error' && (
            <p className="text-terra-600 text-sm px-1" role="alert">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-primary justify-center py-4 text-lg disabled:opacity-60"
          >
            {status === 'loading' ? 'Submitting…' : 'Send It In →'}
          </button>

          <p className="text-sm text-stone-600 text-center">
            All events are reviewed before going live — usually within 48 hours.
          </p>

        </form>
      </div>
    </>
  );
}
