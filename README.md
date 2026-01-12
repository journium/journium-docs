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

## AI Search Configuration

The documentation site includes an AI-powered search feature. To enable it, configure one of the following AI providers:

### Option 1: OpenAI (Recommended)

Add to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini  # Optional: defaults to gpt-4o-mini. Other options: gpt-4o, gpt-4-turbo, etc.
```

### Option 2: Anthropic (Claude)

Add to your `.env.local` file:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Optional: defaults to claude-3-5-sonnet-20241022
```

### Option 3: Custom OpenAI-Compatible API

Add to your `.env.local` file:

```env
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://your-api-endpoint.com/v1
AI_MODEL=your-model-name  # Optional: defaults to gpt-4o-mini
```

The AI search uses the `provideLinks` tool to cite documentation sources. The configuration is in `app/api/chat/route.ts`.

## Project Structure

- `app/` - Next.js app directory with routes and layouts
- `content/docs/` - Documentation content written in MDX
- `components/` - React components used throughout the site
- `lib/` - Utility functions and shared logic
