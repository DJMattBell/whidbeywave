// Lead Story selection — returns the single most relevant thing on the island right now.
// Priority chain: happening now → today → tomorrow (after 6pm) → fresh news → active forum thread → null.

import { createServerClient, isConfigured } from '@/lib/supabase';

export type LeadStory = {
  type: 'event' | 'news' | 'forum';
  typeLabel: string;
  accent: 'amber' | 'forest' | 'sound';
  title: string;
  subtitle: string;
  href: string;
  category: string | null;
  /** If the lead is an event, its row ID (for excluding from Coming Up) */
  leadEventId: string | null;
  /** If the lead is a forum thread, its row ID (for excluding from Community Voice) */
  leadForumThreadId: string | null;
};

export async function getLeadStory(): Promise<LeadStory | null> {
  if (!isConfigured) return null;

  const supabase = createServerClient();
  const nowPT = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const now = new Date(nowPT);
  const today = now.toLocaleDateString('en-CA');
  const hourPT = now.getHours();

  // Tomorrow's date (for after-6pm surfacing)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

  // 48 hours ago for news freshness
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoISO = twoDaysAgo.toISOString();

  // 24 hours ago for forum threads
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const oneDayAgoISO = oneDayAgo.toISOString();

  // Run all queries in parallel
  const [todayEvents, tomorrowEvents, recentNews, activeThread] = await Promise.all([
    // Today's events (for priorities 1 & 2)
    supabase
      .from('event_submissions')
      .select('id, title, date, time, town, category, description')
      .eq('status', 'approved')
      .eq('date', today)
      .order('time', { ascending: true })
      .limit(20),

    // Tomorrow's events (for priority 3, only used after 6pm)
    hourPT >= 18
      ? supabase
          .from('event_submissions')
          .select('id, title, date, time, town, category, description')
          .eq('status', 'approved')
          .eq('date', tomorrowStr)
          .order('time', { ascending: true })
          .limit(1)
      : Promise.resolve({ data: null }),

    // Recent news (priority 4)
    supabase
      .from('news_posts')
      .select('id, title, excerpt, category, published_at, slug')
      .eq('published', true)
      .gte('published_at', twoDaysAgoISO)
      .order('published_at', { ascending: false })
      .limit(1),

    // Most active forum thread in 24h with 3+ replies (priority 5)
    supabase
      .from('forum_posts')
      .select('id, title, body, reply_count, author_name')
      .eq('is_pinned', false)
      .gte('created_at', oneDayAgoISO)
      .gte('reply_count', 3)
      .order('reply_count', { ascending: false })
      .limit(1),
  ]);

  const events = todayEvents.data ?? [];

  // Parse current time for "happening now" check
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Priority 1: Event happening right now (started within last 4 hours)
  for (const event of events) {
    const startMinutes = parseTimeToMinutes(event.time);
    if (startMinutes === null) continue;
    const elapsed = currentMinutes - startMinutes;
    if (elapsed >= 0 && elapsed <= 240) {
      return {
        type: 'event',
        typeLabel: 'Happening Now',
        accent: 'amber',
        title: event.title,
        subtitle: `${event.time} · ${event.town}`,
        href: `/events/${event.id}`,
        category: event.category,
        leadEventId: event.id,
        leadForumThreadId: null,
      };
    }
  }

  // Priority 2: Event happening later today
  for (const event of events) {
    const startMinutes = parseTimeToMinutes(event.time);
    if (startMinutes === null) continue;
    if (startMinutes > currentMinutes) {
      return {
        type: 'event',
        typeLabel: 'Happening Today',
        accent: 'amber',
        title: event.title,
        subtitle: `${event.time} · ${event.town}`,
        href: `/events/${event.id}`,
        category: event.category,
        leadEventId: event.id,
        leadForumThreadId: null,
      };
    }
  }

  // Priority 3: Event happening tomorrow (only after 6pm Pacific)
  const tmrw = tomorrowEvents.data;
  if (tmrw && tmrw.length > 0) {
    const event = tmrw[0];
    return {
      type: 'event',
      typeLabel: 'Tomorrow on Whidbey',
      accent: 'amber',
      title: event.title,
      subtitle: `${event.time} · ${event.town}`,
      href: `/events/${event.id}`,
      category: event.category,
      leadEventId: event.id,
      leadForumThreadId: null,
    };
  }

  // Priority 4: Latest news story (less than 48 hours old)
  const news = recentNews.data;
  if (news && news.length > 0) {
    const story = news[0];
    return {
      type: 'news',
      typeLabel: 'Island News',
      accent: 'forest',
      title: story.title,
      subtitle: story.excerpt ?? '',
      href: `/news#${story.slug}`,
      category: story.category,
      leadEventId: null,
      leadForumThreadId: null,
    };
  }

  // Priority 5: Most active forum thread (3+ replies in 24 hours)
  const thread = activeThread.data;
  if (thread && thread.length > 0) {
    const t = thread[0];
    return {
      type: 'forum',
      typeLabel: 'Neighbors are talking about',
      accent: 'sound',
      title: t.title,
      subtitle: `${t.reply_count} replies · Started by ${t.author_name}`,
      href: `/forum/${t.id}`,
      category: null,
      leadEventId: null,
      leadForumThreadId: t.id,
    };
  }

  // Priority 6: Nothing qualifies
  return null;
}

/** Parse "2:00 PM" or "14:00" style time strings into minutes since midnight */
function parseTimeToMinutes(time: string): number | null {
  if (!time) return null;

  // Try "H:MM AM/PM" format
  const ampm = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  // Try "HH:MM" 24-hour format
  const mil = time.match(/^(\d{1,2}):(\d{2})/);
  if (mil) {
    return parseInt(mil[1], 10) * 60 + parseInt(mil[2], 10);
  }

  return null;
}
