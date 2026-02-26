'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStatus('success');
          setTimeout(() => router.replace('/'), 1000);
        } else {
          setStatus('error');
        }
      });
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => router.replace('/'), 1000);
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4 animate-pulse">🌊</div>
            <p className="text-stone-600">Signing you in…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-forest-700 font-semibold"
               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              You&apos;re signed in. Welcome back.
            </p>
            <p className="text-stone-400 text-sm mt-1">Redirecting you home…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">🌧️</div>
            <p className="text-stone-700 font-semibold"
               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              That link didn&apos;t work.
            </p>
            <p className="text-stone-400 text-sm mt-1">It may have expired. Try signing in again.</p>
            <Link href="/" className="mt-4 inline-block btn-secondary">Back to Home</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-5xl animate-pulse">🌊</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
