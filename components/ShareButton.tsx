'use client';

import { useState } from 'react';

type Props = {
  title: string;
  url?: string;
};

export default function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

    // Use native share sheet on mobile if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-parchment-100 text-stone-600 border border-parchment-300 hover:border-forest-400 hover:text-forest-700 hover:bg-forest-50 transition-colors min-h-[44px]"
      aria-label={copied ? 'Link copied!' : 'Share this page'}
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span>
          <span>Link copied!</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">↗</span>
          <span>Share</span>
        </>
      )}
    </button>
  );
}
