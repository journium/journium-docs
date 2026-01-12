import { source } from '@/lib/source';

// cached forever
export const revalidate = false;

type PageEntry = {
  title: string;
  url: string;
  description?: string;
};

function getSectionFromUrl(url: string): string {
  // Extract section from URL path
  // e.g., /docs/nextjs/concepts -> 'nextjs'
  // e.g., /docs/react/hooks -> 'react'
  const parts = url.split('/').filter(Boolean);
  if (parts.length > 1 && parts[0] === 'docs') {
    return parts[1] || 'docs';
  }
  return 'docs';
}

export async function GET() {
  const pages = source.getPages();
  const sections = new Map<string, PageEntry[]>();

  // Organize pages by section based on URL
  for (const page of pages) {
    const section = getSectionFromUrl(page.url);
    
    if (!sections.has(section)) {
      sections.set(section, []);
    }
    
    sections.get(section)!.push({
      title: page.data.title,
      url: page.url,
      description: page.data.description,
    });
  }

  // Build the output
  let output = '# Docs\n\n';

  // Sort sections alphabetically
  const sortedSections = Array.from(sections.entries()).sort(([a], [b]) => a.localeCompare(b));

  for (const [sectionName, pages] of sortedSections) {
    output += `## ${sectionName}\n\n`;

    // Sort pages by title
    const sortedPages = pages.sort((a, b) => a.title.localeCompare(b.title));

    for (const page of sortedPages) {
      const description = page.description ? `: ${page.description}` : '';
      output += `- [${page.title}](${page.url})${description}\n`;
    }

    output += '\n';
  }

  return new Response(output, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
