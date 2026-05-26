import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What "Local" Means Here',
  description: 'How WhidbeyWave verifies local status for recommendations and community features.',
};

export default function LocalsPage() {
  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
            What &quot;Local&quot; Means Here
          </h1>
          <p className="text-stone-600">
            How we verify that recommendations come from neighbors
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose-ww">
        <p>
          Some features on WhidbeyWave — like recommending local businesses — are reserved for
          people who actually live on Whidbey Island. We call this &quot;local verification.&quot;
        </p>

        <h2>How it works</h2>
        <p>
          We verify locals by zip code. If your profile has a Whidbey Island zip code
          (98236, 98239, 98249, 98250, 98253, 98260, 98277, or 98278), you&apos;re verified as local.
        </p>
        <p>
          That&apos;s it. No ID check, no address verification, no activity thresholds.
          We trust that people telling us they live here actually do.
        </p>

        <h2>Why this matters</h2>
        <p>
          When Sarah from Langley recommends her electrician, that means something different
          than a review from someone passing through. Local knowledge is the whole point.
          Visitors are welcome to read everything — recommendations, reviews, all of it.
          But writing recommendations is a neighbors-only activity.
        </p>

        <h2>How to get verified</h2>
        <ol>
          <li>Sign in to your WhidbeyWave account</li>
          <li>Go to your <Link href="/profile">profile</Link></li>
          <li>Add your Whidbey Island zip code</li>
        </ol>
        <p>
          That&apos;s all. Once your zip is on file, you can recommend businesses immediately.
        </p>

        <h2>Limitations we&apos;re honest about</h2>
        <p>
          This is soft verification. Someone could enter a Whidbey zip without living here.
          We know that. We&apos;re choosing to start with trust and add friction only if abuse
          actually appears. So far, it hasn&apos;t. Island communities tend to self-police.
        </p>
      </div>
    </>
  );
}
