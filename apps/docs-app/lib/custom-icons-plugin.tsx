import { ShopifyIcon } from '@/components/icons/shopify';
import { WordPressIcon } from '@/components/icons/wordpress';
import { JrVscodeIcon } from '@/components/icons/jr-vscode';
import { JrMcpIcon } from '@/components/icons/jr-mcp';
import type { LoaderPlugin } from 'fumadocs-core/source';
import { createElement, type ReactNode } from 'react';

/**
 * Custom icon plugin to resolve custom icons from frontmatter
 * MUST run before lucideIconsPlugin so custom icons are processed first
 */
export function customIconsPlugin(): LoaderPlugin {
  const icons: Record<string, React.ComponentType> = {
    ShopifyIcon,
    WordPressIcon,
    JrVscodeIcon,
    JrMcpIcon,
  };

  const replaceIcon = (iconValue: ReactNode): ReactNode => {
    if (typeof iconValue === 'string') {
      const Icon = icons[iconValue];
      if (Icon) {
        return createElement(Icon);
      }
    }
    return iconValue;
  };

  return {
    name: 'custom-icons',
    transformPageTree: {
      file: (node) => {
        node.icon = replaceIcon(node.icon);
        return node;
      },
      folder: (node) => {
        node.icon = replaceIcon(node.icon);
        return node;
      },
      separator: (node) => {
        node.icon = replaceIcon(node.icon);
        return node;
      },
    },
  };
}