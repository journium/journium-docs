import { defineDocs, defineConfig, defineCollections, frontmatterSchema } from 'fumadocs-mdx/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import { transformerTwoslash } from 'fumadocs-twoslash';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  postprocess: {
    includeProcessedMarkdown: true,
  },
  schema: frontmatterSchema.extend({
    author: z.string(),
    date: z.iso.date().or(z.date()),
  }),
  async: true,
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [remarkMath, remarkMdxMermaid],
    // Place it at first, it should be executed before the syntax highlighter
    rehypePlugins: (v) => [rehypeKatex, ...v],
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
    },
    remarkNpmOptions: {
      persist: {
        id: 'package-manager',
      },
    },
  },
});