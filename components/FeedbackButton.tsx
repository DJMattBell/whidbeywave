'use client';
import { useState, useEffect, useRef } from 'react';

export default function FeedbackButton() {
  const [open, setOpen]           = useState(false);
  const [message, setMessage]     = useState('');
  const [email, setEmail]         = useState('');
  const [status, setStatus]       = useState<'idle' | 'sending' | 'done'>('idle');
  const [currentPage, setCurrentPage] = useState('');
  const innerTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Clean up inner timeout on unmount
  useEffect(() => {
    return () => { clearTimeout(innerTimeoutRef.current); };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(window.location.pathname);
  }, []);

  // Auto-close after success
  useEffect(() => {
    if (status !== 'done') return;
    const id = setTimeout(() => {
      setOpen(false);
      // Reset after panel closes
      innerTimeoutRef.current = setTimeout(() => { setStatus('idle'); setMessage(''); setEmail(''); }, 300);
    }, 2500);
    return () => clearTimeout(id);
  }, [status]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: message.trim(), email: email.trim(), page: currentPage }),
      });
    } catch {
      // Non-fatal
    }
    setStatus('done');
  }

  return (
    <>
      {/* Floating feedback button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-20 right-4 z-50 bg-forest-600 text-white
                   rounded-full w-12 h-12 flex items-center justify-center
                   shadow-warm-md hover:bg-forest-700 transition-colors md:bottom-6 md:right-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 sm:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share feedback"
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-[320px]
                    bg-white shadow-2xl flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="bg-forest-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-parchment-50 font-semibold text-base">💬 Share Feedback</p>
            <p className="text-forest-300 text-xs mt-0.5 leading-snug">
              Something broken? Missing? Just want to say hi?<br />We read everything.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close feedback panel"
            className="text-forest-300 hover:text-parchment-50 transition-colors ml-3 shrink-0 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {status === 'done' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="text-5xl mb-4">🌿</div>
              <p className="text-lg font-semibold text-forest-700">Thanks!</p>
              <p className="text-stone-500 text-sm mt-1">We&apos;ll take a look.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fb-message" className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  What&apos;s on your mind? *
                </label>
                <textarea
                  id="fb-message"
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="I noticed that… / It would be great if… / Love the site!"
                  className="w-full px-3 py-2.5 border border-parchment-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 text-stone-800 placeholder:text-stone-400 resize-none"
                  style={{ minHeight: 100 }}
                />
              </div>
              <div>
                <label htmlFor="fb-email" className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                  Your email <span className="text-stone-600 font-normal normal-case">(optional — only if you&apos;d like a reply)</span>
                </label>
                <input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-parchment-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 text-stone-800 placeholder:text-stone-400"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending' || !message.trim()}
                className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send It →'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-parchment-200 shrink-0">
          <p className="text-[11px] text-stone-600 text-center">
            Feedback goes straight to Matthew · WhidbeyWave.com
          </p>
        </div>
      </div>
    </>
  );
}
