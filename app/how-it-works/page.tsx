import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How WhidbeyWave Works — Getting Started Guide',
  description:
    'A simple guide to using WhidbeyWave — find island events, submit your own, ask questions, and connect with Whidbey neighbors.',
  openGraph: {
    title: 'How WhidbeyWave Works — Getting Started Guide',
    description: 'Find island events, submit your own, ask questions, and connect with Whidbey neighbors.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How WhidbeyWave Works',
    description: 'Find island events, submit your own, ask questions, and connect with Whidbey neighbors.',
    images: ['/og-default.png'],
  },
};

const sections = [
  {
    icon: '📅',
    heading: 'Finding things to do',
    bg: 'bg-white',
    content: (
      <>
        <p>
          Head to <strong>What&rsquo;s Going On</strong> and you&rsquo;ll find a running list of everything happening on the island — farmers markets, live music, library programs, kids&rsquo; activities, art shows, and more.
        </p>
        <p>
          You can filter by type if you&rsquo;re looking for something specific. Want to find just the music events? Or just things for kids? One tap and you&rsquo;re there.
        </p>
        <p>
          Every event on the calendar was submitted by a community member — a neighbor, a business, a local organization. This isn&rsquo;t a national events database. It&rsquo;s your island, curated by the people who live here.
        </p>
      </>
    ),
    button: { label: 'See What\'s On →', href: '/events' },
  },
  {
    icon: '✏️',
    heading: 'Got something happening? Tell the island.',
    bg: 'bg-parchment-50',
    content: (
      <>
        <p>
          Anyone can add an event — no account, no sign-in, no fee. Just fill in a few basics: the name of the event, the date, the time, where it is, and your email address so we can reach you if we have questions.
        </p>
        <p>
          We review every submission before it goes live, usually within a day or two. Once it&rsquo;s approved, you&rsquo;ll get an email letting you know it&rsquo;s on the calendar.
        </p>
        <p>
          It&rsquo;s free, and always will be. If something&rsquo;s happening on Whidbey, we want the island to know about it.
        </p>
      </>
    ),
    button: { label: 'Submit an Event →', href: '/submit-event' },
  },
  {
    icon: '💬',
    heading: 'Have a question? Ask your neighbors.',
    bg: 'bg-white',
    content: (
      <>
        <p>
          The forum is like a community bulletin board. You can ask anything — who&rsquo;s a good plumber in Coupeville, where to find fresh eggs locally, whether the Deception Pass road is icy this morning, what to do with a found cat.
        </p>
        <p>
          To post a question or reply, you do need to create a free account. But there&rsquo;s no password involved. We use what&rsquo;s called a <strong>magic link</strong>: just enter your email, and we&rsquo;ll send you a link. Click it and you&rsquo;re in. That&rsquo;s all there is to it — nothing to remember.
        </p>
        <p>
          Browsing and reading is always open to everyone, no sign-in needed.
        </p>
      </>
    ),
    button: { label: 'Ask the Island →', href: '/forum' },
  },
  {
    icon: '🛒',
    heading: 'Buying and selling with neighbors',
    bg: 'bg-parchment-50',
    content: (
      <>
        <p>
          The marketplace is for islanders to buy, sell, or give things away. Garden tools, furniture, boats, homemade jam — whatever you&rsquo;ve got.
        </p>
        <p>
          You can browse without creating an account. To list something, just fill out a short form with the item name, price, and a description. We review it and post it within a day or two.
        </p>
        <p>
          When someone&rsquo;s interested, they reach out through the site. No personal information is shown publicly — your email address stays private until you choose to share it yourself.
        </p>
      </>
    ),
    button: { label: 'Browse the Marketplace →', href: '/marketplace' },
  },
  {
    icon: '📬',
    heading: 'Get the island delivered to your inbox',
    bg: 'bg-white',
    content: (
      <>
        <p>
          Sign up for the free weekly newsletter and we&rsquo;ll send you a digest every Monday morning — upcoming events, island news, and community updates, all in one easy email.
        </p>
        <p>
          Every Thursday you&rsquo;ll also get a short <strong>&ldquo;This Weekend&rdquo;</strong> email with the highlights for the next few days. Great for planning a walk, a market visit, or a night out with friends.
        </p>
        <p>
          Unsubscribe anytime with one click. No hassle, no fine print.
        </p>
      </>
    ),
    button: { label: 'Sign Up Free →', href: '/newsletter' },
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-parchment-100 border-b border-parchment-200 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-600 font-medium mb-2 tracking-wide uppercase text-sm">Getting Started</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-stone-900">
            How WhidbeyWave Works
          </h1>
          <p className="text-stone-600 text-lg max-w-xl mx-auto leading-relaxed">
            A quick guide for getting the most out of your island&rsquo;s community website.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-6">
        {sections.map(({ icon, heading, bg, content, button }) => (
          <div
            key={heading}
            className={`${bg} rounded-2xl border border-parchment-200 shadow-warm p-8 md:p-10`}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl" aria-hidden="true">{icon}</span>
              <h2
                className="text-2xl text-stone-900 leading-snug"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
              >
                {heading}
              </h2>
            </div>

            <div className="space-y-4 text-lg text-stone-700 leading-relaxed mb-7">
              {content}
            </div>

            <Link
              href={button.href}
              className="btn-primary w-full sm:w-auto text-center justify-center"
            >
              {button.label}
            </Link>
          </div>
        ))}

        {/* Section 6 — Help */}
        <div className="bg-gradient-to-br from-forest-50 to-parchment-100 rounded-2xl border border-forest-200 shadow-warm p-8 md:p-10">
          <div className="flex items-center gap-4 mb-5">
            <span className="text-4xl" aria-hidden="true">📞</span>
            <h2
              className="text-2xl text-stone-900 leading-snug"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
            >
              Still have questions? We&rsquo;re real people.
            </h2>
          </div>

          <div className="space-y-4 text-lg text-stone-700 leading-relaxed mb-7">
            <p>
              WhidbeyWave is run by Matthew Bell, a Coupeville native and island teacher. If you&rsquo;re stuck, have a question, or want to submit something but aren&rsquo;t sure how — don&rsquo;t hesitate to reach out.
            </p>
            <p>
              You can call or text directly: <strong>(360) 926-9101</strong>. Or send a message through the contact page and Matthew will get back to you personally.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/contact" className="btn-primary text-center justify-center">
              Send a Message →
            </Link>
            <a
              href="tel:+13609269101"
              className="btn-secondary text-center justify-center"
            >
              Call (360) 926-9101
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
