import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocsIndex } from "./indexer.js";

export function createServer(index: DocsIndex): McpServer {
  const server = new McpServer({
    name: "docs-mcp",
    version: "1.0.0",
  });

  // ---- Tools ----

  server.tool(
    "docs.search",
    {
      query: z.string().min(1),
      limit: z.number().int().min(1).max(25).optional(),
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
    },
  );

  server.tool(
    "docs.getPage",
    {
      // allow either route or filePath
      route: z.string().optional(),
      filePath: z.string().optional(),
      include: z
        .object({
          mdx: z.boolean().optional(),
          text: z.boolean().optional(),
          frontmatter: z.boolean().optional(),
        })
        .optional(),
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
      if (inc.mdx) payload.mdx = doc.bodyMdx;
      if (inc.text) payload.text = doc.text;

      return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
    },
  );

  server.tool(
    "docs.listRoutes",
    {
      prefix: z.string().optional(),
    },
    async ({ prefix }) => {
      const routes = index.listRoutes(prefix);
      return { content: [{ type: "text", text: JSON.stringify({ prefix, routes }, null, 2) }] };
    },
  );

  // ---- Prompts ----
  // These are “workflow templates” that hosts can show via /prompts and then run.

  server.registerPrompt(
    "answer_from_docs",
    {
      description: "Answer questions using documentation search and retrieval",
      argsSchema: {
        question: z.string().min(1),
      },
    },
    ({ question }) => ({
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
              `2) Call docs.getPage for the top 2–3 hits.\n` +
              `3) Answer using only those sources; include citations like: [title](route).\n`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "write_mdx_snippet",
    {
      description: "Generate MDX documentation snippets based on existing docs style",
      argsSchema: {
        topic: z.string().min(1),
        style: z.enum(["concise", "tutorial", "reference"]).default("concise"),
      },
    },
    ({ topic, style }) => ({
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
    }),
  );

  return server;
}
