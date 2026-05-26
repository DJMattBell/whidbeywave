import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About WhidbeyWave',
  description:
    'WhidbeyWave is your neighbor\'s guide to everything happening on Whidbey Island — events, news, marketplace, and community.',
  openGraph: {
    title: 'About WhidbeyWave',
    description: 'Your neighbor\'s guide to everything happening on Whidbey Island — events, news, marketplace, and community.',
    siteName: 'WhidbeyWave',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About WhidbeyWave',
    description: 'Your neighbor\'s guide to everything happening on Whidbey Island.',
    images: ['/og-default.png'],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-800 to-sound-800 text-parchment-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-forest-300 font-medium mb-2 tracking-wide uppercase text-sm">🌊 Our Story</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-parchment-50">About WhidbeyWave</h1>
          <p className="text-parchment-300 text-lg max-w-xl mx-auto leading-relaxed">
            A community site built by an islander, for islanders.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* Mission */}
        <div className="prose prose-stone max-w-none mb-16">
          <div className="bg-parchment-50 rounded-2xl border border-parchment-200 shadow-warm p-8 md:p-10 space-y-5 text-stone-700 text-base leading-relaxed">
            <p className="text-xl text-stone-800 font-medium leading-relaxed">
              WhidbeyWave is a community news hub for Whidbey Island, Washington —
              a place to find out what&apos;s happening, share events, ask neighbors questions, and connect with the community.
            </p>

            <p>
              WhidbeyWave was started by Matthew Bell — born in Coupeville and island-raised, with 34 of
              his 38 years spent on Whidbey. Matthew is deeply woven into the fabric of this community:
              he teaches special education in the local public schools, leads the choir at Trinity Lutheran
              Church, runs the Whidbey Island DJ Collective, and serves as a founding member of Slaphappy,
              the island&apos;s own neighborhood watch and community safety group. The spark for WhidbeyWave
              came from a simple, familiar frustration — his wife kept missing events she would have loved,
              not from lack of interest, but because so much of what happens here never quite finds its
              audience. Concerts, markets, art shows, workshops, farm dinners — wonderful things, week
              after week, that too often slip by unnoticed. That felt like a problem worth solving.
            </p>

            <p>
              The vision for WhidbeyWave is something like what the Langley Community Center is for south
              Whidbey — a living hub where people come together, find what they need, and discover what&apos;s
              possible. A destination for visitors looking for genuine local recommendations, for islanders
              who want to stay connected to their neighbors, and for anyone with a need, a skill, or
              something beautiful to share. Matthew hopes this site grows into a true reflection of the
              community itself: a place where artists, teachers, musicians, farmers, and everyday neighbors
              can put their work and their voice into the world — and where anyone, newcomer or
              multi-generation islander, can find their way into the remarkable community we have here
              on Whidbey.
            </p>

            <p>
              WhidbeyWave is independently run, community-supported, and always free to use.
              Every event submitted, every question answered in the forum, and every local business
              recommended makes it a little more useful for everyone who calls this island home.
            </p>
          </div>
        </div>

        {/* What's on the site */}
        <h2 className="text-2xl text-stone-900 mb-6 font-semibold">What you&apos;ll find here</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {[
            {
              emoji: '📅',
              title: "What's On",
              desc: 'Community-submitted events reviewed and approved by neighbors. Submit yours anytime.',
              href: '/events',
            },
            {
              emoji: '📰',
              title: 'Island News',
              desc: 'Local stories about life on Whidbey — transportation, arts, agriculture, and community.',
              href: '/news',
            },
            {
              emoji: '💬',
              title: 'Ask the Island',
              desc: 'A community forum where you can ask questions and get answers from people who live here.',
              href: '/forum',
            },
            {
              emoji: '⭐',
              title: 'Local Picks',
              desc: 'Neighbor-recommended businesses, restaurants, services, and hidden gems across the island.',
              href: '/recommendations',
            },
            {
              emoji: '🛒',
              title: 'Buy & Sell',
              desc: 'A simple neighborhood marketplace for locals to buy, sell, and give away things.',
              href: '/marketplace',
            },
            {
              emoji: '📬',
              title: 'Newsletter',
              desc: 'A weekly digest of island events, news, and community updates — delivered to your inbox.',
              href: '/newsletter',
            },
          ].map(({ emoji, title, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-parchment-50 rounded-xl border border-parchment-200 p-5 hover:border-forest-300 hover:shadow-warm transition-all group"
            >
              <div className="text-3xl mb-2" aria-hidden="true">{emoji}</div>
              <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-forest-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Get involved */}
        <div className="bg-forest-50 rounded-2xl border border-forest-100 p-8 text-center">
          <h2 className="text-2xl text-forest-800 mb-2 font-semibold">Get involved</h2>
          <p className="text-forest-600 text-base mb-6 leading-relaxed">
            WhidbeyWave is built on community contributions. Submit an event, share a news tip,
            recommend a local business, or just say hello.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/submit-event" className="btn-primary">Submit an Event</Link>
            <Link href="/contact" className="btn-secondary">Say Hello</Link>
          </div>
        </div>

      </div>
    </>
  );
}
