import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type ErrorKind =
  | 'offline'
  | 'on-island-time'
  | 'form-validation'
  | 'sign-in-required'
  | 'locals-only'
  | 'not-found'
  | 'broken';

type ErrorStateProps = {
  kind: ErrorKind;
  /** What specifically is affected — e.g. "Ferry status", "Weather" */
  source?: string;
  /** Custom message override */
  message?: string;
  /** Last successful fetch timestamp */
  lastSuccessful?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Error ID for "broken" kind */
  errorId?: string;
};

export default function ErrorState({
  kind,
  source,
  message,
  lastSuccessful,
  onRetry,
  errorId,
}: ErrorStateProps) {
  switch (kind) {
    case 'offline':
      return (
        <div className="info-banner">
          <AlertTriangle className="text-sound-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold">You&apos;re offline</p>
            <p className="text-sm text-stone-600">
              {message ?? 'Showing what we have cached.'}
              {lastSuccessful && (
                <span className="block text-xs text-stone-500 mt-0.5">
                  Last refreshed: {lastSuccessful}
                </span>
              )}
            </p>
          </div>
        </div>
      );

    case 'on-island-time':
      return (
        <div className="error-banner">
          <AlertTriangle className="text-terra-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-semibold">
              {source ? `${source} is on island time` : 'On island time'}
            </p>
            <p className="text-sm text-stone-600">
              {message ?? `We can't reach ${source?.toLowerCase() ?? 'the data source'} right now. We'll keep trying.`}
              {lastSuccessful && (
                <span className="block text-xs text-stone-500 mt-0.5">
                  Last known data from {lastSuccessful}
                </span>
              )}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm font-medium text-terra-600 hover:text-terra-800 transition-colors"
              >
                Try again →
              </button>
            )}
          </div>
        </div>
      );

    case 'sign-in-required':
      return (
        <div className="success-banner">
          <div>
            <p className="font-semibold">
              {message ?? `You'll need to be signed in to ${source ?? 'continue'}`}
            </p>
            <Link
              href="#"
              className="mt-2 inline-block text-sm font-medium text-forest-600 hover:text-forest-800 transition-colors"
            >
              Sign in →
            </Link>
          </div>
        </div>
      );

    case 'not-found':
      return (
        <div className="empty-state">
          <AlertTriangle className="empty-state-icon" size={48} strokeWidth={1.5} />
          <h3 className="empty-state-title">
            {message ?? "This page doesn't exist on the island"}
          </h3>
          <p className="empty-state-text">
            It may have been moved or removed.
          </p>
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      );

    case 'broken':
      return (
        <div className="error-banner">
          <AlertTriangle className="text-terra-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-semibold">
              {message ?? `Something's broken on our end`}
            </p>
            <p className="text-sm text-stone-600">
              {source ? `The ${source.toLowerCase()} isn't working right now.` : ''} We&apos;ve been notified.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-terra-600 hover:text-terra-800 transition-colors"
                >
                  Try again →
                </button>
              )}
              <Link
                href="/contact"
                className="text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
              >
                Tell us what happened →
              </Link>
            </div>
            {errorId && (
              <p className="text-xs text-stone-400 mt-1">Error ID: {errorId}</p>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
