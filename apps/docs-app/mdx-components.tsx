import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Mermaid } from '@/components/mdx/mermaid';
import * as Twoslash from 'fumadocs-twoslash/ui';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { ThemedImage } from '@/components/ui/themed-image';
import { CloneExampleRepo } from '@/components/ui/clone-example-repo';
import { SignUpForFree } from '@/components/ui/sign-up-for-free';
import * as AccordionsComponents from 'fumadocs-ui/components/accordion';
import * as ButtonComponents from '@/components/ui/button';
import * as LucideIconComponents from 'lucide-react';
import { createGenerator, createFileSystemGeneratorCache } from 'fumadocs-typescript';
import { AutoTypeTable } from 'fumadocs-typescript/ui';
import { TypeTable } from 'fumadocs-ui/components/type-table';


// Filter out non-component exports from lucide-react (like createLucideIcon, Icon, etc.)
const LucideIcons = Object.fromEntries(
  Object.entries(LucideIconComponents).filter(
    ([key]) => !['createLucideIcon', 'Icon', 'icons'].includes(key)
  )
);


const generator = createGenerator({
  // set a cache, necessary for serverless platform like Vercel
  cache: createFileSystemGeneratorCache('.next/fumadocs-typescript'),
  // Set base path to the apps/docs-app directory
  basePath: './apps/docs-app',
});

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...Twoslash,
    ...components,
    Mermaid,
    ThemedImage,
    CloneExampleRepo,
    SignUpForFree,
    ...TabsComponents,
    ...AccordionsComponents,
    ...ButtonComponents,
    ...LucideIcons,
    AutoTypeTable: (props) => <AutoTypeTable {...props} generator={generator} />,
    TypeTable,
  };
}