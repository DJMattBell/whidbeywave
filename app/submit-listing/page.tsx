'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  'Sporting Goods',
  'Arts & Crafts',
  'Food & Farm',
  'Furniture & Home',
  'Tools & Equipment',
  'Electronics',
  'Clothing & Accessories',
  'Books & Media',
  'Plants & Garden',
  'Vehicles & Boats',
  'Kids & Toys',
  'Other',
];

const LOCATIONS = [
  'Oak Harbor',
  'Coupeville',
  'Langley',
  'Freeland',
  'Greenbank',
  'Clinton',
  'Bayview',
  'Other',
];

const inputCls = 'w-full px-4 py-3 border border-parchment-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400';
const labelCls = 'block text-sm font-medium text-stone-700 mb-1.5';

export default function SubmitListingPage() {
  const [form, setForm] = useState({
    title: '', price: '', category: '', location: 'Oak Harbor',
    description: '', name: '', email: '', phone: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/listings/submit', {
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

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-5" aria-hidden="true">🏷️</div>
          <h1 className="text-2xl text-forest-800 mb-3 font-semibold">Listing received — thank you!</h1>
          <p className="text-stone-500 leading-relaxed text-base mb-6">
            We&apos;ll review your listing and get it added to the marketplace — usually within a day or two.
            Check your email for a confirmation.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/marketplace" className="btn-primary">Browse Marketplace</Link>
            <button
              onClick={() => {
                setStatus('idle');
                setForm({ title: '', price: '', category: '', location: 'Oak Harbor', description: '', name: '', email: '', phone: '' });
              }}
              className="btn-secondary"
            >
              List Another Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-700 via-forest-700 to-sound-800 text-parchment-100 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-amber-200 font-medium mb-2 tracking-wide uppercase text-sm">🛒 Island Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-parchment-50">List an Item</h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            No fees, no account required. Just fill this out and we&apos;ll get it listed — neighbors helping neighbors.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Item details */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-5">
            <h2 className="text-lg text-stone-900 font-semibold">About your item</h2>

            <div>
              <label htmlFor="ls-title" className={labelCls}>
                What are you selling? <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <input
                id="ls-title"
                type="text"
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="2019 Hobie Kayak"
                className={inputCls}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ls-price" className={labelCls}>
                  Price
                </label>
                <input
                  id="ls-price"
                  type="text"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="$200 or Free or Make an offer"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="ls-category" className={labelCls}>Category</label>
                <select
                  id="ls-category"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Pick a category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ls-location" className={labelCls}>Your town</label>
              <select
                id="ls-location"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className={inputCls}
              >
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="ls-description" className={labelCls}>
                Description <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <textarea
                id="ls-description"
                required
                rows={5}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe your item — condition, dimensions, what's included, pickup or delivery, any other details a buyer would want to know…"
                className={inputCls + ' resize-none'}
              />
            </div>
          </div>

          {/* Your info */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-4">
            <h2 className="text-lg text-stone-900 font-semibold">Your contact info</h2>
            <p className="text-sm text-stone-400 -mt-2">
              So interested buyers can reach you. Not shown publicly — we&apos;ll pass it along when someone asks.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ls-name" className={labelCls}>
                  Your name <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ls-name"
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
                <label htmlFor="ls-email" className={labelCls}>
                  Email <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="ls-email"
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
              <label htmlFor="ls-phone" className={labelCls}>
                Phone <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                id="ls-phone"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(360) 555-0100"
                className={inputCls}
                autoComplete="tel"
              />
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-500 text-base px-1" role="alert">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit My Listing'}
          </button>

          <p className="text-sm text-stone-400 text-center">
            All listings are reviewed before going live. Usually within 48 hours.
          </p>
        </form>
      </div>
    </>
  );
}
