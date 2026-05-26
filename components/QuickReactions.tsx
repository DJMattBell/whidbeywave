'use client';

import { useState, useEffect } from 'react';

// #13 Quick Reactions on forum posts
// Uses localStorage for simplicity — no auth required

const REACTIONS = [
  { key: 'helpful', emoji: '👍', label: 'Helpful' },
  { key: 'agree',   emoji: '💯', label: 'Agree' },
  { key: 'thanks',  emoji: '🙏', label: 'Thanks' },
] as const;

type ReactionKey = typeof REACTIONS[number]['key'];

function getStorageKey(postId: string) {
  return `ww-reactions-${postId}`;
}

function getReactions(postId: string): Record<ReactionKey, number> {
  try {
    const raw = localStorage.getItem(getStorageKey(postId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { helpful: 0, agree: 0, thanks: 0 };
}

function getUserReaction(postId: string): ReactionKey | null {
  try {
    return localStorage.getItem(`ww-my-reaction-${postId}`) as ReactionKey | null;
  } catch {
    return null;
  }
}

export default function QuickReactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<ReactionKey, number>>({ helpful: 0, agree: 0, thanks: 0 });
  const [myReaction, setMyReaction] = useState<ReactionKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); setCounts(getReactions(postId)); setMyReaction(getUserReaction(postId));
  }, [postId]);

  function handleReaction(key: ReactionKey) {
    const newCounts = { ...counts };

    if (myReaction === key) {
      // Un-react
      newCounts[key] = Math.max(0, newCounts[key] - 1);
      setMyReaction(null);
      localStorage.removeItem(`ww-my-reaction-${postId}`);
    } else {
      // Remove previous reaction
      if (myReaction) {
        newCounts[myReaction] = Math.max(0, newCounts[myReaction] - 1);
      }
      // Add new reaction
      newCounts[key] = newCounts[key] + 1;
      setMyReaction(key);
      localStorage.setItem(`ww-my-reaction-${postId}`, key);
    }

    setCounts(newCounts);
    localStorage.setItem(getStorageKey(postId), JSON.stringify(newCounts));
  }

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {REACTIONS.map(({ key, emoji, label }) => {
        const active = myReaction === key;
        const count = counts[key];
        return (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            aria-label={`${label}${count > 0 ? ` (${count})` : ''}`}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[36px] ${
              active
                ? 'bg-forest-100 border-forest-300 text-forest-700 scale-105'
                : 'bg-parchment-50 border-parchment-200 text-stone-500 hover:bg-parchment-100 hover:border-parchment-300'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
