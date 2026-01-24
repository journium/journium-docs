import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { blogBaseOptions, linkItems } from '@/lib/layout.shared';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';
import Link from 'fumadocs-core/link';
import Image from 'next/image';
import Preview from '@/public/banner.png';
import { Book, ComponentIcon, CircleQuestionMark, Server } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout
      {...blogBaseOptions()}
      links={[
        {
          type: 'menu',
          on: 'menu',
          text: 'Documentation',
          items: [
            {
              text: 'Getting Started',
              url: '/docs',
              icon: <Book />,
            },
            {
              text: 'What is Journium?',
              url: '/docs/what-is-journium',
              icon: <CircleQuestionMark />,
            },
          ],
        },
        {
          type: 'custom',
          on: 'nav',
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>
                <Link href="/docs">Documentation</Link>
              </NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink href="/docs" className="md:row-span-2">
                  <div className="-mx-3 -mt-3">
                    <Image
                      src={Preview}
                      alt="Perview"
                      className="rounded-t-lg object-cover"
                      style={{
                        maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
                      }}
                    />
                  </div>
                  <p className="font-medium">Getting Started</p>
                  <p className="text-fd-muted-foreground text-sm">
                    Learn to use Journium with your applications.
                  </p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/what-is-journium" className="lg:col-start-2">
                  <ComponentIcon className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                  <p className="font-medium">What is Journium?</p>
                  <p className="text-fd-muted-foreground text-sm">
                    Learn about Journium and how it works.
                  </p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/concepts" className="lg:col-start-2">
                  <Server className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                  <p className="font-medium">Concepts</p>
                  <p className="text-fd-muted-foreground text-sm">
                    Learn about the core concepts of Journium.
                  </p>
                </NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
        ...linkItems,
      ]}
      className="[--color-fd-primary:var(--color-brand)]"
    >
      {children}
    </HomeLayout>
  );
}
