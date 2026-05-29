'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">🌊</p>
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">
          Something went wrong on our end
        </h1>
        <p className="text-stone-600 mb-6">
          We hit a snag. Give it another try — if it keeps happening, we&apos;re
          already looking into it.
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary px-6 py-3"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
