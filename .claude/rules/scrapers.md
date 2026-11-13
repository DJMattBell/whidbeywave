# Scraper Rules

Applies when editing: lib/scrapers/, app/api/events/scrape

- Priority order: fix HTML selectors (cheerio) → platform API → iCal/ICS feed
- Never copy selectors between scrapers — inspect the actual site
- Wix sites render client-side; skip without headless browser
- `stripHtml()` at ingest, not just render. Trim titles at ingest
- Never store HTML or boilerplate in descriptions
- Every scraper writes to `scrape_log` on every run (success or failure)
- Sno-Isle (Langley + Coupeville) share `lib/scrapers/sno-isle-common.ts`
- Sno-Isle: filter by branch name — `?location=langley` returns off-island results
- Sno-Isle: timestamps lack timezone suffix — extract time from string directly (Pacific)
- Unique constraint: `title, date, location` — `onConflict` must match all three
- Scrapers return `[]` on failure, never throw
