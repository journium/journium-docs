import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type DocsMcpConfig = {
    docsGlob: string; // e.g. content/docs/**/*.mdx
    useFrontmatterRoutes: boolean;
  
    /**
     * Optional: frontmatter key names you want to consider as an explicit route.
     * Example: ["route", "slug", "pathname"]
     */
    routeKeys: string[];
  
    /**
     * If frontmatter route not present (or disabled), derive route from filepath.
     * Example: content/docs/getting-started.mdx -> /getting-started
     */
    docsRootDir: string; // "content/docs"
  
    /**
     * The root directory where docs are located
     */
    workspaceRoot: string;
  
    /**
     * Optional: Route patterns to exclude from the index.
     * These are typically internal/shared files that are included in other MDX files
     * but shouldn't be exposed as standalone routes.
     * Supports glob-like patterns (e.g., "/shared/**", "/internal/*")
     */
    excludeRoutePatterns?: string[];
  };
  
  /**
   * Configuration for different environments:
   * - DEV: Uses monorepo structure (../../.. to get to workspace root)
   * - PROD: Uses local content directory (../content from dist/)
   */
  function getConfig(): DocsMcpConfig {
    const isDev = process.env.NODE_ENV !== "production";
    
    if (isDev) {
      // Development: navigate to workspace root from apps/docs-mcp/src
      const workspaceRoot = path.resolve(__dirname, "../../..");
      return {
        docsGlob: "apps/docs-app/content/docs/**/*.mdx",
        useFrontmatterRoutes: true,
        routeKeys: ["route", "slug", "pathname", "href"],
        docsRootDir: "apps/docs-app/content/docs",
        workspaceRoot,
        excludeRoutePatterns: ["/shared/**"],
      };
    } else {
      // Production: use local content directory (from dist/ -> ../content)
      const workspaceRoot = path.resolve(__dirname, "..");
      return {
        docsGlob: "content/**/*.mdx",
        useFrontmatterRoutes: true,
        routeKeys: ["route", "slug", "pathname", "href"],
        docsRootDir: "content",
        workspaceRoot,
        excludeRoutePatterns: ["/shared/**"],
      };
    }
  }
  
  export const config: DocsMcpConfig = getConfig();
  