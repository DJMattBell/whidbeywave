# Skill: Add New Event Scraper

Invoke when adding a new event source.

## Checklist

1. **Identify source type**: Static HTML (cheerio) → Platform API (Squarespace `?format=json`, WordPress REST) → iCal/ICS feed. No headless browser unless no alternative.

2. **Inspect the actual site**: Never copy selectors from another scraper. Examine DOM for correct CSS selectors, date formats, event structure.

3. **Create scraper module**: `lib/scrapers/[source-name].ts`
   - Export `scrape(): Promise<ScrapedEvent[]>` (see `lib/scrapers/types.ts`)
   - Return `[]` on failure — never throw
   - `stripHtml()` on descriptions at scrape time
   - Trim titles (trailing whitespace bypasses unique constraint)
   - Remove boilerplate (contact info, FAQ footers)

4. **Register**: Add to scraper array in `app/api/events/scrape/route.ts`.

5. **Test with real data**: Verify:
   - Dates parse correctly (watch timezone-naive timestamps)
   - No off-island events leak (filter by location/branch if needed)
   - Descriptions are clean plain text
   - `onConflict: 'title,date,location'` dedup works

6. **Verify scrape_log**: Confirm rows written on success and failure.

7. **Build**: `npm run build` must pass.
