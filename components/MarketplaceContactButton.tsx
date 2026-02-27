'use client';

import { useState } from 'react';

interface Props {
  listingId: string;
  listingTitle: string;
  sellerName: string;
}

export default function MarketplaceContactButton({ listingId, listingTitle, sellerName }: Props) {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [message, setMessage] = useState(`Hi, I'm interested in "${listingTitle}". Is it still available?`);
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  function openModal() {
    setStatus('idle');
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    setOpen(false);
    document.body.style.overflow = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/listings/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, buyerName: name, buyerEmail: email, buyerPhone: phone, message }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('sent');
        setTimeout(() => closeModal(), 2500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="mt-4 w-full py-2.5 rounded-xl bg-forest-50 text-forest-700 font-semibold text-sm hover:bg-forest-100 transition-colors border border-forest-200 text-center"
      >
        📩 Contact Seller
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Contact seller about ${listingTitle}`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-parchment-50 rounded-2xl shadow-xl w-full max-w-md border border-parchment-200 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-forest-700 to-forest-600 text-parchment-50 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Message Seller
                </p>
                <p className="text-parchment-300 text-xs mt-0.5 truncate max-w-[240px]">{listingTitle}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-parchment-300 hover:text-parchment-50 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {status === 'sent' ? (
              <div className="px-6 py-10 text-center">
                <div className="text-5xl mb-3">🌿</div>
                <p className="text-stone-800 font-semibold text-lg mb-1"
                   style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Message sent!
                </p>
                <p className="text-stone-500 text-sm">{sellerName} will be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Your name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full px-3 py-2 text-sm border border-parchment-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Your email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 text-sm border border-parchment-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Phone <span className="text-stone-600 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(360) 555-1234"
                    className="w-full px-3 py-2 text-sm border border-parchment-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-parchment-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600">Something went wrong — please try again.</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-primary py-2.5 px-6 text-sm flex-1 disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-500 border border-parchment-300 hover:border-stone-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
