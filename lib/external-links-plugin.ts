import type * as PageTree from 'fumadocs-core/page-tree';

// External links configuration
const externalLinks = {
  '(nextjs)': [
    {
      name: 'Next.js Demo',
      url: 'https://github.com/your-org/journium-nextjs-demo',
    },
    {
      name: 'React Demo',
      url: 'https://github.com/your-org/journium-react-demo',
    },
    {
      name: 'JavaScript Demo',
      url: 'https://github.com/your-org/journium-js-demo',
    },
  ],
};

/**
 * Recursively inject external links after "---Demo Repositories" separator
 * This modifies the page tree structure to include external link nodes
 * 
 * Since (nextjs) is a route group, we search for the separator in any folder
 * and inject links when we find it. The folder name might be "(nextjs)" or "Next.js"
 * depending on how fumadocs processes route groups.
 * 
 * @param node - The node to process
 * @param depth - The depth of the current node (0 = root level)
 */
function injectExternalLinks(node: PageTree.Node, depth: number = 0): PageTree.Node {
  if (node.type !== 'folder' || !node.children) return node;

  const children = [...node.children];
  const nodeName = typeof node.name === 'string' ? node.name : String(node.name);
  
  // Only check for Next.js folder at root level (depth 0)
  // This ensures we don't inject links into nested folders like "Concepts" or "Hooks"
  const isRootLevelNextJsFolder = 
    depth === 0 && (
      nodeName === '(nextjs)' || 
      nodeName === 'Next.js' ||
      nodeName.toLowerCase() === 'next.js'
    );

  // Only inject links at the root level Next.js folder
  if (isRootLevelNextJsFolder) {
    const demoReposIndex = children.findIndex(
      (child) => child.type === 'separator' && child.name === 'Demo Repositories'
    );

    const links = externalLinks['(nextjs)'];
    
    // Create external link nodes with the correct structure
    // Based on fumadocs page tree structure: { type: 'page', name: string, url: string }
    const externalLinkNodes: PageTree.Node[] = links.map((link) => ({
      type: 'page',
      name: link.name,
      url: link.url,
    } as PageTree.Node));

    if (demoReposIndex !== -1) {
      // Separator exists, insert links after it
      children.splice(demoReposIndex + 1, 0, ...externalLinkNodes);
    } else {
      // Separator doesn't exist (filtered out because it's at the end),
      // so we add both the separator and links at the end
      const separatorNode: PageTree.Node = {
        type: 'separator',
        name: 'Demo Repositories',
      } as PageTree.Node;
      
      children.push(separatorNode, ...externalLinkNodes);
    }
  }

  // Recursively process children (incrementing depth to mark nested folders)
  return {
    ...node,
    children: children.map((child) => {
      if (child.type === 'folder') {
        return injectExternalLinks(child, depth + 1);
      }
      return child;
    }),
  };
}

/**
 * Transform page tree to inject external links
 * This function modifies the tree structure before it's passed to DocsLayout
 */
export function transformPageTreeWithExternalLinks(
  tree: PageTree.Root
): PageTree.Root {
  return {
    ...tree,
    children: tree.children.map((node) => {
      if (node.type === 'folder') {
        return injectExternalLinks(node);
      }
      return node;
    }),
  };
}

