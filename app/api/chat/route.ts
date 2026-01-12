import { ProvideLinksToolSchema } from '../../../lib/inkeep-qa-schema';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { convertToModelMessages, streamText, stepCountIs } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

// Tool schema for fetching documentation content
const FetchDocumentationSchema = z.object({
  url: z.string().describe('The full URL to fetch documentation content from. Must be from journium.app domain (e.g., https://journium.app/llms.txt, https://journium.app/llms-full.txt, https://journium.app/llms.mdx/docs/..., or https://journium.app/docs/....mdx)'),
});

// Configure your AI provider here
// Option 1: OpenAI (recommended - install @ai-sdk/openai for better types)
// Option 2: Anthropic (install @ai-sdk/anthropic)
// Option 3: Any OpenAI-compatible API (using createOpenAICompatible)

const getAIProvider = () => {
  // Option 1: Use OpenAI
  if (process.env.OPENAI_API_KEY) {
    return createOpenAICompatible({
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
    });
  }

  // Option 2: Use Anthropic (Claude)
  if (process.env.ANTHROPIC_API_KEY) {
    return createOpenAICompatible({
      name: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: 'https://api.anthropic.com/v1',
    });
  }

  // Option 3: Use custom OpenAI-compatible endpoint
  if (process.env.AI_API_KEY && process.env.AI_BASE_URL) {
    return createOpenAICompatible({
      name: 'custom',
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL,
    });
  }

  // For CI builds without API keys, return a dummy provider that will error at runtime
  // This allows the build to succeed but the API will fail when actually called
  return createOpenAICompatible({
    name: 'dummy',
    apiKey: 'dummy-key-for-build',
    baseURL: 'https://api.openai.com/v1',
  });
};

const getModelName = () => {
  // Default models - customize based on your provider
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini'; // or 'gpt-4o', 'gpt-4-turbo', etc.
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'; // or 'claude-3-opus-20240229', etc.
  }
  if (process.env.AI_API_KEY) {
    return process.env.AI_MODEL || 'gpt-4o-mini';
  }
  return 'gpt-4o-mini';
};

// Helper to get provider name for logging
const getProviderName = () => {
  if (process.env.OPENAI_API_KEY) return 'OpenAI';
  if (process.env.ANTHROPIC_API_KEY) return 'Anthropic';
  if (process.env.AI_API_KEY) return 'Custom';
  return 'Dummy (build-only)';
};

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant for Journium documentation. 

IMPORTANT CONTEXT:
- Journium is the product being documented - an awareness layer for modern applications that turns raw telemetry into proactive, narrative insights
- Fumadocs is ONLY the documentation framework used to build this site - it is NOT the product being documented
- When answering questions, you MUST focus on Journium, NOT Fumadocs
- Do NOT mention Fumadocs unless specifically asked about the documentation site itself

When answering questions:
- ALWAYS provide comprehensive, helpful text answers with code examples, explanations, and step-by-step instructions
- Focus exclusively on Journium features, integration, and usage
- Be accurate and helpful about Journium specifically
- Use the documentation content (via llms-full.txt or llms.mdx files) to provide actual answers, not just links
- Include relevant code samples, configuration examples, and practical guidance in your responses
- The provideLinks tool should be used to SUPPLEMENT your answer with references, not replace the answer itself
- Links should appear at the end as "Learn more" references, not as the primary response
- If you're not sure about something related to Journium, say so rather than guessing
- Never confuse Fumadocs (the docs framework) with Journium (the product)

DOCUMENTATION ACCESS:
- The documentation is available at https://journium.app/docs
- For comprehensive documentation access, AI-friendly formats are available:
  - https://journium.app/llms.txt - Structured index of all documentation pages with descriptions
  - https://journium.app/llms-full.txt - Complete documentation content in a single, AI-friendly format
