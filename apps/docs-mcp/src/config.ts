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
     * The root directory of the workspace (where the docs are located)
     */
    workspaceRoot: string;
  };
  
  // Find the workspace root (go up from apps/docs-mcp/src to the workspace root)
  const workspaceRoot = path.resolve(__dirname, "../../..");
  
  export const config: DocsMcpConfig = {
    docsGlob: "apps/docs-app/content/docs/**/*.mdx",
    useFrontmatterRoutes: true,
    routeKeys: ["route", "slug", "pathname", "href"],
    docsRootDir: "apps/docs-app/content/docs",
    workspaceRoot,
  };
  