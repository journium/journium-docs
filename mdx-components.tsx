import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Mermaid } from '@/components/mdx/mermaid';
import * as Twoslash from 'fumadocs-twoslash/ui';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { ThemedImage } from '@/components/ui/themed-image';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...Twoslash,
    ...components,
    Mermaid,
    ThemedImage,
    ...TabsComponents,
  };
}