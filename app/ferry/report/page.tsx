'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import { SUPPORTED_FERRY_TERMINALS } from '@/lib/ferry';
import { Ship, ArrowLeft, Check } from 'lucide-react';

const TERMINAL_META: Record<string, { side: string }> = {
  Clinton:    { side: 'Island Side' },
  Mukilteo:   { side: 'Mainland Side' },
  Coupeville: { side: 'Island Side' },
  'Port Townsend': { side: 'Mainland Side' },
};

const DIRECTION_OPTIONS = [
  {
    value: 'departing',
    label: 'Departing',
    subtext: 'Waiting to board',
  },
  {
    value: 'arriving',
    label: 'Arriving',
    subtext: 'Queue you saw getting off — helps folks planning the reverse trip',
  },
];

const WAIT_OPTIONS = [0, 15, 30, 45, 60, 90, 120] as const;

type Step = 'terminal' | 'direction' | 'wait';

export default function FerryReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [step, setStep] = useState<Step>('terminal');
  const [terminal, setTerminal] = useState('');
  const [direction, setDirection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(waitMinutes: number) {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      if (!session) {
        setAuthOpen(true);
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/ferry-waits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          terminal,
          direction,
          wait_minutes: waitMinutes,
        }),
      });

      if (res.status === 429) {
        setError('You already reported at this terminal recently. Wait a few minutes.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }

      // Redirect immediately with toast flag
      router.push('/ferry?reported=1');
    } catch {
      setError('Something went wrong. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {/* Beta banner */}
      <div className="bg-sound-50 border-b border-sound-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <p className="text-sm text-sound-700">
            <strong>Beta:</strong> We&apos;re testing community wait reporting on the Clinton-Mukilteo run.
            If it&apos;s useful, we&apos;ll add Coupeville next.{' '}
            <Link href="/contact" className="text-forest-600 hover:text-forest-800 underline underline-offset-2">
              Tell us what you think.
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-parchment-100 border-b border-parchment-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/ferry" className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Ferry Status
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Report a Wait
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Three taps. Help your neighbors plan their commute.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="error-banner mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Terminal */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-1">
            {step === 'terminal' ? '1. Which terminal?' : `Terminal: ${terminal}`}
          </h2>
          {step !== 'terminal' && (
            <button
              onClick={() => { setStep('terminal'); setDirection(''); }}
              className="text-sm text-forest-600 hover:text-forest-800 transition-colors"
            >
              Change
            </button>
          )}

          {step === 'terminal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {SUPPORTED_FERRY_TERMINALS.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    if (!user) { setAuthOpen(true); return; }
                    setTerminal(t);
                    setStep('direction');
                  }}
                  className="card-pressable p-5 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Ship size={24} className="text-sound-600 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-stone-900 group-hover:text-forest-600 transition-colors">
                        {t}
                      </p>
                      <p className="text-xs text-stone-500">
                        {TERMINAL_META[t]?.side ?? ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step !== 'terminal' && terminal && (
            <div className="flex items-center gap-2 mt-2">
              <Check size={16} className="text-forest-600" />
              <span className="text-sm text-stone-600">{terminal} ({TERMINAL_META[terminal]?.side})</span>
            </div>
          )}
        </div>

        {/* Step 2: Direction */}
        {(step === 'direction' || step === 'wait') && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-1">
              {step === 'direction' ? '2. Which direction?' : `Direction: ${direction}`}
            </h2>
            {step === 'wait' && (
              <button
                onClick={() => setStep('direction')}
                className="text-sm text-forest-600 hover:text-forest-800 transition-colors"
              >
                Change
              </button>
            )}

            {step === 'direction' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {DIRECTION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setDirection(opt.value);
                      setStep('wait');
                    }}
                    className="card-pressable p-5 text-left group"
                  >
                    <p className="font-semibold text-stone-900 group-hover:text-forest-600 transition-colors">
                      {opt.label}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 leading-snug">
                      {opt.subtext}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {step === 'wait' && direction && (
              <div className="flex items-center gap-2 mt-2">
                <Check size={16} className="text-forest-600" />
                <span className="text-sm text-stone-600 capitalize">{direction}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Wait time */}
        {step === 'wait' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-800 mb-4">
              3. How long is the wait?
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {WAIT_OPTIONS.map(mins => (
                <button
                  key={mins}
                  onClick={() => submit(mins)}
                  disabled={submitting}
                  className="card-pressable py-4 px-2 text-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-xl font-bold text-sound-700 group-hover:text-forest-600 transition-colors tabular-nums">
                    {mins}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">min</p>
                </button>
              ))}
            </div>
            {submitting && (
              <p className="text-sm text-stone-500 mt-4 text-center">Submitting…</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
