import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import 'katex/dist/katex.css';
import { JourniumLogo } from '@/components/icons/journium-logo';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

const docsLogo = (
  <div className="flex items-center gap-2">
    <JourniumLogo key="docs-logo" size="sm" className="h-6" />
    <Badge key="docs-badge" variant="outline" className="rounded-full">
      Docs
    </Badge>
  </div>
);

const blogLogo = (
  <div className="flex items-center gap-2">
    <JourniumLogo key="blog-logo" size="sm" className="h-6" />
    {/* <Badge key="blog-badge" variant="outline" className="rounded-full">
      Blog
    </Badge> */}
  </div>
);

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: docsLogo,
      url: 'https://journium.app',
      //transparentMode: 'top',
    },
    githubUrl: 'https://github.com/journium',
    themeSwitch: {
      enabled: true,
      component: <ThemeSwitcher key="docs-theme-switcher" className="ml-auto" />,
      mode: 'light-dark-system',
    },
  };
}

export function blogBaseOptions(): BaseLayoutProps {
  return {
    searchToggle: {
      enabled: false,
    },
    nav: {
      title: blogLogo,
      url: 'https://journium.app',
      //transparentMode: 'top',
    },
    githubUrl: 'https://github.com/journium',
    themeSwitch: {
      enabled: true,
      component: <ThemeSwitcher key="blog-theme-switcher" className="ml-auto" />,
      mode: 'light-dark-system',
    },
  };
}

export const linkItems: LinkItemType[] = [
  // {
  //   icon: <AlbumIcon />,
  //   text: 'Blog',
  //   url: '/blog',
  //   active: 'nested-url',
  // },
];