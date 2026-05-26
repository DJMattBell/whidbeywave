'use client';

import { useState } from 'react';

type Props = {
  title: string;
  url?: string;   // absolute URL or root-relative path (e.g. "/news#slug")
  text?: string;  // custom share text for native share sheet
};

export default function ShareButton({ title, url, text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Resolve relative paths against the current origin
    const shareUrl = url
      ? (url.startsWith('/') ? window.location.origin + url : url)
      : window.location.href;

    // Use native share sheet on mobile if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-parchment-100 text-stone-600 border border-parchment-200 hover:border-forest-400 hover:text-forest-700 hover:bg-forest-50 transition-colors min-h-[44px]"
      aria-label={copied ? 'Link copied!' : 'Share this page'}
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM5 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM11 10.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM7.5 7l1.5-.75M9 9.75 7.5 9" />
          </svg>
          <span>Share</span>
        </>
      )}
    </button>
  );
}
