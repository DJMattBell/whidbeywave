'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import FlashGiveSubscriptionSheet from '@/components/FlashGiveSubscriptionSheet';

export default function FlashGiveCTA() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="card-pressable group p-4 text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center shrink-0">
            <Gift className="text-forest-600" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-800 group-hover:text-forest-600 transition-colors">
              Get free stuff alerts
            </p>
            <p className="text-xs text-stone-500">
              Know when neighbors give things away
            </p>
          </div>
        </div>
      </button>

      {sheetOpen && <FlashGiveSubscriptionSheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}
