import { source } from '@/lib/source';
// import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { TerminalIcon } from 'lucide-react';
import { NextJsIcon } from '@/components/icons/nextjs';
import { ReactIcon } from '@/components/icons/react';
import { JsIcon } from '@/components/icons/js';
import { AISearchPanel, AISearchTrigger } from '@/components/ai/search';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  
  return (
    <DocsLayout {...baseOptions()}
    tree={source.getPageTree()} 
    sidebar={{
      tabs: {
        transform(option, node) {
          const meta = source.getNodeMeta(node);
          if (!meta) return option;
          
          // Check if this is a Next.js tab by checking the path
          const isNextJs = meta.path?.includes('nextjs') || false;
          const isReact = meta.path?.includes('react') || false;
          const isJs = meta.path?.includes('js') || false;
          const Icon = isNextJs ? NextJsIcon : isReact ? ReactIcon : isJs ? JsIcon : TerminalIcon;

          if (isNextJs && option.urls) {
            // Keep the dropdown visible on /docs by mapping it to a tab.
            option.urls.add('/docs');
          }
          
          // Extract section from path (e.g., 'nextjs' from '/docs/nextjs')
          const getSection = (path: string | undefined) => {
            if (!path) return 'default';
            const parts = path.split('/').filter(Boolean);
            return parts[parts.length - 1] || 'default';
          };
          
          const section = getSection(meta.path);
          const color = `var(--${section}-color, var(--color-fd-foreground))`;

          return {
            ...option,
            icon: (
              <div
                className="[&_svg]:size-full rounded-lg size-full text-(--tab-color) max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5"
                style={
                  {
                    '--tab-color': color,
                  } as object
                }
              >
                <Icon />
              </div>
            ),
          };
        },
      },
    }}
    // sidebar={{
    //   tabs: [
    //     {
    //       title: 'Javascript',
    //       description: 'Javascript documentation',
    //       // active for `/docs/components` and sub routes like `/docs/components/button`
    //       url: '/docs/js',
    //       // optionally, you can specify a set of urls which activates the item
    //       //urls: new Set(['/docs/javascript/react', '/docs/javascript/nextjs']),
    //     },
    //     {
    //       title: 'Next.js',
    //       description: 'Next.js documentation',
    //       url: '/docs/nextjs',
    //       //urls: new Set(['/docs/nextjs/react', '/docs/nextjs/nextjs']),
    //     },
    //     {
    //       title: 'React',
    //       description: 'React documentation',
    //       url: '/docs/react',
    //       //urls: new Set(['/docs/react/react', '/docs/react/nextjs']),
    //     },
    //   ],
    //     }}
    >
      <AISearchPanel />
      <AISearchTrigger />
      {children}
    </DocsLayout>
  );
}