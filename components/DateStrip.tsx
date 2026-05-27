'use client';

type StripDate = { date: string; day: string; num: number; count: number };

type DateStripProps = {
  dates: StripDate[];
  today: string;
  onSelectDate: (date: string) => void;
};

export default function DateStrip({ dates, today, onSelectDate }: DateStripProps) {
  if (dates.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none py-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
      {dates.map(({ date, day, num, count }) => {
        const isToday = date === today;
        return (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium border transition-colors min-w-[52px] min-h-[44px] ${
              isToday
                ? 'bg-forest-600 text-parchment-50 border-forest-600'
                : 'bg-white text-stone-700 border-parchment-200 hover:border-forest-300 hover:bg-forest-50'
            }`}
          >
            <span className="uppercase tracking-wide">{day}</span>
            <span className="text-lg font-bold leading-tight">{num}</span>
            <span className={`text-[10px] ${isToday ? 'text-parchment-200' : 'text-stone-400'}`}>
              {count} evt{count !== 1 ? 's' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
