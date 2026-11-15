/**
 * Integration tests for /api/events/scrape dedup logic,
 * blocked location filter, data cleaning pipeline, and
 * Sno-Isle off-island filter + boilerplate stripping.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ScrapedEvent } from '@/lib/scrapers/types';

// ── Mock state ─────────────────────────────────────────────────────────

let mockScraperResults: Record<string, ScrapedEvent[]> = {};
let existingEvents: { title: string; date: string; location?: string }[] = [];
let upsertedRows: Record<string, unknown>[] = [];
let upsertOpts: Record<string, unknown> = {};
let emailsSent: { to: string; subject: string }[] = [];

// ── Mocks ──────────────────────────────────────────────────────────────

vi.mock('@/lib/scrapers/oakharbor', () => ({
  scrapeOakHarbor: () => Promise.resolve(mockScraperResults['Oak Harbor'] ?? []),
}));
vi.mock('@/lib/scrapers/sno-isle-common', async () => {
  const actual = await vi.importActual<typeof import('@/lib/scrapers/sno-isle-common')>('@/lib/scrapers/sno-isle-common');
  return {
    ...actual,
    scrapeAllSnoIsleWhidbey: () => Promise.resolve(mockScraperResults['Sno-Isle Libraries'] ?? []),
  };
});
vi.mock('@/lib/scrapers/thirsty-crab', () => ({
  scrapeThirstyCrab: () => Promise.resolve(mockScraperResults['Thirsty Crab'] ?? []),
}));
vi.mock('@/lib/scrapers/whidbey-telecom', () => ({
  scrapeWhidbeyTelecomEvents: () => Promise.resolve(mockScraperResults['Whidbey Telecom'] ?? []),
}));
vi.mock('@/lib/scrapers/langley-whale-center', () => ({
  scrapeLangleyWhaleCenter: () => Promise.resolve(mockScraperResults['Langley Whale Center'] ?? []),
}));
vi.mock('@/lib/scrapers/barringtons', () => ({
  scrapeBarringtons: () => Promise.resolve(mockScraperResults['Barringtons'] ?? []),
}));

vi.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        gte: () => Promise.resolve({ data: existingEvents, error: null }),
      }),
      upsert: (rows: Record<string, unknown>[], opts: Record<string, unknown>) => {
        upsertedRows = [...rows];
        upsertOpts = { ...opts };
        return Promise.resolve({ error: null });
      },
    }),
  }),
}));

vi.mock('@/lib/resend', () => ({
  getResend: () => ({
    emails: {
      send: async (opts: { to: string; subject: string }) => {
        emailsSent.push({ to: opts.to, subject: opts.subject });
        return { id: 'mock' };
      },
    },
  }),
}));

vi.mock('@/lib/cronAuth', () => ({ verifyCronRequest: () => null }));
vi.mock('@/lib/scrapeLog', () => ({ logScrapeRun: async () => {} }));

// ── Helpers ────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<ScrapedEvent> = {}): ScrapedEvent {
  return {
    title: 'Test Event',
    date: '2026-12-01',
    time: '7:00 PM',
    location: "Toby's Tavern",
    town: 'Coupeville',
    category: 'Music & Nightlife',
    description: null,
    source: 'Test',
    ...overrides,
  };
}

async function callScrape() {
  const mod = await import('@/app/api/events/scrape/route');
  const { NextRequest } = await import('next/server');
  const req = new NextRequest(
    new Request('https://whidbeywave.com/api/events/scrape', {
      method: 'GET',
      headers: { authorization: 'Bearer test-secret' },
    })
  );
  const res = await mod.GET(req);
  return res.json();
}

// ── Scrape route dedup tests ───────────────────────────────────────────

describe('scrape route dedup', () => {
  beforeEach(() => {
    mockScraperResults = {};
    existingEvents = [];
    upsertedRows = [];
    upsertOpts = {};
    emailsSent = [];
  });

  it('inserts new events not already in the DB', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Jazz Night', date: '2026-12-05', source: 'Oak Harbor' }),
    ];

    const result = await callScrape();

    expect(result.found).toBe(1);
    expect(result.added).toBe(1);
    expect(upsertedRows).toHaveLength(1);
    expect(upsertedRows[0].title).toBe('Jazz Night');
  });

  it('filters out events matching existing title+date+location', async () => {
    existingEvents = [
      { title: 'Jazz Night', date: '2026-12-05', location: "Toby's Tavern" },
    ];
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Jazz Night', date: '2026-12-05', location: "Toby's Tavern", source: 'Oak Harbor' }),
    ];

    const result = await callScrape();

    expect(result.found).toBe(1);
    expect(result.added).toBe(0);
    expect(upsertedRows).toHaveLength(0);
  });

  it('allows same title+date at different locations', async () => {
    existingEvents = [
      { title: 'Family Storytime', date: '2026-12-10', location: 'Langley Library' },
    ];
    mockScraperResults['Sno-Isle Libraries'] = [
      makeEvent({
        title: 'Family Storytime',
        date: '2026-12-10',
        location: 'Coupeville Library',
        source: 'Coupeville Library',
      }),
    ];

    const result = await callScrape();

    expect(result.added).toBe(1);
    expect(upsertedRows).toHaveLength(1);
    expect(upsertedRows[0].location).toBe('Coupeville Library');
  });

  it('dedup is case-insensitive on title and location', async () => {
    existingEvents = [
      { title: 'Farmers Market', date: '2026-12-06', location: 'Bayview Corner' },
    ];
    mockScraperResults['Oak Harbor'] = [
      makeEvent({
        title: 'FARMERS MARKET',
        date: '2026-12-06',
        location: 'bayview corner',
        source: 'Oak Harbor',
      }),
    ];

    const result = await callScrape();

    expect(result.added).toBe(0);
  });

  it('dedup collapses whitespace in titles', async () => {
    existingEvents = [
      { title: 'Live   Jazz   Night', date: '2026-12-05', location: "Toby's Tavern" },
    ];
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Live Jazz Night', date: '2026-12-05', location: "Toby's Tavern", source: 'Oak Harbor' }),
    ];

    const result = await callScrape();

    expect(result.added).toBe(0);
  });

  it('filters events at blocked locations', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Wine Tasting', date: '2026-12-10', location: 'Greenbank Cidery', source: 'Oak Harbor' }),
    ];

    const result = await callScrape();

    expect(result.found).toBe(1);
    expect(result.added).toBe(0);
    expect(upsertedRows).toHaveLength(0);
  });

  it('blocked location check is case-insensitive', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Wine Tasting', date: '2026-12-10', location: 'GREENBANK CIDERY', source: 'Oak Harbor' }),
    ];

    const result = await callScrape();

    expect(result.added).toBe(0);
  });

  it('strips HTML from descriptions before insert', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({
        title: 'Art Walk',
        date: '2026-12-07',
        description: '<p>Join us for a <strong>free</strong> art walk!</p>',
        source: 'Oak Harbor',
      }),
    ];

    await callScrape();

    expect(upsertedRows[0].description).toBe('Join us for a free art walk!');
  });

  it('decodes HTML entities in descriptions', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({
        title: 'Arts Show',
        date: '2026-12-07',
        description: 'Arts &amp; Crafts — it&#39;s fun',
        source: 'Oak Harbor',
      }),
    ];

    await callScrape();

    expect(upsertedRows[0].description).toBe("Arts & Crafts — it's fun");
  });

  it('trims titles at insert', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: '  Jazz Night  ', date: '2026-12-05', source: 'Oak Harbor' }),
    ];

    await callScrape();

    expect(upsertedRows[0].title).toBe('Jazz Night');
  });

  it('sanitizes duplicated time ranges', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({
        title: 'Storytime',
        date: '2026-12-08',
        time: '10:30 AM - 11:30 AM10:30 AM to 11:30 AM',
        source: 'Oak Harbor',
      }),
    ];

    await callScrape();

    expect(upsertedRows[0].time).toBe('10:30 AM - 11:30 AM');
  });

  it('upserts with onConflict title,date,location and ignoreDuplicates', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Jazz Night', date: '2026-12-05', source: 'Oak Harbor' }),
    ];

    await callScrape();

    expect(upsertOpts).toEqual(
      expect.objectContaining({ onConflict: 'title,date,location', ignoreDuplicates: true })
    );
  });

  it('all inserted events have status pending and scraper submitter', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Jazz Night', date: '2026-12-05', source: 'Oak Harbor' }),
      makeEvent({ title: 'Art Walk', date: '2026-12-07', source: 'Oak Harbor' }),
    ];

    await callScrape();

    for (const row of upsertedRows) {
      expect(row.status).toBe('pending');
      expect(row.submitter_name).toBe('Event Scraper');
      expect(row.submitter_email).toBe('noreply@whidbeywave.com');
    }
  });

  it('cross-scraper duplicates both reach upsert (DB handles dedup)', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Holiday Market', date: '2026-12-15', location: 'Town Hall', source: 'Oak Harbor' }),
    ];
    mockScraperResults['Whidbey Telecom'] = [
      makeEvent({ title: 'Holiday Market', date: '2026-12-15', location: 'Town Hall', source: 'Whidbey Telecom' }),
    ];

    const result = await callScrape();

    // Both pass the in-memory dedup (nothing in DB). The DB unique
    // constraint + ignoreDuplicates handles the duplicate at insert.
    expect(result.found).toBe(2);
    expect(upsertedRows).toHaveLength(2);
  });

  it('null description stays null (not stripped)', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Jazz Night', date: '2026-12-05', description: null, source: 'Oak Harbor' }),
    ];

    await callScrape();

    expect(upsertedRows[0].description).toBeNull();
  });

  it('null location becomes empty string', async () => {
    mockScraperResults['Oak Harbor'] = [
      makeEvent({ title: 'Jazz Night', date: '2026-12-05', location: null, source: 'Oak Harbor' }),
    ];

    await callScrape();

    expect(upsertedRows[0].location).toBe('');
  });
});

// ── Sno-Isle branch ID filter ─────────────────────────────────────────

describe('sno-isle branch ID filter', () => {
  let getWhidbeyBranch: typeof import('@/lib/scrapers/sno-isle-common').getWhidbeyBranch;

  beforeEach(async () => {
    const mod = await import('@/lib/scrapers/sno-isle-common');
    getWhidbeyBranch = mod.getWhidbeyBranch;
  });

  // ── Whidbey branch IDs ──

  it('accepts Clinton Library (ID 10)', () => {
    const branch = getWhidbeyBranch('10');
    expect(branch).not.toBeNull();
    expect(branch!.town).toBe('Clinton');
  });

  it('accepts Coupeville Library (ID 11)', () => {
    const branch = getWhidbeyBranch('11');
    expect(branch).not.toBeNull();
    expect(branch!.town).toBe('Coupeville');
  });

  it('accepts Freeland Library (ID 14)', () => {
    const branch = getWhidbeyBranch('14');
    expect(branch).not.toBeNull();
    expect(branch!.town).toBe('Freeland');
  });

  it('accepts Langley Library (ID 17)', () => {
    const branch = getWhidbeyBranch('17');
    expect(branch).not.toBeNull();
    expect(branch!.town).toBe('Langley');
  });

  it('accepts Oak Harbor Library (ID 24)', () => {
    const branch = getWhidbeyBranch('24');
    expect(branch).not.toBeNull();
    expect(branch!.town).toBe('Oak Harbor');
  });

  // ── Off-island branch IDs ──

  it('rejects Mukilteo Library (ID 23)', () => {
    expect(getWhidbeyBranch('23')).toBeNull();
  });

  it('rejects Lynnwood Library (ID 18)', () => {
    expect(getWhidbeyBranch('18')).toBeNull();
  });

  it('rejects Mountlake Terrace Library (ID 22)', () => {
    expect(getWhidbeyBranch('22')).toBeNull();
  });

  it('rejects Monroe Library (ID 21)', () => {
    expect(getWhidbeyBranch('21')).toBeNull();
  });

  it('rejects Mariner Library (ID 29)', () => {
    expect(getWhidbeyBranch('29')).toBeNull();
  });

  // ── Edge cases ──

  it('rejects null branch ID', () => {
    expect(getWhidbeyBranch(null)).toBeNull();
  });

  it('rejects unknown branch ID', () => {
    expect(getWhidbeyBranch('999')).toBeNull();
  });

  it('rejects BC_VIRTUAL (online events)', () => {
    expect(getWhidbeyBranch('BC_VIRTUAL')).toBeNull();
  });
});

// ── Sno-Isle boilerplate stripping ─────────────────────────────────────

describe('sno-isle boilerplate stripping', () => {
  let cleanDescription: typeof import('@/lib/scrapers/sno-isle-common').cleanDescription;

  beforeEach(async () => {
    const mod = await import('@/lib/scrapers/sno-isle-common');
    cleanDescription = mod.cleanDescription;
  });

  it('strips "Contact us with questions" boilerplate', () => {
    const input = 'Fun event for kids. Contact us with questions about programs.';
    expect(cleanDescription(input)).toBe('Fun event for kids.');
  });

  it('strips "Contact Us Programs & Events FAQs" boilerplate', () => {
    const input = 'A great workshop Contact Us Programs & Events FAQs more stuff here';
    expect(cleanDescription(input)).toBe('A great workshop');
  });

  it('strips "Programs & Events FAQs To request a sign language" boilerplate', () => {
    const input = 'Join us for stories! Programs & Events FAQs To request a sign language interpreter please call.';
    expect(cleanDescription(input)).toBe('Join us for stories!');
  });

  it('returns null for boilerplate-only descriptions', () => {
    expect(cleanDescription('Contact us with questions about this event.')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(cleanDescription(null)).toBeNull();
  });

  it('strips HTML tags', () => {
    expect(cleanDescription('<p>A fun <strong>event</strong> for all ages.</p>'))
      .toBe('A fun event for all ages.');
  });

  it('decodes HTML entities before stripping', () => {
    expect(cleanDescription('Arts &amp; Crafts'))
      .toBe('Arts & Crafts');
  });

  it('collapses whitespace', () => {
    expect(cleanDescription('Lots   of   spaces   here'))
      .toBe('Lots of spaces here');
  });

  it('handles combined HTML + boilerplate', () => {
    const input = '<p>Fun event!</p> Contact us with questions about availability.';
    expect(cleanDescription(input)).toBe('Fun event!');
  });
});
