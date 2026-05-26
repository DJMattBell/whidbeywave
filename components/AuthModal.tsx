'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { signInWithMagicLink, signInWithGoogle } from '@/lib/supabase';

type Props = {
  onClose: () => void;
};

export default function AuthModal({ onClose }: Props) {
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [googleLoading, setGoogleLoading] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const modalRef  = useRef<HTMLDivElement>(null);

  // Focus the email input when modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape key closes modal
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      // Basic focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signInWithGoogle();
    // Supabase redirects away; if we get here something failed
    setGoogleLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    const { error } = await signInWithMagicLink(email.trim().toLowerCase());
    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        className="relative bg-parchment-50 rounded-2xl shadow-warm-lg border border-parchment-300 w-full max-w-md p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-600 hover:text-stone-800 transition-colors p-1 rounded-lg hover:bg-parchment-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close sign-in dialog"
        >
          ✕
        </button>

        {status === 'sent' ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4" aria-hidden="true">📬</div>
            <h2 id="auth-modal-title" className="text-xl text-stone-900 mb-2 font-semibold">
              Check your email
            </h2>
            <p className="text-stone-600 text-base leading-relaxed">
              We emailed a sign-in link to{' '}
              <strong className="text-stone-800">{email}</strong>.
              Click the link in that email to sign in — no password needed.
            </p>
            <p className="text-stone-600 text-sm mt-3">The link expires after 1 hour. Check your spam folder if you don&apos;t see it.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logo.png" alt="" aria-hidden={true} role="presentation" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                <h2 id="auth-modal-title" className="text-lg font-bold text-forest-600">
                  Sign in to WhidbeyWave
                </h2>
              </div>
              <p className="text-stone-600 text-base leading-relaxed">
                Enter your email address and we&apos;ll send you a link to sign in —
                similar to a password reset link, but it logs you straight in.
                No password to create or remember.
              </p>
            </div>

            {/* Google sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || status === 'loading'}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-parchment-300 bg-white hover:bg-parchment-50 hover:border-stone-400 transition-colors text-stone-700 font-medium text-base shadow-sm disabled:opacity-60 min-h-[44px]"
            >
              {/* Google "G" logo */}
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-parchment-300" aria-hidden="true" />
              <span className="text-xs text-stone-600 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-parchment-300" aria-hidden="true" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-stone-700 mb-1.5">
                  Your email address
                </label>
                <input
                  id="auth-email"
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-parchment-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 text-stone-800 placeholder:text-stone-400"
                  aria-describedby={status === 'error' ? 'auth-error' : undefined}
                />
              </div>

              {status === 'error' && (
                <p id="auth-error" className="text-red-500 text-sm" role="alert">
                  Something went wrong — please try again, or check your email address.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || googleLoading}
                className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending…' : 'Email me a sign-in link'}
              </button>

              <p className="text-sm text-stone-600 text-center">
                We only use your email to sign you in. No spam, ever.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
