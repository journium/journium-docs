import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { DocsMcpConfig } from "./config.js";

export type DocRecord = {
  filePath: string;     // full relative path on disk
  route: string;        // resolved route
  title: string;        // from frontmatter or filename
  frontmatter: Record<string, unknown>;
  bodyMdx: string;      // raw MDX body (without frontmatter)
  text: string;         // naive plain-text for searching
};

function stripMdxToText(mdx: string): string {
  // Cheap + safe MVP: remove code fences + JSX-ish tags + markdown punctuation.
  // Upgrade later to unified/remark if you want perfect heading extraction.
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[#>*_\-\[\]\(\)!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveRouteFromFile(filePath: string, docsRootDir: string): string {
  const rel = filePath.split(path.sep).join("/"); // normalize
  const root = docsRootDir.replace(/\\/g, "/").replace(/\/+$/, "");
  const withoutRoot = rel.startsWith(root + "/") ? rel.slice(root.length + 1) : rel;
  const withoutExt = withoutRoot.replace(/\.mdx?$/i, "");
  // index.mdx -> /
  const route = withoutExt.endsWith("/index")
    ? "/" + withoutExt.slice(0, -"/index".length)
    : "/" + withoutExt;
  return route === "/" ? "/" : route.replace(/\/+/g, "/");
}

function getFrontmatterRoute(
  fm: Record<string, unknown>,
  routeKeys: string[],
): string | undefined {
  for (const key of routeKeys) {
    const v = fm[key];
    if (typeof v === "string" && v.trim()) {
      const s = v.trim();
      return s.startsWith("/") ? s : `/${s}`;
    }
  }
  return undefined;
}

export class DocsIndex {
  private docs: DocRecord[] = [];

  constructor(private cfg: DocsMcpConfig) {}

  async rebuild(): Promise<void> {
    console.log("Rebuilding docs index...");
    const files = await fg(this.cfg.docsGlob, { 
      dot: false,
      cwd: this.cfg.workspaceRoot,
      absolute: false,
      onlyFiles: true,
      gitignore: false
    });
    console.log(`Found ${files.length} documentation files`);
    const out: DocRecord[] = [];

    for (const filePath of files) {
      const fullPath = path.join(this.cfg.workspaceRoot, filePath);
      const raw = await fs.readFile(fullPath, "utf-8");
      const parsed = matter(raw);
      const fm = (parsed.data ?? {}) as Record<string, unknown>;

      const title =
        (typeof fm.title === "string" && fm.title.trim()) ||
        path.basename(filePath).replace(/\.mdx?$/i, "");

      const route =
        (this.cfg.useFrontmatterRoutes
          ? getFrontmatterRoute(fm, this.cfg.routeKeys)
          : undefined) ?? deriveRouteFromFile(filePath, this.cfg.docsRootDir);

      const bodyMdx = parsed.content ?? "";
      const text = stripMdxToText(bodyMdx);

      out.push({
        filePath,
        route,
        title,
        frontmatter: fm,
        bodyMdx,
        text,
      });
    }

    this.docs = out;
  }

  listRoutes(prefix?: string): Array<{ route: string; title: string; filePath: string }> {
    const pfx = prefix?.trim();
    return this.docs
      .filter((d) => (!pfx ? true : d.route.startsWith(pfx)))
      .map((d) => ({ route: d.route, title: d.title, filePath: d.filePath }))
      .sort((a, b) => a.route.localeCompare(b.route));
  }

  getByRoute(route: string): DocRecord | undefined {
    const r = route.startsWith("/") ? route : `/${route}`;
    return this.docs.find((d) => d.route === r);
  }

  getByFilePath(filePath: string): DocRecord | undefined {
    return this.docs.find((d) => d.filePath === filePath);
  }

  search(query: string, limit = 8): Array<{ score: number; doc: DocRecord; excerpt: string }> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Simple scoring: title match > route match > text match
    const scored = this.docs
      .map((doc) => {
        const t = doc.title.toLowerCase();
        const r = doc.route.toLowerCase();
        const x = doc.text.toLowerCase();

        let score = 0;
        if (t.includes(q)) score += 50;
        if (r.includes(q)) score += 20;
        if (x.includes(q)) score += 10;

        // small boost for multi-word matches
        const parts = q.split(/\s+/).filter(Boolean);
        if (parts.length > 1) {
          for (const p of parts) {
            if (x.includes(p)) score += 2;
            if (t.includes(p)) score += 5;
          }
        }

        const idx = x.indexOf(q);
        const excerpt =
          idx >= 0 ? doc.text.slice(Math.max(0, idx - 80), idx + q.length + 160) : doc.text.slice(0, 240);

        return { score, doc, excerpt: excerpt.trim() };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }
}
