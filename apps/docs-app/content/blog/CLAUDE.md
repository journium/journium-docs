# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with blog posts in this directory.

## What lives here

Each `.mdx` file is a published blog post. The filename (without extension) becomes the URL slug: `filename.mdx` → `/blog/filename`.

## Frontmatter

Every post requires these fields:

```yaml
---
title: "Post Title"
description: "One-sentence summary shown in listings and meta tags."
date: 2026-01-31          # YYYY-MM-DD, used for ordering and display
author: Arun Patra        # Author display name
keywords:
  - keyword one
  - keyword two
---
```

Optional fields:

```yaml
status: draft             # Hides the post from listings and returns 404
```

## Available MDX Components

These components are available in blog posts without importing:

| Component | Purpose |
|-----------|---------|
| `<SignUpForFree message="..." />` | CTA button linking to sign-up |
| `<CTA />` | Generic call-to-action block |
| `<Video type="youtube" src="VIDEO_ID" width={560} height={315} />` | Embed YouTube video |
| `<VideoPlayer ... />` | Embed self-hosted video |
| `<List>` / `<ListItem>` | Styled list wrapper |
| `<ThemedImage light="..." dark="..." alt="..." />` | Image that swaps for dark mode |
| `<CloneExampleRepo ... />` | Repo clone prompt |
| `<TypeTable />` | API type reference table |
| `<Mermaid>` | Mermaid diagram block |
| `<Files>` / `<Folder>` / `<File>` | File tree visualization |
| `<Tabs>` / `<Tab>` | Tabbed content (from fumadocs-ui) |
| `<Accordion>` / `<Accordions>` | Collapsible sections (from fumadocs-ui) |
| `<Button>` | Styled button (can take `href`, `variant`, `size`) |
| Any Lucide icon (e.g. `<BookOpen />`) | Inline icon from lucide-react |

Standard Fumadocs MDX components (callouts, steps, etc.) are also available via `defaultMdxComponents`.

## Writing conventions

- Posts cover Journium product announcements, technical concepts, and engineering philosophy.
- Tone is direct and technical — written for developers and product engineers.
- Use `**bold**` for key terms introduced for the first time in a section.
- Code examples use titled code blocks: ` ```yaml title=".journium/trackers/example.yml" `.
- Posts do not use `<include>` tags — blog content is self-contained (unlike docs).
- Avoid marketing superlatives; let concrete examples and data carry the argument.
