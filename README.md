# Journium Documentation Site

This is the public documentation site for [Journium](https://journium.app), built with modern web technologies to provide an excellent developer experience.

## Tech Stack

This documentation site is built using:

- **[Next.js](https://nextjs.org)** - React framework for production
- **[Fumadocs](https://www.fumadocs.dev)** - Documentation framework built on top of Next.js and MDX

## Getting Started

### Prerequisites

- Node.js 22+ 
- pnpm (recommended package manager)

### Installation

Install dependencies using pnpm:

```bash
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3201](http://localhost:3201) with your browser to see the result. The page auto-updates as you edit files.

### Build

Build the production version:

```bash
pnpm build
```

### Start Production Server

Start the production server (after building):

```bash
pnpm start
```

### Linting

Run ESLint to check for code issues:

```bash
pnpm lint
```

## Project Structure

- `app/` - Next.js app directory with routes and layouts
- `content/docs/` - Documentation content written in MDX
- `components/` - React components used throughout the site
- `lib/` - Utility functions and shared logic
