import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of use for WhidbeyWave.com.',
};

export default function TermsOfServicePage() {
  return (
    <>
      <div className="bg-gradient-to-br from-forest-800 to-sound-700 text-parchment-100 py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1
            className="text-3xl md:text-4xl font-bold text-parchment-50 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-parchment-300 text-sm">Last updated: March 23, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 text-base leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Welcome
            </h2>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of WhidbeyWave.com (&ldquo;WhidbeyWave,&rdquo;
              &ldquo;the site,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a community website
              for Whidbey Island, Washington. By using WhidbeyWave, you agree to these Terms.
              If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Using WhidbeyWave
            </h2>
            <p>WhidbeyWave is a free community resource. You may use the site to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browse events, news, marketplace listings, and community content</li>
              <li>Submit events, post marketplace listings, ask questions in the forum, and leave reviews</li>
              <li>Subscribe to the newsletter</li>
              <li>Access ferry status, tides, weather, and other island information</li>
            </ul>
            <p className="mt-3">
              You do not need an account to browse. Some features (posting to the forum, submitting events, etc.) require signing in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Your Account
            </h2>
            <p>
              When you create an account (via Google sign-in or email magic link), you are responsible for maintaining
              the security of your account. You agree to provide accurate information and to not impersonate others.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Content You Submit
            </h2>
            <p>
              When you submit content to WhidbeyWave (events, listings, forum posts, reviews, etc.), you:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Retain ownership of your content</li>
              <li>Grant WhidbeyWave a non-exclusive, royalty-free license to display, distribute, and promote your content on the site and in newsletters</li>
              <li>Confirm that your content is accurate and does not violate any laws or third-party rights</li>
              <li>Understand that submitted content may be reviewed, edited, or removed at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Community Guidelines
            </h2>
            <p>WhidbeyWave is built for neighbors. When using the site, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post spam, scams, or misleading content</li>
              <li>Harass, threaten, or bully other users</li>
              <li>Post content that is illegal, discriminatory, or harmful</li>
              <li>Use the site for commercial advertising unrelated to the Whidbey Island community</li>
              <li>Attempt to access other users&apos; accounts or private data</li>
              <li>Interfere with the site&apos;s operation or security</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove content and suspend accounts that violate these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Marketplace
            </h2>
            <p>
              WhidbeyWave provides a marketplace for community members to list items for sale, trade, or free.
              We are not a party to any transaction between buyers and sellers. We do not guarantee the quality,
              safety, or legality of items listed. All transactions are between the buyer and seller.
              Use good judgment and meet in safe, public locations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Events &amp; Information
            </h2>
            <p>
              Event listings, ferry status, tides, weather, and other information on WhidbeyWave is provided
              for convenience and may not always be accurate or up to date. We pull data from public sources
              (WSDOT, NOAA, Open-Meteo) and community submissions. Always verify important details
              (ferry schedules, event times, etc.) with the original source.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Disclaimer of Warranties
            </h2>
            <p>
              WhidbeyWave is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              either express or implied. We do not guarantee that the site will be uninterrupted, error-free, or
              free of harmful components. Your use of the site is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, WhidbeyWave and its operators shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use of the site,
              including but not limited to damages from marketplace transactions, inaccurate information,
              or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. We will post any changes on this page with an updated
              &ldquo;Last updated&rdquo; date. Continued use of WhidbeyWave after changes constitutes acceptance
              of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Contact Us
            </h2>
            <p>
              Questions about these Terms? Contact us at:{' '}
              <Link href="/contact" className="text-forest-600 hover:text-forest-800">whidbeywave.com/contact</Link>
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
