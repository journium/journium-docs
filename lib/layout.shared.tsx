import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import 'katex/dist/katex.css';
import { JourniumLogo } from '@/components/icons/journium-logo';
import { Badge } from '@/components/ui/badge';

const logo = (
  <>
    <JourniumLogo size="sm" className="h-6" />
    <Badge variant="outline" className="rounded-full">
      Docs
    </Badge>
  </>
);

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: logo,
      url: '/docs',
    },
    githubUrl: 'https://github.com/journium',
  };
}

