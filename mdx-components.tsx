import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Mermaid } from '@/components/mdx/mermaid';
import * as Twoslash from 'fumadocs-twoslash/ui';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { ThemedImage } from '@/components/ui/themed-image';
import { CloneExampleRepo } from '@/components/ui/clone-example-repo';
import * as AccordionsComponents from 'fumadocs-ui/components/accordion';
import { ShopifyIcon } from '@/components/icons/shopify';
import { WordPressIcon } from '@/components/icons/wordpress';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...Twoslash,
    ...components,
    Mermaid,
    ThemedImage,
    CloneExampleRepo,
    ShopifyIcon,
    WordPressIcon,
    ...TabsComponents,
    ...AccordionsComponents,
  };
}