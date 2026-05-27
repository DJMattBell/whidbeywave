# WhidbeyWave Homepage Brief

This is the design brief for the WhidbeyWave homepage. It documents what the homepage is for, who it serves, and how it should be structured. Phases 1b (events page redesign) and 1c (homepage rebalance) execute against this brief. Future contributors should read this before modifying the homepage.

---

## What WhidbeyWave Is

WhidbeyWave is a community news hub for Whidbey Island, Washington — a place to find out what's happening, share events, ask neighbors questions, and connect with the community. It was started because too many good things on the island — concerts, markets, art shows, farm dinners — slip by unnoticed. The site aspires to be the app Whidbey locals open every morning instead of Facebook: part morning paper, part community center, always warm and unhurried.

## Who It's For

The primary audience is Whidbey Island residents — people who live here year-round, who want to know what's happening today and this week, who have things to sell or give away, who want to ask their neighbors a question or recommend a local business. The site should serve a resident's daily habit: open it in the morning, see what matters, maybe come back later to check the ferry.

The secondary audience is visitors — people planning a trip or already on the island, looking for restaurants, ferry tips, farmers markets, and things to do this weekend. Visitor content has a dedicated surface (/visit) and does not compete for homepage space.

## The Homepage's Job

The homepage is a morning paper. You open it and the first thing you see is the day's most relevant story — an event happening tonight, a news piece that dropped this morning, a community conversation worth joining. Below that, a curated discovery feed: what's coming this week, what your neighbors are saying, what's for sale. Utility data — weather, ferry status, tides — is always present and always findable, but it sits in a standing utility box, not in the lead position. The page has a point of view about what matters today. It is organized *and* prioritized.

The project's founding documents use two framings for this site: the roadmap's "morning paper on your porch" and the About page's "Langley Community Center." When these framings diverge on layout decisions, the morning paper wins. The community center vision is served by tone, voice, and contribution surfaces — not by literal layout structure. The homepage reads like a front page edited by a neighbor, not like a bulletin board in a warm room.

## What the Homepage Shows, Top to Bottom

The homepage follows a morning paper layout. This table maps the analogy to specific components:

