import { source, getDocsPageImage } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle , PageLastUpdate} from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { findSiblings } from 'fumadocs-core/page-tree';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Link from 'fumadocs-core/link';
import { PathUtils } from 'fumadocs-core/source';
import * as Twoslash from 'fumadocs-twoslash/ui';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // @ts-expect-error - body exists but TypeScript types are not aware
  const MDX = page.data.body;

  // @ts-expect-error - lastModified exists but TypeScript types are not aware
  const lastModifiedTime: Date | undefined = page.data.lastModified;

  return (
    <DocsPage 
    // @ts-expect-error - toc exists but TypeScript types are not aware
    toc={page.data.toc} 
    tableOfContent={{
        style: 'clerk',
        footer: (
          <div className="my-3 space-y-3">
            <Separator />
            {/* <EditSource path={page.path} />
            <ScrollTop />
            <Feedback />
            <CopyPage text={markdown} />
            <AskAI href={page.url} />
            <OpenInChat href={page.url} /> */}
          </div>
        )
      }}
    // @ts-expect-error - full exists but TypeScript types are not aware
    full={page.data.full}
    >
      
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/journium/journium-docs/blob/main/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            ...Twoslash,
            a: ({ href, ...props }) => {
              const found = source.getPageByHref(href ?? '', {
                dir: PathUtils.dirname(page.path),
              });

              if (!found) return <Link href={href} {...props} />;

              return (
                <HoverCard>
                  <HoverCardTrigger
                    href={found.hash ? `${found.page.url}#${found.hash}` : found.page.url}
                    {...props}
                  >
                    {props.children}
                  </HoverCardTrigger>
                  <HoverCardContent className="text-sm">
                    <p className="font-medium">{found.page.data.title}</p>
                    <p className="text-fd-muted-foreground">{found.page.data.description}</p>
                  </HoverCardContent>
                </HoverCard>
              );
            },
            DocsCategory: ({ url }: { url?: string }) => {
              return <DocsCategory url={url ?? page.url} />;
            },
          })}
        />
      </DocsBody>
      {lastModifiedTime && <PageLastUpdate date={lastModifiedTime} />}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

function DocsCategory({ url }: { url: string }) {
  return (
    <Cards>
      {findSiblings(source.getPageTree(), url).map((item) => {
        if (item.type === 'separator') return null;
        if (item.type === 'folder') {
          if (!item.index) return null;
          item = item.index;
        }

        return (
          <Card key={item.url} title={item.name} href={item.url}>
            {item.description}
          </Card>
        );
      })}
    </Cards>
  );
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // For the main docs page (title is "Journium Docs"), use the template
  // For other pages, use absolute to avoid double suffixes
  const isMainDocsPage = page.data.title === 'Journium Docs';

  return {
    title: isMainDocsPage 
      ? page.data.title  // Will use root template: "Journium Docs | Journium"
      : { absolute: `${page.data.title} | Journium Docs` },
    description: page.data.description,
    openGraph: {
      images: getDocsPageImage(page).url,
    },
  };
}