'use client';

import { useState } from 'react';

const PHONE_DISPLAY = '(360) 926-9101';
const PHONE_TEL = 'tel:+13609269101';

const inputCls =
  'w-full px-4 py-3 border border-parchment-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent text-stone-800 placeholder:text-stone-400';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', topic: '', phone: '', message: '', website: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const honeypot = (e.currentTarget as HTMLFormElement).elements.namedItem('_gotcha') as HTMLInputElement;
    if (honeypot?.value) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  const preferPhone = form.topic === 'phone';

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-terra-600 to-forest-800 text-parchment-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-terra-200 font-medium mb-2 tracking-wide uppercase text-sm">✉️ Drop Us a Note</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-parchment-50">Say Hello</h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            We&apos;d love to hear from you — whether it&apos;s an event, a story, something to sell, or just a wave.
          </p>
        </div>
      </div>

      {/* Mobile phone callout — above the form, phones only */}
      <div className="md:hidden bg-amber-50 border-b border-amber-200 px-4 py-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">📞</span>
          <div>
            <p className="text-stone-700 text-base leading-snug mb-1">
              Prefer to call or text? Reach Matthew at
            </p>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center min-h-[48px] text-forest-700 font-bold text-xl hover:text-forest-900 transition-colors"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="text-stone-500 text-sm mt-0.5">Happy to help.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/*
          Mobile: form comes first (order-first), sidebar below.
          Desktop: sidebar left (1 col), form right (2 cols).
        */}
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Contact form — first on mobile */}
          <div className="lg:col-span-2 order-first lg:order-last">
            <div className="bg-parchment-50 rounded-2xl shadow-warm-md border border-parchment-200 p-8">
              <h2 className="text-2xl text-stone-900 mb-1 font-semibold">Send us a message</h2>
              <p className="text-stone-500 text-base mb-6 leading-relaxed">
                Or call/text Matthew at{' '}
                <a
                  href={PHONE_TEL}
                  className="text-forest-600 hover:text-forest-800 font-medium transition-colors"
                >
                  {PHONE_DISPLAY}
                </a>{' '}
                if that&apos;s easier.
              </p>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4" aria-hidden="true">🌿</div>
                  <h3 className="text-xl font-bold text-forest-700 mb-2">Message sent — thank you!</h3>
                  <p className="text-stone-500 text-base leading-relaxed max-w-sm mx-auto">
                    We&apos;ll read it and get back to you — usually within a day or two.
                  </p>
                  <button
                    onClick={() => { setForm({ name: '', email: '', topic: '', phone: '', message: '', website: '' }); setStatus('idle'); }}
                    className="mt-6 btn-secondary"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-base font-medium text-stone-700 mb-2">
                        Your Name <span className="text-red-400" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Jane Smith"
                        className={inputCls}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-base font-medium text-stone-700 mb-2">
                        Email <span className="text-red-400" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="jane@example.com"
                        className={inputCls}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-topic" className="block text-base font-medium text-stone-700 mb-2">
                      What&apos;s this about?
                    </label>
                    <select
                      id="contact-topic"
                      value={form.topic}
                      onChange={e => set('topic', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Pick one…</option>
                      <option value="event">Sharing an Event</option>
                      <option value="news">News Tip</option>
                      <option value="listing">Marketplace Listing</option>
                      <option value="advertising">Working Together</option>
                      <option value="feedback">Website Feedback</option>
                      <option value="general">Just Saying Hello</option>
                      <option value="phone">I&apos;d rather call</option>
                    </select>
                  </div>

                  {preferPhone ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-5 text-stone-700 text-base leading-relaxed">
                      No problem! Give Matthew a call or text at{' '}
                      <a
                        href={PHONE_TEL}
                        className="text-forest-700 font-bold hover:text-forest-900 transition-colors"
                      >
                        {PHONE_DISPLAY}
                      </a>{' '}
                      — he&apos;s usually available during island hours.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="contact-phone" className="block text-base font-medium text-stone-700 mb-2">
                          Phone <span className="text-stone-600 font-normal">(optional)</span>
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          value={form.phone}
                          onChange={e => set('phone', e.target.value)}
                          placeholder="(360) 555-0100"
                          className={inputCls}
                          autoComplete="tel"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-message" className="block text-base font-medium text-stone-700 mb-2">
                          Your message <span className="text-red-400" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={6}
                          value={form.message}
                          onChange={e => set('message', e.target.value)}
                          placeholder="Tell us what's on your mind. Event details, listing info, story tips, or just a hello — we're glad you stopped by…"
                          className={inputCls + ' resize-none'}
                        />
                      </div>

                      {/* Honeypot fields — invisible to humans, bots fill them */}
                      <div className="hidden" aria-hidden="true">
                        <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
                      </div>
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={e => set('website', e.target.value)}
                        style={{ position: 'absolute', left: '-10000px', width: 0, height: 0, overflow: 'hidden' }}
                        aria-hidden="true"
                      />

                      {status === 'error' && (
                        <p className="text-red-500 text-base" role="alert">{errorMsg}</p>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <button type="submit" disabled={status === 'loading'} className="btn-primary py-3 text-base disabled:opacity-60">
                          {status === 'loading' ? 'Sending…' : 'Send It Along →'}
                        </button>
                        <p className="text-sm text-stone-600 leading-relaxed">
                          We&apos;ll get back to you — usually within a day or two. No spam, ever.
                        </p>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>

            {/* Map placeholder */}
            <div className="mt-6 bg-gradient-to-br from-forest-50 to-sound-50 rounded-2xl h-40 flex items-center justify-center border border-parchment-300 shadow-warm-sm">
              <div className="text-center text-forest-600">
                <div className="text-4xl mb-2" aria-hidden="true">🗺️</div>
                <p className="text-base font-medium">Whidbey Island, Washington</p>
                <p className="text-sm text-stone-600 mt-1">Island County &nbsp;·&nbsp; Puget Sound</p>
              </div>
            </div>
          </div>

          {/* Info sidebar — second on mobile */}
          <div className="lg:col-span-1 order-last lg:order-first space-y-6">
            <div>
              <h2 className="text-xl text-stone-900 mb-2 font-semibold">We&apos;d love to hear from you</h2>
              <p className="text-stone-600 leading-relaxed text-base">
                We&apos;re a small, island-run operation. We read every message and usually get back to you within a day or two.
              </p>
            </div>

            {/* Phone card — first in sidebar */}
            <div className="rounded-xl p-4 border bg-parchment-50 border-parchment-200 flex gap-3">
              <span className="text-2xl shrink-0" aria-hidden="true">📞</span>
              <div>
                <p className="text-stone-800 text-base font-semibold mb-0.5">Call or Text</p>
                <a
                  href={PHONE_TEL}
                  className="text-forest-600 hover:text-forest-800 text-base font-medium transition-colors"
                >
                  {PHONE_DISPLAY}
                </a>
                <p className="text-stone-600 text-sm mt-0.5">Whidbey Island DJ Collective</p>
              </div>
            </div>

            {[
              {
                emoji: '📅',
                title: 'Share an Event',
                desc: 'Community events, festivals, classes, pop-ups — we love listing them all.',
                color: 'bg-forest-50 border-forest-200',
              },
              {
                emoji: '📰',
                title: 'News Tips',
                desc: "Got a story about Whidbey? Send us your tip and we'll look into it.",
                color: 'bg-sound-50 border-sound-200',
              },
              {
                emoji: '🛒',
                title: 'List on the Marketplace',
                desc: "Tell us about your item and we'll add it to the marketplace.",
                color: 'bg-amber-50 border-amber-200',
              },
              {
                emoji: '📣',
                title: 'Work With Us',
                desc: 'Interested in reaching Whidbey residents? Ask us about our options.',
                color: 'bg-terra-50 border-terra-200',
              },
            ].map(({ emoji, title, desc, color }) => (
              <div key={title} className={`rounded-xl p-4 border ${color} flex gap-3`}>
                <span className="text-2xl shrink-0" aria-hidden="true">{emoji}</span>
                <div>
                  <p className="text-stone-800 text-base font-semibold mb-0.5">{title}</p>
                  <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <p className="text-base text-stone-500 leading-relaxed">
                <span aria-hidden="true">📍</span>{' '}
                Serving <strong>Oak Harbor · Langley · Coupeville · Freeland</strong> and all of beautiful Whidbey Island, WA.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
