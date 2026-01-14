import { Feed } from 'feed';
import { blog } from '@/lib/source';
import { NextResponse } from 'next/server';

export const revalidate = false;

const baseUrl = 'https://journium.app';

export function GET() {
  const feed = new Feed({
    title: 'Journium Blog',
    id: `${baseUrl}/blog`,
    link: `${baseUrl}/blog`,
    language: 'en',

    image: `${baseUrl}/images/journium_og_web_v2.png`,
    favicon: `${baseUrl}/images/favicon-dark.png`,
    copyright: 'All rights reserved 2026, Journium',
  });

  for (const page of blog.getPages().sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
  })) {
    feed.addItem({
      id: page.url,
      title: page.data.title,
      description: page.data.description,
      link: `${baseUrl}${page.url}`,
      date: new Date(page.data.date),

      author: [
        {
          name: page.data.author,
        },
      ],
    });
  }

  return new NextResponse(feed.rss2());
}
