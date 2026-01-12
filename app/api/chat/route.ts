import { ProvideLinksToolSchema } from '../../../lib/inkeep-qa-schema';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { convertToModelMessages, streamText } from 'ai';

export const runtime = 'edge';

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

  throw new Error(
    'No AI provider configured. Please set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or AI_API_KEY + AI_BASE_URL'
  );
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

const aiProvider = getAIProvider();
const modelName = getModelName();

// Helper to get provider name for logging
const getProviderName = () => {
  if (process.env.OPENAI_API_KEY) return 'OpenAI';
  if (process.env.ANTHROPIC_API_KEY) return 'Anthropic';
  if (process.env.AI_API_KEY) return 'Custom';
  return 'Unknown';
};

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant for Journium documentation. 

IMPORTANT CONTEXT:
- Journium is the product being documented - an awareness layer for modern applications that turns raw telemetry into proactive, narrative insights
- Fumadocs is ONLY the documentation framework used to build this site - it is NOT the product being documented
- When answering questions, you MUST focus on Journium, NOT Fumadocs
- Do NOT mention Fumadocs unless specifically asked about the documentation site itself

When answering questions:
- Focus exclusively on Journium features, integration, and usage
- Be accurate and helpful about Journium specifically
- Reference specific documentation pages when relevant using the provideLinks tool
- If you're not sure about something related to Journium, say so rather than guessing
- Never confuse Fumadocs (the docs framework) with Journium (the product)

The documentation is available at https://journium.app/docs and you can reference specific pages using the provideLinks tool.`;

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
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
        provideLinks: {
          inputSchema: ProvideLinksToolSchema,
          description:
            'Provide links to relevant documentation pages when referencing specific topics or features. Include the URL, title, and optional label/footnote.',
        },
      },
      messages,
      toolChoice: 'auto',
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