| Morning paper element | Homepage component | Position |
|---|---|---|
| Masthead + weather strip | Hero + at-a-glance data strip | 1st (top) |
| Lead story | Lead Story Card (today's event or news) | 2nd |
| Section navigation | Reduced action card grid (4 cards) | 3rd |
| This week's calendar | "Coming Up on the Island" events | 4th |
| Letters to the editor | "Neighbors Are Talking About" community voice | 5th |
| Weather/ferry/tides box | Slim Today on Whidbey utility shelf | 6th |
| News section | "From Around the Island" news/forum/picks | 7th |
| Classifieds | Neighborhood Marketplace (free + for-sale) | 8th |
| "Join us" / masthead redux | Closing CTA + Visitor CTA | 9th–10th (bottom) |

### 1. Hero + At-a-Glance Strip

The hero is the masthead. A gradient (photo-ready for a future Whidbey landscape), a time-of-day greeting ("Good morning, Whidbey"), the headline "Your island, at a glance," and a primary CTA ("See What's On"). Pinned to the bottom edge: a single-line data strip showing current temperature, ferry status, and next tide. This is the newspaper's weather line in the masthead — always visible, never dominant.

The hero is ~200px on mobile, ~300px on desktop. It establishes the brand, orients the reader, and provides a utility glance without requiring scroll.

The ferry segment in the data strip includes a "Buy ticket" action link pointing to the [WSF Wave2Go Mukilteo/Clinton ticket purchase page](https://wave2go.wsdot.com/webstore/shop/viewItems.aspx?cg=21&c=50). The link is always visible — even when ferry alerts are active and the segment has an amber accent. This is the natural next step: you see the ferry is running, you buy your ticket. One tap, no navigation.

### 2. Lead Story Card

The single most relevant thing on the island right now. This is the front page's lead story — the reason you picked up the paper. A large, prominent card immediately below the hero, taking significant vertical space (~200px minimum on mobile).

Selection priority chain:
1. Event happening right now (started within last 4 hours)
2. Event happening later today
3. Event happening tomorrow (only surfaced after 6pm Pacific)
4. Latest published news story (less than 48 hours old)
5. Most active forum thread (3+ replies in last 24 hours)
6. Null — if nothing qualifies, the slot is skipped. The page never shows a forced or stale lead.

The card carries a type label ("Happening Today," "Tomorrow on Whidbey," "Island News," "Neighbors are talking about"), a large Playfair title, 1-2 lines of context, and a category badge. Its top accent bar uses the design system's semantic color: amber for events, forest for news, sound for forum threads.

### 3. Action Card Grid (4 cards)

Four navigation cards in a 2x2 grid on mobile, a single row on desktop:
- What's On (events)
- Island News
- Ask the Island (forum)
- Buy & Sell (marketplace)

These are navigation aids — section headers in the newspaper. They use icon + label + one-line subtitle. No live data. No status indicators. The morning paper's section headers say "Sports," not "Sports — Yankees 4, Red Sox 2."

### 4. Coming Up on the Island (Events)

Three upcoming event cards in a responsive grid. This is the newspaper's events calendar preview — what's worth putting on your calendar this week.

Relationship to the lead story: if the lead story card is showing an event, the events section excludes that event and shows events starting after the lead event's end time. If the lead is news or a forum thread, the section shows events starting after today's end-of-day (i.e., tomorrow onward). If fewer than 3 events qualify in the next 7 days, the window expands to 14 days, then 30 days. If no events qualify at 30 days, the section is hidden entirely.

### 5. Neighbors Are Talking About (Community Voice)

A single compact card showing the most active Ask the Island thread from the last 7 days. Styled as a conversation snippet — a quote or question, reply count, link to the full thread. Background: forest-50. This is the letter to the editor, the overheard conversation at the coffee shop.

Community voice precedes utility because the homepage is editorial. Utility data is always findable via hero strip, nav, and inner pages; the homepage's job is to surface what residents are doing and saying, not what the weather is.

If no forum thread has 3+ replies in the last 7 days, this card is skipped.

### 6. Today on Whidbey (Utility Shelf)

A compact single-row strip — not a card grid. Three inline segments separated by subtle dividers:

`Weather icon 62 deg F Partly cloudy | Ferry icon All routes on sched. | Calendar icon 3 events today`

Minimal chrome: no card borders, no bold labels, no individual backgrounds. Sits in a sound-50 background band, roughly 48px tall. This is the newspaper's standing weather box — always there, quickly scanable, never the lead.

The ferry segment includes two action links: a primary "Buy Mukilteo/Clinton ticket" link (target: [https://wave2go.wsdot.com/webstore/shop/viewItems.aspx?cg=21&c=50](https://wave2go.wsdot.com/webstore/shop/viewItems.aspx?cg=21&c=50), opens in new tab) and a secondary smaller "Reserve PT/Coupeville" link (target: [https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/default.aspx](https://secureapps.wsdot.wa.gov/Ferries/Reservations/Vehicle/default.aspx), opens in new tab). The wording differs because the Mukilteo/Clinton route sells tickets while the Port Townsend/Coupeville route uses a reservation system. Both links are always present regardless of alert state.

If ferry alerts are active, the ferry segment gains an amber accent and the alert count. FerryAlerts (the expandable alert banner) renders directly below this strip.

### 7. From Around the Island (News + Community Mix)

Two to three cards showing recent news stories, with fallback to forum threads, marketplace listings, or Local Picks when news is sparse. The existing adaptive heading logic ("From Around the Island" / "What the Island's Talking About" / etc.) stays. This is the newspaper's feature section — stories, profiles, community voices.

### 8. Neighborhood Marketplace

A single combined section replacing the previous separate "Neighbors Are Giving" (free listings) and "Things for Sale" sections. Shows 3-4 items mixing free gives, trades, and for-sale listings, with a "Browse the marketplace" link to /marketplace. One classifieds section, like a real newspaper.

### 9. Closing CTA

"This is your site as much as ours." Submit an Event and Post a Listing buttons. Newsletter signup link. This is the participation invitation — the community center's contribution surface, architecturally grounded at the base of the editorial page.

### 10. Visitor Guide CTA

"Got friends visiting Whidbey?" A compact card linking to /visit. Positioned last — visitors are the secondary audience and have their own dedicated surface.

## What the Homepage Does NOT Do

- **It is not a dashboard.** Live data is findable, not primary. The homepage does not lead with weather, ferry status, or tide charts.
- **It is not a portal.** The homepage does not try to link to everything. Four action cards, not six or eight. The nav and bottom tab bar handle comprehensive site navigation.
- **It is not a bulletin board.** Content types are not shown at equal weight. The page has an editorial hierarchy: lead story, then events, then community, then utility, then classifieds.
- **It is not a visitor landing page.** Visitor content lives at /visit. The homepage serves residents first.
- **It does not show stale content.** Every section has a freshness threshold and a null/skip state. An empty section is better than a stale one.

## What Changed from Phase 0.6

Phase 0.6 completed the homepage's utility-promotion work. That work correctly answered the audits that flagged live data as buried and hard to find. The Phase 1c rebalance preserves that work but repositions it: utility data moves from "primary homepage content" to "findable standing feature." This is a rebalance, not a repudiation. Phase 0.6 solved the right problem; Phase 1c adjusts the altitude.

Specific changes:

- **Action card grid:** 6 cards to 4 cards. Ferry, Tides, and Guides cards removed (Ferry and Tides are redundant with the hero strip and nav; Guides is not a daily-check surface).
- **Action cards:** Live micro-data removed. Cards return to pure navigation (icon + label + subtitle).
- **TodayWidget:** Three-card dashboard panel becomes a single-row utility strip. Visual weight reduced roughly 70%.
- **TodayWidget position:** 2nd (immediately after hero) to 6th (after events and community voice). Lead story and discovery sections now precede it.
- **New: Lead Story Card** at position 2. The homepage's editorial lead — the single most relevant thing today.
- **New: Community Voice card** at position 5. The most active Ask the Island thread, surfaced as a conversation snippet.
- **Combined: Flash Gives + Things for Sale** become a single Neighborhood Marketplace section. One classifieds section instead of two.

## Implications for Inner Pages

### /events (Phase 1b)

The homepage now handles event discovery (lead story card + "Coming Up" section). The events page is freed to be a calendar tool — a filterable, date-grouped, scanable list for residents who want to browse. Event cards on /events should be compact and information-dense (title, date, time, town, category), not large and editorial. The filter bar (time window, town, tags) is the right architecture and should be polished for mobile ergonomics. Recurring events should collapse into a single row with a "recurring" indicator and next-date subtitle, not expand into N separate rows.

### /ferry, /tides, /weather

These pages become the primary destination for residents who want detailed utility data. The homepage's utility shelf provides a glance; the inner pages provide depth. The hero strip links to /ferry; the utility shelf links to all three. These pages do not change structurally — they just become more important as the homepage deemphasizes utility.

### /marketplace

The homepage's combined Neighborhood Marketplace section provides a 3-4 item preview. The marketplace page remains the full browsing experience. No structural changes needed.

### /forum (Ask the Island)

The Community Voice card gives the forum homepage visibility it didn't previously have. This may increase forum traffic. The forum page should be ready to receive that traffic — clear thread list, easy reply flow, visible "Ask a Question" CTA.

## Design Principles

These rules govern all homepage decisions. When in doubt, apply these in order.

1. **The lead is a story, not a status.** The first content after the hero is always editorial — an event, a news piece, a community conversation. Never a dashboard panel, never a navigation grid, never utility data.

2. **Utility is findable, not primary.** Weather, ferry, tides are available via the hero strip (glance), the utility shelf (detail), nav (full page), and bottom tab bar (ferry). Four paths. None of them dominate the editorial space. Utility surfaces may include action links where the action is the natural next step after seeing the status — for example, the ferry segment links to ticket purchase because seeing "all routes on schedule" naturally leads to "buy my ticket." The action link lives inside the utility surface, not as a promoted element above it.

3. **Every section earns its position through altitude.** The homepage has five visual altitudes. From loudest to quietest: Lead Story (altitude 1), Discovery sections like events and news (altitude 2), Supporting content like action cards, community voice, and marketplace (altitude 3), Utility shelf and ferry alerts (altitude 4), CTAs and footer (altitude 5). New content must be assigned an altitude before it gets a position.

4. **Empty beats stale.** Every section has a freshness gate. If the lead story has no qualifying content, it's skipped. If the events section has no upcoming events within 30 days, it's hidden. If the community voice thread has fewer than 3 replies, the card doesn't render. The page should never show content just to fill space.

5. **Morning paper, not community center, for layout.** The community center vision is real and important — it lives in the site's tone, voice, contribution surfaces, and the participatory CTA at the bottom. But layout decisions follow the morning paper: editorial lead, then browse sections, then utility, then classifieds. When the two framings conflict, the morning paper wins.
