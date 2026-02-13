import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocsIndex } from "./indexer.js";

export function createServer(index: DocsIndex): McpServer {
  const server = new McpServer(
    {
      name: "journium-devtools",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
      instructions: `This is the Journium Documentation MCP server. It provides access to search and retrieve content from the Journium documentation.

Use the tools to:
- docs_search: Search for information about Journium features, APIs, and concepts
- docs_getPage: Retrieve full documentation pages with MDX content
- docs_listRoutes: Explore the documentation structure by listing available routes

The prompts provide pre-configured workflows for common documentation tasks like answering questions or writing new docs.`,
    }
  );

  /**
   * Ping handler: responds to ping requests to verify connection health
   * 
   * Per MCP specification (2025-06-18):
   * "The Model Context Protocol includes an optional ping mechanism that allows either party
   * to verify that their counterpart is still responsive and the connection is alive."
   * 
   * The server MUST respond promptly with an empty response.
   * 
   * Reference: https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping
   * 
   * Note: The SDK automatically handles ping requests via the Protocol class.
   * This is implemented in @modelcontextprotocol/sdk/server/index.d.ts:
   * - Server.ping() method sends ping requests to clients
   * - Incoming ping requests are handled automatically by the Protocol layer
   * 
   * Active Ping Implementation:
   * The server periodically pings clients (see index.ts) to proactively detect dead connections.
   * Configuration via environment variables:
   * - PING_INTERVAL: time between pings (default: 30000ms)
   * - PING_TIMEOUT: max wait for ping response (default: 10000ms)
   */
  // Ping handling is automatic via the SDK - no explicit handler needed

  // Define input schemas
  const SearchSchema = z.object({
    query: z.string().min(1).describe("Search query string"),
    limit: z.number().int().min(1).max(25).optional().describe("Maximum number of results to return (default: 8)"),
  });

  const GetPageSchema = z.object({
    route: z.string().optional().describe("URL route of the documentation page (e.g., /docs/getting-started)"),
    filePath: z.string().optional().describe("File system path to the documentation file"),
    include: z
      .object({
        mdx: z.boolean().optional().describe("Include raw MDX content"),
        text: z.boolean().optional().describe("Include plain text content"),
        frontmatter: z.boolean().optional().describe("Include frontmatter metadata"),
      })
      .optional()
      .describe("Options for what content to include in the response"),
  });

  const ListRoutesSchema = z.object({
    prefix: z.string().optional().describe("Optional prefix to filter routes (e.g., /docs/api)"),
  });

  // Register tools using the high-level API
  server.registerTool(
    "docs_search",
    {
      title: "Search Documentation",
      description: "Search through Journium documentation using semantic search. Returns relevant pages with excerpts showing matched content. Use this to find information about specific features, APIs, or concepts.",
      inputSchema: SearchSchema,
    },
    async ({ query, limit }) => {
      const hits = index.search(query, limit ?? 8).map((h) => ({
        route: h.doc.route,
        title: h.doc.title,
        filePath: h.doc.filePath,
        excerpt: h.excerpt,
        score: h.score,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ query, hits }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "docs_getPage",
    {
      title: "Get Documentation Page",
      description: "Retrieve the full content of a specific documentation page by its route (URL path) or file path. Returns the page with MDX content, plain text, and frontmatter metadata. Use this after searching to get complete details about a page.",
      inputSchema: GetPageSchema,
    },
    async ({ route, filePath, include }) => {
      const doc =
        (route ? index.getByRoute(route) : undefined) ??
        (filePath ? index.getByFilePath(filePath) : undefined);

      if (!doc) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Not found" }) }] };
      }

      const inc = {
        mdx: include?.mdx ?? true,
        text: include?.text ?? true,
        frontmatter: include?.frontmatter ?? true,
      };

      const payload: any = {
        route: doc.route,
        title: doc.title,
        filePath: doc.filePath,
      };
      if (inc.frontmatter) payload.frontmatter = doc.frontmatter;
      if (inc.mdx) payload.mdx = doc.bodyMdxResolved;
      if (inc.text) payload.text = doc.text;

      return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
    }
  );

  server.registerTool(
    "docs_listRoutes",
    {
      title: "List Documentation Routes",
      description: "Get a list of all available documentation page routes (URLs). Optionally filter by a route prefix to explore specific sections. Useful for discovering what documentation is available or navigating the docs structure.",
      inputSchema: ListRoutesSchema,
    },
    async ({ prefix }) => {
      const routes = index.listRoutes(prefix);
      return { content: [{ type: "text", text: JSON.stringify({ prefix, routes }, null, 2) }] };
    }
  );

  // Register prompts
  server.registerPrompt(
    "answer_from_docs",
    {
      title: "Answer Questions from Documentation",
      description: "Get answers to questions grounded in the Journium documentation. The assistant will search the docs, retrieve relevant pages, and provide accurate answers with citations. Best for learning how to use Journium features.",
      argsSchema: {
        question: z.string().min(1).describe("The question to answer using Journium documentation (e.g., 'How do I create a journal entry?')"),
      },
    },
    async ({ question }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `You are a docs assistant. You MUST ground answers in the docs tool outputs. Use citations: (route, title).\n\n` +
              `Question: ${question}\n\n` +
              `Instructions:\n` +
              `1) Call docs.search with a focused query.\n` +
              `2) Call docs.getPage for the top 2-3 hits.\n` +
              `3) Answer using only those sources; include citations like: [title](route).\n`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "write_mdx_snippet",
    {
      title: "Write MDX Documentation Snippet",
      description: "Generate new documentation content that matches the existing Journium docs style and tone. Searches existing docs to learn terminology and patterns, then drafts a new MDX snippet with proper formatting.",
      argsSchema: {
        topic: z.string().min(1).describe("The topic or feature to document (e.g., 'journal templates', 'search filters')"),
        style: z.enum(["concise", "tutorial", "reference"]).default("concise").describe("Writing style: concise (brief overview), tutorial (step-by-step), or reference (detailed specification)"),
      },
    },
    async ({ topic, style }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `You write MDX that matches an existing docs site tone. Prefer short sections, clear headings, and code blocks where useful.\n\n` +
              `Topic: ${topic}\nStyle: ${style}\n\n` +
              `Workflow:\n` +
              `- Use docs.search to find the closest existing pages/sections.\n` +
              `- Use docs.getPage to pull canonical terminology.\n` +
              `- Draft an MDX snippet with 2-4 headings and one example.\n`,
          },
        },
      ],
    })
  );

  return server;
}
