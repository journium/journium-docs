import { getLLMText } from '@/lib/get-llm-text';
import { blog } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/blog/llms.mdx/blog/[[...slug]]'>) {
  const { slug } = await params;
  const page = blog.getPage(slug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return blog.generateParams();
}
