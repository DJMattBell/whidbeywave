/**
 * Fire a custom Plausible event. No-ops if Plausible isn't loaded.
 * Usage: trackEvent('persona-selected', { persona: 'local' })
 */
export function trackEvent(name: string, props?: Record<string, string | number>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = typeof window !== 'undefined' ? (window as any) : null;
  if (w && typeof w.plausible === 'function') {
    w.plausible(name, { props });
  }
}
