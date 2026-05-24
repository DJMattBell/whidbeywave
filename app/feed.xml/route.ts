import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whidbeywave.com';

export async function GET() {
  const supabase = createServerClient();
  const { data: newsData } = await supabase
    .from('news_posts')
    .select('id, title, excerpt, slug, category, emoji, published_at, post_type')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  const posts = newsData ?? [];

  const items = posts
    .map(post => {
      // Use noon UTC as a stable approximation — avoids PST/PDT offset issues
      const pubDate = new Date(post.published_at + 'T12:00:00Z').toUTCString();
      const section = post.post_type === 'guide' ? 'guides' : 'news';
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/${section}#${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/${section}#${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt ?? ''}]]></description>
      <category><![CDATA[${post.category}]]></category>
      <author>WhidbeyWave</author>
    </item>`.trim();
    })
    .join('\n    ');

  const lastBuildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WhidbeyWave — Island News</title>
    <link>${SITE_URL}/news</link>
    <description>Local news, events, and community stories from Whidbey Island, Washington.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>hello@whidbeywave.com (WhidbeyWave)</managingEditor>
    <webMaster>hello@whidbeywave.com (WhidbeyWave)</webMaster>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>WhidbeyWave</title>
      <link>${SITE_URL}</link>
    </image>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
