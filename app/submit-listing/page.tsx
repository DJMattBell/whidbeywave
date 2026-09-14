'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Clothing',
  'Tools',
  'Free Stuff',
  'Housing',
  'Vehicles',
  'Services',
  'Other',
];

const LOCATIONS = [
  'Oak Harbor',
  'Coupeville',
  'Langley',
  'Freeland',
  'Greenbank',
  'Clinton',
  'Other',
];

const CONTACT_METHODS = ['Email', 'Phone call', 'Text message', 'Any'];

const MAX_PHOTOS = 8;

const inputCls = 'input-base';
const labelCls = 'block text-sm font-medium text-stone-700 mb-1.5';

export default function SubmitListingPage() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: '',
    is_free: false,
    category: '',
    location: 'Oak Harbor',
    description: '',
    contact_method: 'Email',
    contact_email: '',
    contact_phone: '',
    // Barter fields
    barter_open: false,
    barter_seeking: '',
    // Flash give duration
    flash_give_duration: '' as '' | '24h' | '48h' | 'week',
    // Housing-specific fields
    bedrooms: '',
    bathrooms: '',
    neighborhood: '',
    available_date: '',
  });

  // Contact email: prefer user-typed value, fall back to auth email
  const effectiveEmail = form.contact_email || user?.email || '';

  const [photos, setPhotos] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function set<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function blur(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  function fieldError(field: string): string | null {
    if (!touched[field]) return null;
    switch (field) {
      case 'title': return form.title.trim().length < 3 ? 'Title must be at least 3 characters.' : null;
      case 'category': return !form.category ? 'Please pick a category.' : null;
      case 'description': return form.description.trim().length < 10 ? 'Please add a longer description (at least 10 characters).' : null;
      case 'contact_email': {
        const email = form.contact_email || user?.email || '';
        if (!email.trim()) return 'Email is required.';
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email.' : null;
      }
      default: return null;
    }
  }

  const listingRequired = ['title', 'category', 'description', 'contact_email'] as const;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos(prev => {
      const combined = [...prev, ...files];
      return combined.slice(0, MAX_PHOTOS);
    });
    e.target.value = '';
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(files: File[]): Promise<string[]> {
    if (!user) return [];
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      // Store under the user's ID folder for RLS scoping
      const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      try {
        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(filename, file, { contentType: file.type, upsert: false });
        if (data && !error) {
          const { data: urlData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(data.path);
          urls.push(urlData.publicUrl);
        }
      } catch {
        // Skip failed uploads — proceed with what succeeded
      }
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Touch all required fields to surface errors
    setTouched(Object.fromEntries(listingRequired.map(f => [f, true])));
    const email = form.contact_email || user?.email || '';
    if (
      form.title.trim().length < 3 ||
      !form.category ||
      form.description.trim().length < 10 ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) return;

    setStatus('uploading');
    setErrorMsg('');

    let imageUrls: string[] = [];
    if (photos.length > 0) {
      imageUrls = await uploadPhotos(photos);
    }

    setStatus('loading');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg('Your session expired. Please sign in again.');
        setStatus('error');
        return;
      }

      const res = await fetch('/api/listings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: form.title,
          price: form.is_free ? null : (form.price !== '' ? parseFloat(form.price) : null),
          is_free: form.is_free,
          category: form.category,
          location: form.location,
          description: form.description,
          contact_method: form.contact_method,
          contact_email: effectiveEmail,
          contact_phone: form.contact_phone || null,
          images: imageUrls,
          barter_open: form.is_free ? false : form.barter_open,
          barter_seeking: form.barter_open && !form.is_free ? form.barter_seeking || null : null,
          flash_give_duration: form.is_free && form.flash_give_duration ? form.flash_give_duration : null,
          ...(form.category === 'Housing' && {
            bedrooms:       form.bedrooms || null,
            bathrooms:      form.bathrooms || null,
            neighborhood:   form.neighborhood || null,
            available_date: form.available_date || null,
          }),
        }),
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

  // ── Auth loading ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌊</div>
      </div>
    );
  }

  // ── Auth gate ──
  if (!user) {
    return (
      <>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🏷️</div>
            <h1 className="text-2xl font-semibold text-stone-800 mb-2">
              Sign in to list an item
            </h1>
            <p className="text-stone-500 mb-5 text-sm leading-relaxed">
              You need a free account to post a listing. It only takes a minute.
            </p>
            <button onClick={() => setAuthOpen(true)} className="btn-primary">
              Sign in / Sign up
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Success ──
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
                setPhotos([]);
                setForm({
                  title: '', price: '', is_free: false, category: '',
                  location: 'Oak Harbor', description: '',
                  contact_method: 'Email',
                  contact_email: user.email ?? '',
                  contact_phone: '',
                  barter_open: false, barter_seeking: '', flash_give_duration: '' as '' | '24h' | '48h' | 'week',
                  bedrooms: '', bathrooms: '', neighborhood: '', available_date: '',
                });
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

  const busy = status === 'uploading' || status === 'loading';

  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-terra-600 font-medium mb-2 tracking-wide uppercase text-sm">Island Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-stone-900">List an Item</h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            No fees — just fill this out and we&apos;ll get it listed. Neighbors helping neighbors.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Photos */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-4">
            <div>
              <h2 className="text-lg text-stone-900 font-semibold">Photos</h2>
              <p className="text-sm text-stone-500 mt-0.5">
                Add up to {MAX_PHOTOS} photos. Listings with photos sell faster.
              </p>
            </div>

            {photos.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {photos.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-parchment-100 border border-parchment-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                      <div className="absolute top-1 right-1 p-2 -m-2">
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="w-8 h-8 bg-stone-900/70 text-white rounded-full flex items-center justify-center text-sm hover:bg-stone-900 transition-colors"
                          aria-label={`Remove photo ${i + 1}`}
                        >
                          ×
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-forest-600/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}

                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-parchment-300 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
                    >
                      <span className="text-2xl leading-none">+</span>
                      <span className="text-xs">Add</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-400">First photo will be the cover image</p>
              </>
            )}

            {photos.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 rounded-xl border-2 border-dashed border-parchment-300 flex flex-col items-center gap-2 text-stone-500 hover:border-forest-400 hover:text-forest-600 transition-colors bg-white"
              >
                <span className="text-3xl">📷</span>
                <span className="text-sm font-medium">Tap to add photos</span>
                <span className="text-xs text-stone-400">JPEG, PNG, WebP · up to {MAX_PHOTOS} photos</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              onChange={handlePhotoSelect}
              className="sr-only"
              aria-label="Upload listing photos"
            />
          </div>

          {/* Item details */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-5">
            <h2 className="text-lg text-stone-900 font-semibold">About your item</h2>

            <div>
              <label htmlFor="ls-title" className={labelCls}>
                What are you selling? <span className="text-terra-600" aria-hidden="true">*</span>
              </label>
              <input
                id="ls-title"
                type="text"
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                onBlur={() => blur('title')}
                placeholder="2019 Hobie Kayak"
                className={`${inputCls} ${fieldError('title') ? 'border-terra-400' : ''}`}
              />
              {fieldError('title') && <p className="text-terra-600 text-sm mt-1">{fieldError('title')}</p>}
            </div>

            {/* Price + free toggle */}
            <div>
              <label className={labelCls}>Price</label>
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_free}
                    onChange={e => set('is_free', e.target.checked)}
                    className="w-4 h-4 rounded border-parchment-300 text-forest-600 focus:ring-forest-400"
                  />
                  <span className="text-sm font-medium text-forest-700">This item is free</span>
                </label>
              </div>
              {form.is_free && (
                <div className="mt-2">
                  <label htmlFor="ls-duration" className={labelCls}>How long is this available?</label>
                  <select
                    id="ls-duration"
                    value={form.flash_give_duration}
                    onChange={e => set('flash_give_duration', e.target.value as '' | '24h' | '48h' | 'week')}
                    className={inputCls}
                  >
                    <option value="">No time limit</option>
                    <option value="24h">24 hours</option>
                    <option value="48h">48 hours</option>
                    <option value="week">1 week</option>
                  </select>
                </div>
              )}
              {!form.is_free && (
                <>
                  <input
                    id="ls-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="150"
                    className={inputCls}
                  />
                  <div className="mt-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.barter_open}
                        onChange={e => set('barter_open', e.target.checked)}
                        className="w-4 h-4 rounded border-parchment-300 text-forest-600 focus:ring-forest-400"
                      />
                      <span className="text-sm font-medium text-stone-700">Open to barter</span>
                    </label>
                    {form.barter_open && (
                      <div className="mt-2">
                        <label htmlFor="ls-barter-seeking" className={labelCls}>
                          What are you looking for? <span className="text-stone-500 font-normal">(optional)</span>
                        </label>
                        <textarea
                          id="ls-barter-seeking"
                          rows={2}
                          maxLength={500}
                          value={form.barter_seeking}
                          onChange={e => set('barter_seeking', e.target.value)}
                          placeholder="Looking for firewood, garden tools, or bike repairs…"
                          className={inputCls + ' resize-none'}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ls-category" className={labelCls}>
                  Category <span className="text-terra-600" aria-hidden="true">*</span>
                </label>
                <select
                  id="ls-category"
                  required
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  onBlur={() => blur('category')}
                  className={`${inputCls} ${fieldError('category') ? 'border-terra-400' : ''}`}
                >
                  <option value="">Pick a category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {fieldError('category') && <p className="text-terra-600 text-sm mt-1">{fieldError('category')}</p>}
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
            </div>

            {/* Housing-specific fields */}
            {form.category === 'Housing' && (
              <div className="space-y-4 pt-1 border-t border-parchment-200">
                <p className="text-sm font-medium text-stone-600">Housing details <span className="font-normal text-stone-400">(optional)</span></p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ls-bedrooms" className={labelCls}>Bedrooms</label>
                    <select
                      id="ls-bedrooms"
                      value={form.bedrooms}
                      onChange={e => set('bedrooms', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select…</option>
                      {['Studio', '1', '2', '3', '4+'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ls-bathrooms" className={labelCls}>Bathrooms</label>
                    <select
                      id="ls-bathrooms"
                      value={form.bathrooms}
                      onChange={e => set('bathrooms', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select…</option>
                      {['1', '1.5', '2', '2.5', '3+'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ls-neighborhood" className={labelCls}>General area</label>
                  <input
                    id="ls-neighborhood"
                    type="text"
                    value={form.neighborhood}
                    onChange={e => set('neighborhood', e.target.value)}
                    placeholder="General area — no need for exact address"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="ls-available-date" className={labelCls}>Available date</label>
                  <input
                    id="ls-available-date"
                    type="date"
                    value={form.available_date}
                    onChange={e => set('available_date', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="ls-description" className={labelCls}>
                Description <span className="text-terra-600" aria-hidden="true">*</span>
              </label>
              <textarea
                id="ls-description"
                required
                rows={5}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                onBlur={() => blur('description')}
                placeholder="Describe your item — condition, dimensions, what's included, pickup or delivery, any other details a buyer would want to know…"
                className={`${inputCls} resize-none ${fieldError('description') ? 'border-terra-400' : ''}`}
              />
              {fieldError('description') && <p className="text-terra-600 text-sm mt-1">{fieldError('description')}</p>}
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-6 space-y-4">
            <h2 className="text-lg text-stone-900 font-semibold">How buyers can reach you</h2>
            <p className="text-sm text-stone-600 -mt-2">
              Not shown publicly — we route messages through our contact form.
            </p>

            <div>
              <label htmlFor="ls-contact-method" className={labelCls}>Preferred contact method</label>
              <select
                id="ls-contact-method"
                value={form.contact_method}
                onChange={e => set('contact_method', e.target.value)}
                className={inputCls}
              >
                {CONTACT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ls-contact-email" className={labelCls}>
                  Email <span className="text-terra-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="ls-contact-email"
                  type="email"
                  required
                  value={effectiveEmail}
                  onChange={e => set('contact_email', e.target.value)}
                  onBlur={() => blur('contact_email')}
                  placeholder="jane@example.com"
                  className={`${inputCls} ${fieldError('contact_email') ? 'border-terra-400' : ''}`}
                  autoComplete="email"
                />
                {fieldError('contact_email') && <p className="text-terra-600 text-sm mt-1">{fieldError('contact_email')}</p>}
              </div>
              <div>
                <label htmlFor="ls-contact-phone" className={labelCls}>
                  Phone <span className="text-stone-500 font-normal">(optional)</span>
                </label>
                <input
                  id="ls-contact-phone"
                  type="tel"
                  value={form.contact_phone}
                  onChange={e => set('contact_phone', e.target.value)}
                  placeholder="(360) 555-0100"
                  className={inputCls}
                  autoComplete="tel"
                />
              </div>
            </div>

            <p className="text-xs text-stone-400">
              Listing as <strong>{user.email}</strong>
            </p>
          </div>

          {status === 'error' && (
            <p className="text-terra-600 text-base px-1" role="alert">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60"
          >
            {status === 'uploading' ? `Uploading ${photos.length} photo${photos.length !== 1 ? 's' : ''}…`
              : status === 'loading' ? 'Submitting…'
              : 'Submit My Listing'}
          </button>

          <p className="text-sm text-stone-600 text-center">
            All listings are reviewed before going live. Usually within 48 hours.
          </p>
        </form>
      </div>
    </>
  );
}
