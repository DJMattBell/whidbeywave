import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-6">🌊</div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        The tide took this page out. Let&apos;s get you back to shore.
      </p>
      <Link href="/" className="btn-primary">
        Back to WhidbeyWave Home
      </Link>
    </div>
  );
}