- LLM-friendly MDX content: For any page URL listed in llms.txt (e.g., /docs/nextjs/concepts/application), 
  you can access the raw MDX content optimized for AI consumption using either method:
  - Primary method: Prefix the path with "llms.mdx/docs" (remove the leading "/docs" first)
    - Example: /docs/nextjs/concepts/application → https://journium.app/llms.mdx/docs/nextjs/concepts/application
  - Fallback method: Simply add ".mdx" suffix to the original path
    - Example: /docs/nextjs/concepts/application → https://journium.app/docs/nextjs/concepts/application.mdx
  - Both methods provide clean, processed markdown content without HTML/JSX, ideal for AI parsing
  - If one method fails, try the other as a fallback
  - IMPORTANT: MDX files themselves may contain links to other documentation pages. Any paths/URLs you encounter 
    within MDX content can also be accessed in raw MDX format using the same methods above. This allows you to 
    recursively access related content when needed for comprehensive answers
- CRITICAL RULES FOR DOCUMENTATION LINKS:
  - ONLY provide links to documentation pages that you have ACTUALLY FETCHED and VERIFIED exist using the fetchDocumentation tool
  - Valid sources for links are:
    1. Pages listed in llms.txt that you fetched using fetchDocumentation tool
    2. Links found within MDX files you fetched using fetchDocumentation tool
  - NEVER make up, guess, or infer documentation paths that you haven't fetched and verified
  - NEVER provide links to pages you haven't actually fetched with the fetchDocumentation tool
  - If you're not certain a page exists (because you haven't fetched it), do NOT include it in provideLinks
  - When fetching MDX files, note any links they contain - those are valid to reference ONLY if you've verified them
  - When in doubt, omit the link rather than guessing a path
  
- CRITICAL: You CANNOT access documentation files directly. You MUST use the fetchDocumentation tool to read any documentation content.
- WORKFLOW: When answering questions:
  1. FIRST use the fetchDocumentation tool to fetch relevant documentation (start with llms.txt to see available pages, then fetch specific pages as needed)
  2. AFTER receiving the tool result with content, you MUST IMMEDIATELY continue generating text - do NOT stop. The tool result is data for you to use, not a final answer.
  3. Generate a comprehensive text answer using the fetched content - include code examples, explanations, and step-by-step instructions
  4. FINALLY use the provideLinks tool to cite sources (only after providing the complete text answer)
