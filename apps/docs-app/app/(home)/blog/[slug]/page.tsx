import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blog, getBlogPageImage } from '@/lib/source';
import { createMetadata } from '@/lib/metadata';
import { buttonVariants } from '@/components/ui/button';
import { ShareButton } from '@/apps/docs-app/app/(home)/blog/[slug]/page.client';
import { BlogAuthor } from '@/components/ui/blog-author';
import { getMDXComponents } from '@/apps/docs-app/mdx-components';
import path from 'node:path';
import { cn } from '@/lib/cn';

export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) notFound();
  const { body: Mdx, toc } = await page.data.load();

  return (
    <article className="flex flex-col mx-auto w-full max-w-[800px] px-4 py-8">
      <BlogAuthor
        author={page.data.author}
        date={page.data.date ?? path.basename(page.path, path.extname(page.path))}
      />

      <h1 className="text-3xl font-semibold mb-4">{page.data.title}</h1>
      <p className="text-fd-muted-foreground mb-8">{page.data.description}</p>

      <div className="prose min-w-0 flex-1">
        <div className="flex flex-row gap-2 mb-8 not-prose">
          <ShareButton url={page.url} />
          <Link
            href="/blog"
            className={cn(
              buttonVariants({
                size: 'sm',
                variant: 'secondary',
              }),
            )}
          >
            View All Posts
          </Link>
        </div>

        <InlineTOC items={toc} />
        <Mdx components={getMDXComponents()} />
      </div>
    </article>
  );
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  return createMetadata({
    title: {
      absolute: `${page.data.title} | Journium Blog`,
    },
    description: page.data.description ?? 'Latest announcements and insights from Journium.',
    openGraph: {
      images: getBlogPageImage(page).url,
    },
  });
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}
