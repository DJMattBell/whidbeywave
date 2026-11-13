/**
 * Integration tests for /api/auto-approve dedup logic.
 *
 * Proves the known bug: dedup key uses title|date but ignores location,
 * so same-day events at different venues get incorrectly skipped.
 * See CLAUDE.md lines 113-114: UNIQUE(title, date, location).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────

// Track all supabase operations for assertions
type UpdateCall = { table: string; data: Record<string, unknown>; filters: Record<string, unknown> };
let updateCalls: UpdateCall[] = [];

// Tables seeded per test
let tables: Record<string, Record<string, unknown>[]> = {};

function makeQueryBuilder(tableName: string) {
  let chain: {
    selectCols?: string;
    eqFilters: Record<string, unknown>;
    updateData?: Record<string, unknown>;
  } = { eqFilters: {} };

  const builder = {
    select(cols: string) {
      chain.selectCols = cols;
      return builder;
    },
    eq(col: string, val: unknown) {
      chain.eqFilters[col] = val;
      return builder;
    },
    update(data: Record<string, unknown>) {
      chain.updateData = data;
      return builder;
    },
    then(resolve: (val: unknown) => void) {
      // If this is an update().eq() chain, record it and resolve
      if (chain.updateData) {
        updateCalls.push({
          table: tableName,
          data: { ...chain.updateData },
          filters: { ...chain.eqFilters },
        });
        resolve({ error: null });
        return;
      }

      // Otherwise it's a select().eq() — filter the seeded table data
      const rows = (tables[tableName] ?? []).filter(row =>
        Object.entries(chain.eqFilters).every(([k, v]) => row[k] === v)
      );
      resolve({ data: rows, error: null });
    },
  };

  // Make .then work for await
  builder.then = builder.then.bind(builder);
  Object.defineProperty(builder, 'then', {
    value: (onFulfilled: (val: unknown) => void, onRejected?: (err: unknown) => void) => {
      try {
        if (chain.updateData) {
          updateCalls.push({
            table: tableName,
            data: { ...chain.updateData },
            filters: { ...chain.eqFilters },
          });
          onFulfilled({ error: null });
        } else {
          const rows = (tables[tableName] ?? []).filter(row =>
            Object.entries(chain.eqFilters).every(([k, v]) => row[k] === v)
          );
          onFulfilled({ data: rows, error: null });
        }
      } catch (err) {
        if (onRejected) onRejected(err);
      }
    },
  });

  return builder;
}

const mockSupabase = {
  from: (table: string) => makeQueryBuilder(table),
};

vi.mock('@/lib/supabase', () => ({
  createServiceClient: () => mockSupabase,
}));

let emailsSent: { to: string; subject: string }[] = [];

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

vi.mock('@/lib/cronAuth', () => ({
  verifyCronRequest: () => null, // always authorized in tests
}));

// ── Helpers ────────────────────────────────────────────────────────────

function makeRequest() {
  return new Request('https://whidbeywave.com/api/auto-approve', {
    method: 'GET',
    headers: { authorization: 'Bearer test-secret' },
  });
}

async function callAutoApprove() {
  // Fresh import each time so module-level `getResend()` picks up mock
  const mod = await import('@/app/api/auto-approve/route');
  const { NextRequest } = await import('next/server');
  const req = new NextRequest(makeRequest());
  const res = await mod.GET(req);
  return res.json();
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('auto-approve event dedup', () => {
  beforeEach(() => {
    updateCalls = [];
    emailsSent = [];
    tables = { event_submissions: [], listings: [] };
  });

  it('approves a pending event with no approved duplicates', async () => {
    tables.event_submissions = [
      {
        id: 'e1',
        title: 'Live Jazz Night',
        date: '2026-12-01',
        time: '7 PM',
        location: 'Toby\'s Tavern',
        town: 'Coupeville',
        submitter_name: 'Alice',
        submitter_email: 'alice@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.approved).toBe(1);
    expect(result.events.skippedDuplicates).toBe(0);
    expect(updateCalls).toContainEqual(
      expect.objectContaining({
        table: 'event_submissions',
        data: expect.objectContaining({ status: 'approved' }),
        filters: { id: 'e1' },
      })
    );
  });

  it('skips a pending event that matches an approved event by title+date', async () => {
    tables.event_submissions = [
      // Already approved
      {
        id: 'e-approved',
        title: 'Farmers Market',
        date: '2026-12-06',
        location: 'Bayview Corner',
        status: 'approved',
      },
      // Pending duplicate — same title, same date, same location
      {
        id: 'e-pending',
        title: 'Farmers Market',
        date: '2026-12-06',
        time: '10 AM',
        location: 'Bayview Corner',
        town: 'Langley',
        submitter_name: 'Bob',
        submitter_email: 'bob@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.skippedDuplicates).toBe(1);
    expect(result.events.approved).toBe(0);
    // No update call should have been made
    const eventUpdates = updateCalls.filter(c => c.table === 'event_submissions');
    expect(eventUpdates).toHaveLength(0);
  });

  it('is case-insensitive when comparing titles', async () => {
    tables.event_submissions = [
      {
        id: 'e-approved',
        title: 'Family Storytime',
        date: '2026-12-10',
        location: 'Langley Library',
        status: 'approved',
      },
      {
        id: 'e-pending',
        title: 'FAMILY STORYTIME',
        date: '2026-12-10',
        time: '10:30 AM',
        location: 'Langley Library',
        town: 'Langley',
        submitter_name: 'Carol',
        submitter_email: 'carol@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.skippedDuplicates).toBe(1);
    expect(result.events.approved).toBe(0);
  });

  it('approves same-title same-date events at DIFFERENT locations', async () => {
    // "Family Storytime" happens at BOTH Langley Library and Coupeville Library
    // on the same day. Dedup key is title|date|location (matching the DB
    // unique constraint), so the Coupeville event is NOT a duplicate.
    tables.event_submissions = [
      // Already approved at Langley
      {
        id: 'e-langley',
        title: 'Family Storytime',
        date: '2026-12-10',
        location: 'Langley Library',
        status: 'approved',
      },
      // Pending at Coupeville — different venue, NOT a duplicate
      {
        id: 'e-coupeville',
        title: 'Family Storytime',
        date: '2026-12-10',
        time: '10:30 AM',
        location: 'Coupeville Library',
        town: 'Coupeville',
        submitter_name: 'Diana',
        submitter_email: 'diana@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.approved).toBe(1);
    expect(result.events.skippedDuplicates).toBe(0);

    const eventUpdates = updateCalls.filter(c => c.table === 'event_submissions');
    expect(eventUpdates).toHaveLength(1);
    expect(eventUpdates[0].filters).toEqual({ id: 'e-coupeville' });
  });

  it('approves events with same title but different dates', async () => {
    tables.event_submissions = [
      {
        id: 'e-approved',
        title: 'Live Jazz Night',
        date: '2026-12-01',
        location: 'Toby\'s Tavern',
        status: 'approved',
      },
      {
        id: 'e-pending',
        title: 'Live Jazz Night',
        date: '2026-12-08',
        time: '7 PM',
        location: 'Toby\'s Tavern',
        town: 'Coupeville',
        submitter_name: 'Ed',
        submitter_email: 'ed@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.approved).toBe(1);
    expect(result.events.skippedDuplicates).toBe(0);
  });

  it('handles whitespace variations in titles', async () => {
    tables.event_submissions = [
      {
        id: 'e-approved',
        title: '  Farmers Market  ',
        date: '2026-12-06',
        location: 'Bayview Corner',
        status: 'approved',
      },
      {
        id: 'e-pending',
        title: 'Farmers Market',
        date: '2026-12-06',
        time: '10 AM',
        location: 'Bayview Corner',
        town: 'Langley',
        submitter_name: 'Fran',
        submitter_email: 'fran@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.skippedDuplicates).toBe(1);
    expect(result.events.approved).toBe(0);
  });

  it('adds newly approved event to dedup set so subsequent pending dupes are caught', async () => {
    // Two pending events with same title+date, no pre-existing approved event.
    // First should be approved; second should be caught as duplicate of the first.
    tables.event_submissions = [
      {
        id: 'e1',
        title: 'Trivia Night',
        date: '2026-12-15',
        time: '7 PM',
        location: 'Toby\'s Tavern',
        town: 'Coupeville',
        submitter_name: 'Gina',
        submitter_email: 'gina@example.com',
        status: 'pending',
      },
      {
        id: 'e2',
        title: 'Trivia Night',
        date: '2026-12-15',
        time: '7 PM',
        location: 'Toby\'s Tavern',
        town: 'Coupeville',
        submitter_name: 'Hank',
        submitter_email: 'hank@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.approved).toBe(1);
    expect(result.events.skippedDuplicates).toBe(1);
  });

  it('sends batched email when same submitter has multiple approved events', async () => {
    tables.event_submissions = [
      {
        id: 'e1',
        title: 'Live Jazz Night',
        date: '2026-12-01',
        time: '7 PM',
        location: 'Toby\'s Tavern',
        town: 'Coupeville',
        submitter_name: 'Alice',
        submitter_email: 'alice@example.com',
        status: 'pending',
      },
      {
        id: 'e2',
        title: 'Open Mic',
        date: '2026-12-02',
        time: '8 PM',
        location: 'Toby\'s Tavern',
        town: 'Coupeville',
        submitter_name: 'Alice',
        submitter_email: 'alice@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.events.approved).toBe(2);
    // One batched email, not two separate emails
    expect(emailsSent).toHaveLength(1);
    expect(emailsSent[0].subject).toContain('2 events');
  });
});

describe('auto-approve listing dedup', () => {
  beforeEach(() => {
    updateCalls = [];
    emailsSent = [];
    tables = { event_submissions: [], listings: [] };
  });

  it('approves a pending listing with no approved duplicates', async () => {
    tables.listings = [
      {
        id: 'l1',
        title: 'Free firewood — oak rounds',
        seller_name: 'Jake',
        contact_email: 'jake@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.listings.approved).toBe(1);
    expect(result.listings.skippedDuplicates).toBe(0);
  });

  it('skips a pending listing with same title as an approved listing', async () => {
    tables.listings = [
      {
        id: 'l-approved',
        title: 'Free firewood',
        status: 'approved',
      },
      {
        id: 'l-pending',
        title: 'Free Firewood',
        seller_name: 'Kate',
        contact_email: 'kate@example.com',
        status: 'pending',
      },
    ];

    const result = await callAutoApprove();

    expect(result.listings.skippedDuplicates).toBe(1);
    expect(result.listings.approved).toBe(0);
  });
});
