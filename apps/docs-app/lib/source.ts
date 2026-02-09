import { blog as blogPosts, docs } from 'fumadocs-mdx:collections/server';
import { InferPageType, InferMetaType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { customIconsPlugin } from './custom-icons-plugin';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [customIconsPlugin(), lucideIconsPlugin()],
});

export function getDocsPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];
  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export function getBlogPageImage(page: InferPageType<typeof blog>) {
  const segments = [...page.slugs, 'image.png'];
  return {
    segments,
    url: `/og/blog/${segments.join('/')}`,
  };
}

export const blog = loader(toFumadocsSource(blogPosts, []), {
  baseUrl: '/blog',
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;