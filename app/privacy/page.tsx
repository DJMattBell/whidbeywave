import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — WhidbeyWave',
  description: 'How WhidbeyWave.com collects, uses, and protects your information.',
  openGraph: {
    title: 'Privacy Policy — WhidbeyWave',
    description: 'How WhidbeyWave.com collects, uses, and protects your information.',
    siteName: 'WhidbeyWave',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-600 font-medium mb-2 tracking-wide uppercase text-sm">Legal</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            Privacy Policy
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">Last updated: March 23, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 text-base leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Who We Are
            </h2>
            <p>
              WhidbeyWave.com (&ldquo;WhidbeyWave,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a community website
              for Whidbey Island, Washington. We provide local events, news, a marketplace, community forum,
              and other island resources. Our website is located at{' '}
              <Link href="/" className="text-forest-600 hover:text-forest-800">whidbeywave.com</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-stone-800 mt-4">Information you provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> When you sign in with Google or email, we receive your email address and display name.</li>
              <li><strong>Content you submit:</strong> Events, marketplace listings, forum posts, replies, reviews, and feedback you voluntarily post.</li>
              <li><strong>Contact information:</strong> Name, email, and optional zip code when you use our contact form, newsletter signup, or community features.</li>
            </ul>

            <h3 className="text-lg font-medium text-stone-800 mt-4">Information collected automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Usage data:</strong> We use Vercel Analytics and Speed Insights to understand how visitors use the site. This collects anonymized page views, performance data, and general device information. No personal data is tracked.</li>
              <li><strong>Cookies:</strong> We use a small number of cookies for authentication (to keep you signed in) and preferences (such as your browsing persona). We do not use advertising or tracking cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve WhidbeyWave</li>
              <li>Display your submitted content (events, listings, forum posts) on the site</li>
              <li>Send you the WhidbeyWave newsletter if you subscribe</li>
              <li>Notify you about the status of your submissions (approved, etc.)</li>
              <li>Respond to your feedback or contact form messages</li>
              <li>Prevent spam and abuse</li>
            </ul>
            <p className="mt-3">
              We <strong>do not</strong> sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Third-Party Services
            </h2>
            <p>We use the following third-party services to operate WhidbeyWave:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase:</strong> Database and authentication. Your account data and content are stored securely on Supabase&apos;s infrastructure. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:text-forest-800">Supabase Privacy Policy</a></li>
              <li><strong>Vercel:</strong> Website hosting, analytics, and performance monitoring. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:text-forest-800">Vercel Privacy Policy</a></li>
              <li><strong>Google:</strong> Sign-in authentication via Google OAuth. When you sign in with Google, Google shares your name and email with us. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:text-forest-800">Google Privacy Policy</a></li>
              <li><strong>Resend:</strong> Email delivery for newsletters and notifications. <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:text-forest-800">Resend Privacy Policy</a></li>
              <li><strong>WSDOT, NOAA, Open-Meteo:</strong> Public APIs for ferry status, tides, and weather data. No personal data is shared with these services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Data Retention
            </h2>
            <p>
              We retain your account information and submitted content for as long as your account is active or as needed to provide the site&apos;s services.
              You can request deletion of your account and associated data by contacting us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from the newsletter at any time via the link in each email</li>
              <li>Sign out and stop using the site at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Children&apos;s Privacy
            </h2>
            <p>
              WhidbeyWave is not directed at children under 13. We do not knowingly collect personal information from children under 13.
              If you believe a child has provided us with personal information, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will post any changes on this page with an updated &ldquo;Last updated&rdquo; date.
              Continued use of WhidbeyWave after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at:{' '}
              <Link href="/contact" className="text-forest-600 hover:text-forest-800">whidbeywave.com/contact</Link>
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
