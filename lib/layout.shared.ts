import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import 'katex/dist/katex.css';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Journium Docs',
    },
  };
}