# WhidbeyWave

A community news hub for Whidbey Island, Washington — part morning paper, part community center, always warm and unhurried.

**[whidbeywave.com](https://whidbeywave.com)**

## Why this exists

Too many good things on Whidbey Island — concerts, markets, art shows, farm dinners — slip by unnoticed. Not because people don't care, but because there's no single place to find it all. WhidbeyWave was started to fix that: one site where islanders can see what's happening today, ask their neighbors a question, find a local business worth visiting, or list something for sale.

The goal is to be the app Whidbey locals open every morning instead of Facebook.

## What's on the site

- **What's On** — Community-submitted events, reviewed and approved by neighbors
- **Island News** — Local stories about life on Whidbey
- **Ask the Island** — A community forum for questions and conversation
- **Local Picks** — Neighbor-recommended businesses and hidden gems
- **Buy & Sell** — A neighborhood marketplace for buying, selling, and giving things away
- **Ferry, Tides & Weather** — Live data from WSDOT, NOAA, and Open-Meteo
- **Weekly Newsletter** — A Monday morning digest delivered to your inbox

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with TypeScript
- [Tailwind CSS](https://tailwindcss.com) with a custom PNW-themed design system
- [Supabase](https://supabase.com) (PostgreSQL + Auth)
- [Resend](https://resend.com) for transactional and digest email
- [Vercel](https://vercel.com) for hosting and cron jobs
- WSDOT Ferry API, NOAA, and Open-Meteo for live island data

## Getting started

```bash
git clone https://github.com/DJMattBell/whidbeywave.git
cd whidbeywave
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev                        # http://localhost:3000
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for project structure, conventions, and environment variables.

## Design philosophy

WhidbeyWave follows a "morning paper" design: editorial content leads, utility data is always findable but never dominant. The homepage has a point of view about what matters today — it reads like a front page edited by a neighbor, not a dashboard or a portal.

The visual language is warm, mobile-first Pacific Northwest: forest greens, parchment creams, slate blues. Playfair Display for headings, Lora for body text. No sharp gradients, no glowing effects, nothing that reads "startup." Touch targets are 44px minimum. Empty sections are better than stale ones.

Full design system documentation lives in [`Planning Documents/design/DESIGN.md`](Planning%20Documents/design/DESIGN.md).

## Project structure

```
app/            Next.js App Router (pages + API routes)
components/     Shared React components
lib/            Utilities, data fetching, Supabase client
lib/scrapers/   Event scrapers (one file per source)
supabase/       Database migrations
public/         Static assets, logos, manifest
tests/          Playwright smoke tests, Vitest integration tests
```

## Contributing

WhidbeyWave is independently run and community-supported. Contributions are welcome — whether that's submitting events on the site, reporting bugs, or opening a pull request.

Start with [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and coding conventions.

## About

Built by [Matthew Bell](https://whidbeywave.com/about) — born in Coupeville, island-raised, 34 of 38 years on Whidbey. Teacher, choir director, DJ, and founding member of Slaphappy. The spark came from a familiar frustration: his wife kept missing events she would have loved, not from lack of interest, but because so much of what happens here never quite finds its audience.

WhidbeyWave is independently run, community-supported, and always free to use.

## License

All rights reserved. This codebase is public for transparency and collaboration, but is not licensed for redistribution or reuse without permission.
