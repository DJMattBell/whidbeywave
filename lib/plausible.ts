/**
 * Fire a custom Plausible event. No-ops if Plausible isn't loaded.
 * Usage: trackEvent('persona-selected', { persona: 'local' })
 */
export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const plausible = (window as Window & { plausible?: (name: string, opts: { props?: Record<string, string | number> }) => void }).plausible;
  if (typeof plausible === 'function') {
    plausible(name, { props });
  }
}
