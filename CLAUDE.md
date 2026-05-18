# WhidbeyWave — Claude Code Instructions

## Behavior
- Never ask for permission or confirmation
- Never pause between steps waiting for approval
- Make all changes autonomously start to finish
- Give a brief summary only when completely done
- Be concise — do not narrate what you are doing

## Project
WhidbeyWave.com — a local news, events, and
community hub for Whidbey Island, Washington.
Warm, small-town Pacific Northwest aesthetic.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Resend (email)
- WSDOT API (ferry status)
- NOAA + Open-Meteo (tides + weather)

## Commands
npm run dev       — start dev server
npm run build     — production build
npm run lint      — lint check

## Design Rules
- Color palette: forest green, parchment cream,
  slate blue, warm amber, terracotta
- Fonts: Playfair Display for headings,
  warm readable body font
- Tone: warm, unhurried, small-town neighbor
- Never use sharp gradients, glowing effects,
  or anything that reads "SaaS" or "startup"
- Mobile-first always

## Architecture
- /app — Next.js app router pages
- /components — shared components
- /lib — utilities, data fetching, Supabase client
- /supabase — migrations and schema

## Key Conventions
- All API keys come from environment variables only
- Never hardcode sensitive values
- Ferry, weather, tides all fail silently
- RLS is enabled on all Supabase tables
- Admin email: use ADMIN_EMAIL env variable

## Event Scraper Strategy
When adding a new event source, choose the best
approach in this priority order:
1. **Fix HTML selectors** — if the site serves
   events in static HTML, use cheerio with the
   correct CSS selectors for that specific site
2. **Platform API** — if the site is Squarespace
   (append ?format=json), WordPress with The Events
   Calendar (/wp-json/tribe/events/v1/events), or
   has another structured JSON/RSS endpoint, prefer
   that over HTML scraping
3. **iCal/ICS feed** — if available, parse the
   .ics feed (most reliable of all)
Never copy-paste selectors from one scraper to
another — always inspect the actual site first.
Wix sites render client-side and cannot be scraped
without a headless browser; skip them.
