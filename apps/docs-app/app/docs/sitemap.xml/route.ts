import { NextResponse } from 'next/server';
import { source } from '@/lib/source';

function generateSitemapXML(entries: Array<{
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
}>): string {
  const urls = entries.map((entry) => {
    const lastmod = entry.lastModified.toISOString();
    return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_DOCS_BASE_URL || 'http://localhost:3201/docs';

  // Ensure baseUrl doesn't end with a slash
  let normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  // Remove /docs from baseUrl if it ends with it (since page.url already includes /docs)
  if (normalizedBaseUrl.endsWith('/docs')) {
    normalizedBaseUrl = normalizedBaseUrl.slice(0, -5); // Remove '/docs'
  }

  // Get all page params (slugs)
  const params = source.generateParams();

  // Build sitemap entries
  const entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
  }> = [];

  for (const param of params) {
    const slug = param.slug;
    if (!slug) continue;

    const page = source.getPage(slug);
    if (!page) continue;

    // Use the page's URL property which already includes /docs prefix
    const urlPath = page.url;

    entries.push({
      url: `${normalizedBaseUrl}${urlPath}`,
      lastModified: page.data.lastModified || new Date(),
      changeFrequency: 'weekly',
      // Priority: 0.8 for docs root (major section landing page, main site homepage is 1.0),
      // 0.7 for category/index pages, 0.5 for content pages
      priority: urlPath === '/docs' ? 0.8 : urlPath.split('/').length <= 3 ? 0.7 : 0.5,
    });
  }

  const xml = generateSitemapXML(entries);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

