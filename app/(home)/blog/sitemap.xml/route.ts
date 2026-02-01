import { NextResponse } from 'next/server';
import { blog } from '@/lib/source';

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

// TODO: Cleanup the env var and simplify it later
export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_DOCS_BASE_URL || 'http://localhost:3201/docs';

  // Ensure baseUrl doesn't end with a slash
  let normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  // Remove /docs or /blog from baseUrl if it ends with either (since page.url already includes /blog)
  if (normalizedBaseUrl.endsWith('/docs')) {
    normalizedBaseUrl = normalizedBaseUrl.slice(0, -5); // Remove '/docs'
  } else if (normalizedBaseUrl.endsWith('/blog')) {
    normalizedBaseUrl = normalizedBaseUrl.slice(0, -5); // Remove '/blog'
  }

  // Build sitemap entries
  const entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
  }> = [];

  // Add blog homepage
  entries.push({
    url: `${normalizedBaseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly', // Blog homepage updates regularly with new posts
    priority: 0.9, // High priority - main landing page for blog section
  });

  // Get all blog posts
  const blogPages = blog.getPages();

  // Calculate date threshold for recent posts (6 months ago)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (const page of blogPages) {
    // Use the page's URL property which already includes /blog prefix
    const urlPath = page.url;

    // Get post date to determine if it's recent (within last 6 months)
    const postDate = page.data.date 
      ? new Date(page.data.date) 
      : new Date();
    
    const isRecentPost = postDate >= sixMonthsAgo;

    // SEO Best Practices for Blog Sitemaps:
    // - Recent posts (< 6 months): 0.8 priority (high - fresh content)
    // - Older posts (> 6 months): 0.6 priority (medium - evergreen content)
    const priority = isRecentPost ? 0.8 : 0.6;
    const changeFrequency = isRecentPost ? 'monthly' : 'yearly'; // Recent posts may get updates, older posts rarely change

    entries.push({
      url: `${normalizedBaseUrl}${urlPath}`,
      lastModified: postDate,
      changeFrequency,
      priority,
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