- CRITICAL: After fetchDocumentation returns content, you MUST continue generating text. The tool call is just step 1 - you MUST proceed to step 2 (generate answer) and step 3 (provide links). Never stop after just fetching - always generate a complete text response.
- Use the actual content from the documentation (fetched via fetchDocumentation tool) to provide comprehensive answers with code examples
- Links should support your answer, not be the answer itself
- If you need broader context, fetch llms-full.txt for comprehensive information
- For individual pages, prefer fetching the llms.mdx version for cleaner, more structured content
- NEVER make up answers - always fetch and use actual documentation content`;

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    // Lazy initialization - only check for API keys when the route is actually called
    const hasValidApiKey = 
      process.env.OPENAI_API_KEY || 
      process.env.ANTHROPIC_API_KEY || 
      (process.env.AI_API_KEY && process.env.AI_BASE_URL);
    
    if (!hasValidApiKey) {
      console.error(`[${requestId}] No AI provider configured`);
      return new Response(
        JSON.stringify({ 
          error: 'AI chat is not configured. Please set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or AI_API_KEY + AI_BASE_URL' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const aiProvider = getAIProvider();
    const modelName = getModelName();
    
    console.log(`[${requestId}] ===== Chat API Request Started =====`);
    console.log(`[${requestId}] Provider: ${getProviderName()}, Model: ${modelName}`);
    
    const reqJson = await req.json();
    console.log(`[${requestId}] Request received with ${reqJson.messages?.length || 0} messages`);

    // Log incoming messages (sanitized)
    if (reqJson.messages && Array.isArray(reqJson.messages)) {
      reqJson.messages.forEach((msg: { role?: string; content?: unknown }, idx: number) => {
        let contentPreview = '(no content)';
        if (msg.content !== undefined && msg.content !== null) {
          if (typeof msg.content === 'string') {
            contentPreview = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
          } else {
            const stringified = JSON.stringify(msg.content);
            contentPreview = stringified ? stringified.substring(0, 100) + (stringified.length > 100 ? '...' : '') : '(empty)';
          }
        }
        console.log(`[${requestId}] Message ${idx + 1}: role=${msg.role || 'unknown'}, content=${contentPreview}`);
      });
    }

    // Convert messages and add system prompt
    const messages = await convertToModelMessages(reqJson.messages, {
      ignoreIncompleteToolCalls: true,
    });

    // Add system message if not present
    const hasSystemMessage = messages.some((msg) => msg.role === 'system');
    if (!hasSystemMessage) {
      messages.unshift({
        role: 'system',
        content: SYSTEM_PROMPT,
      });
      console.log(`[${requestId}] Added system prompt (${SYSTEM_PROMPT.length} chars)`);
    } else {
      console.log(`[${requestId}] System message already present, skipping`);
    }

    console.log(`[${requestId}] Sending ${messages.length} messages to LLM`);
    console.log(`[${requestId}] Message roles: ${messages.map((m) => m.role).join(', ')}`);

    const result = streamText({
      model: aiProvider(modelName),
      tools: {
        fetchDocumentation: {
          inputSchema: FetchDocumentationSchema,
          description:
            'Fetch documentation content from a URL. Use this tool to read llms.txt, llms-full.txt, or specific MDX pages. After fetching, you MUST continue to generate a comprehensive text answer using the fetched content. Only fetch URLs from journium.app domain.',
          execute: async ({ url }) => {
            try {
              // Validate URL is from journium.app domain
              const urlObj = new URL(url);
              if (!urlObj.hostname.includes('journium.app')) {
                return {
                  error: 'Invalid URL. Only journium.app documentation URLs are allowed.',
                  content: null,
                };
              }

              console.log(`[${requestId}] Fetching documentation from: ${url}`);
              const response = await fetch(url, {
                headers: {
                  'User-Agent': 'Journium-Docs-AI/1.0',
                },
              });

              if (!response.ok) {
                console.error(`[${requestId}] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
                return {
                  error: `Failed to fetch documentation: ${response.status} ${response.statusText}`,
                  content: null,
                };
              }

              const content = await response.text();
              console.log(`[${requestId}] Successfully fetched ${url} (${content.length} chars)`);
              
              return {
                url,
                content,
                contentType: response.headers.get('content-type') || 'text/plain',
              };
            } catch (error) {
              console.error(`[${requestId}] Error fetching ${url}:`, error);
              return {
                error: `Error fetching documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                content: null,
              };
            }
          },
        },
        provideLinks: {
          inputSchema: ProvideLinksToolSchema,
          description:
            'Use this tool AFTER providing a complete answer to cite sources and provide "Learn more" references. CRITICAL: Only include links to pages you have ACTUALLY FETCHED and VERIFIED exist using the fetchDocumentation tool. NEVER make up or guess documentation paths. Do NOT use this tool as the primary response - always provide comprehensive text answers with code examples first, then use this tool to supplement with verified documentation links.',
        },
      },
      messages,
      toolChoice: 'auto',
      // Allow multiple steps so the model can continue generating after tool calls
      // This enables the workflow: tool call -> tool result -> continue generating text -> optionally call provideLinks
      stopWhen: stepCountIs(5), // Allow up to 5 steps (tool call + result + text generation + optional provideLinks + result)
      onFinish: async ({ text, finishReason, usage, toolCalls, toolResults }) => {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] ===== LLM Response Finished =====`);
        console.log(`[${requestId}] Duration: ${duration}ms`);
        console.log(`[${requestId}] Finish reason: ${finishReason}`);
        console.log(`[${requestId}] Response length: ${text?.length || 0} chars`);
        if (usage) {
          console.log(`[${requestId}] Usage:`, JSON.stringify(usage, null, 2));
        }
        if (toolCalls && toolCalls.length > 0) {
          console.log(`[${requestId}] Tool calls (${toolCalls.length}):`, JSON.stringify(toolCalls, null, 2));
        }
        if (toolResults && toolResults.length > 0) {
          console.log(`[${requestId}] Tool results (${toolResults.length}):`, JSON.stringify(toolResults, null, 2));
        }
      },
    });

    console.log(`[${requestId}] Streaming response started`);
    return result.toUIMessageStreamResponse();
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ===== ERROR =====`);
    console.error(`[${requestId}] Duration before error: ${duration}ms`);
    console.error(`[${requestId}] Error:`, error);
    console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}
