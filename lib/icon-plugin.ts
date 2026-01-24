import { ShopifyIcon } from '@/components/icons/shopify';
import { WordPressIcon } from '@/components/icons/wordpress';
import { createElement, ReactElement } from 'react';

interface IconNode {
  icon?: string | ReactElement;
  [key: string]: unknown;
}

/**
 * Custom icon plugin to resolve custom icons from frontmatter
 * MUST run before lucideIconsPlugin so custom icons are processed first
 */
export function customIconsPlugin() {
  function replaceIcon(node: IconNode) {
    // Only process if icon is a string (not yet converted)
    if (typeof node.icon !== 'string') return node;
    
    const icons: Record<string, React.ComponentType> = {
      ShopifyIcon,
      WordPressIcon,
    };
    
    const Icon = icons[node.icon];
    if (Icon) {
      // Found custom icon - convert it
      node.icon = createElement(Icon);
    }
    // If not found, leave as string for lucideIconsPlugin to try
    
    return node;
  }

  return {
    name: 'custom-icons',
    transformPageTree: {
      file: replaceIcon,
      folder: replaceIcon,
      separator: replaceIcon,
    },
  };
}
