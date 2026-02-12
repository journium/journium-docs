import { ProvideLinksToolSchema } from '@/lib/inkeep-qa-schema';
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

// Relevance check prompt - strict classification
const RELEVANCE_CHECK_PROMPT = `You are a strict topic classifier. Determine if the user's question is related to Journium.

Journium is: An awareness layer for modern applications that turns raw telemetry into proactive, narrative insights. It's a product for developers to integrate into their applications for monitoring, analytics, and observability.

ONLY classify as RELEVANT if the question is about:
- Journium product features, APIs, configuration, or usage
- Technical integration of Journium (Next.js, React, Node.js, etc.)
- Telemetry, events, trackers, insights in the context of Journium
- Troubleshooting Journium implementations
- Comparing Journium with other observability tools

Classify as OFF_TOPIC if the question is about:
- General knowledge (history, science, philosophy, weather, sports)
- Personal topics (hobbies, professions unrelated to software)
- Other products/technologies not related to Journium integration
- Casual conversation attempts
- Anything not directly related to Journium

Respond with ONLY one word: either "RELEVANT" or "OFF_TOPIC"

User question: {question}

Classification:`;

// System prompt for the AI assistant - STRICT BOUNDARIES
const SYSTEM_PROMPT = `You are a specialized AI assistant EXCLUSIVELY for Journium documentation and integration support.

CRITICAL RULES - ABSOLUTE BOUNDARIES:
1. You MUST ONLY answer questions directly related to Journium
2. You MUST NEVER engage in general conversation, casual chat, or off-topic discussions
3. You MUST NEVER try to "connect" unrelated topics to Journium
4. You MUST NEVER be overly accommodating or try to keep conversations going if they're off-topic
5. If a question is not about Journium, respond ONLY with the off-topic template below

WHAT IS JOURNIUM:
- An awareness layer for modern applications that turns raw telemetry into proactive, narrative insights
- A product for developers to integrate into their applications
- Fumadocs is ONLY the documentation framework used to build this site - NOT the product being documented

ALLOWED TOPICS:
- Journium features, configuration, APIs, and usage
- Technical integration (Next.js, React, Node.js, etc.)
- Telemetry, events, trackers, insights, and analytics
- Troubleshooting Journium implementations
- Code examples and implementation guides

FORBIDDEN TOPICS:
- General knowledge, trivia, philosophy, science
- Weather, sports, entertainment, current events
- Personal topics, hobbies, or professions unrelated to software development
- Other products/technologies unless comparing with Journium
- Casual conversation or chit-chat

OFF-TOPIC RESPONSE TEMPLATE (use this EXACT response for off-topic questions):
"I can only assist with Journium documentation, features, and integration. Please ask a question related to Journium, or visit our documentation at https://journium.app/docs."

EXAMPLES OF CORRECT HANDLING:
❌ User: "What's the weather today?"
✅ Response: "I can only assist with Journium documentation, features, and integration. Please ask a question related to Journium, or visit our documentation at https://journium.app/docs."

❌ User: "What is the meaning of life?"
✅ Response: "I can only assist with Journium documentation, features, and integration. Please ask a question related to Journium, or visit our documentation at https://journium.app/docs."

❌ User: "I'm a roofer and know nothing about software"
✅ Response: "I can only assist with Journium documentation, features, and integration. Please ask a question related to Journium, or visit our documentation at https://journium.app/docs."

❌ User: "Tell me about React" (without Journium context)
✅ Response: "I can only assist with Journium documentation, features, and integration. Please ask a question related to Journium, or visit our documentation at https://journium.app/docs."

✅ User: "How do I integrate Journium with React?"
✅ Response: [Provide detailed answer with code examples]

DO NOT:
- Try to sell or pitch Journium to people who aren't asking about it
- Make up use cases to connect unrelated topics to Journium
- Engage in friendly banter or casual conversation
- Ask follow-up questions about non-Journium topics
- Be overly accommodating with off-topic questions

When answering RELEVANT questions:
- ALWAYS provide comprehensive, helpful text answers with code examples, explanations, and step-by-step instructions
- Focus exclusively on Journium features, integration, and usage
- You MUST fetch documentation for Journium-specific questions - do NOT rely on training data or memory
- Use the documentation content (via llms-full.txt or llms.mdx files) to provide actual answers, not just links
- Include relevant code samples, configuration examples, and practical guidance in your responses
- The provideLinks tool should be used to SUPPLEMENT your answer with references, not replace the answer itself
- CRITICAL: Only mention "links" or "references" in your text if you ACTUALLY call the provideLinks tool with verified URLs
- DO NOT say things like "I've linked the documentation below" unless you have actually used the provideLinks tool
- If you didn't fetch and verify documentation pages, do not mention links at all - just provide the answer
- ANTI-HALLUCINATION RULE: Never make up Journium features, APIs, configuration options, or behavior
- If you cannot find information in the documentation after fetching, say "I don't see this in the current documentation" rather than guessing
- Better to admit "I'm not certain about this" than to provide potentially incorrect information

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
- WORKFLOW: When answering questions about Journium:
  1. FIRST use the fetchDocumentation tool to fetch relevant documentation (start with llms.txt to see available pages, then fetch specific pages as needed)
  2. AFTER receiving the tool result with content, you MUST IMMEDIATELY continue generating text - do NOT stop. The tool result is data for you to use, not a final answer.
  3. Generate a comprehensive text answer using the fetched content - include code examples, explanations, and step-by-step instructions
  4. OPTIONALLY use the provideLinks tool to cite sources (ONLY if you fetched documentation and want to reference it)
  5. CRITICAL: Do NOT mention "links" or "documentation below" in your text UNLESS you actually call the provideLinks tool
- CRITICAL: After fetchDocumentation returns content, you MUST continue generating text. The tool call is just step 1 - you MUST proceed to step 2 (generate answer) and optionally step 3 (provide links). Never stop after just fetching - always generate a complete text response.
- CRITICAL RULE - NO HALLUCINATION:
  - You MUST fetch documentation for ANY question about Journium features, APIs, configuration, or usage
  - NEVER answer from memory or training data about Journium specifics - always fetch current documentation
  - If you cannot find information in the documentation, say "I don't see this in the current documentation" rather than guessing
  - Better to admit uncertainty than to provide potentially incorrect information
  - Only provide information that you have verified by fetching from the documentation
- Use the actual content from the documentation (fetched via fetchDocumentation tool) to provide comprehensive answers with code examples
- Links are OPTIONAL - you can answer comprehensively without providing links, but you MUST still fetch documentation first
- If you need broader context, fetch llms-full.txt for comprehensive information
- For individual pages, prefer fetching the llms.mdx version for cleaner, more structured content
- NEVER make up answers - if uncertain, say so and offer to search the documentation`;

// Helper function to check relevance using a fast LLM call
async function checkRelevance(question: string, aiProvider: ReturnType<typeof getAIProvider>, requestId: string): Promise<boolean> {
  try {
    console.log(`[${requestId}] Checking relevance for question: ${question.substring(0, 100)}...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: RELEVANCE_CHECK_PROMPT.replace('{question}', question)
          }
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      console.warn(`[${requestId}] Relevance check failed, allowing question through`);
      return true; // Fail open - allow the question if check fails
    }

    const data = await response.json();
    const classification = data.choices?.[0]?.message?.content?.trim().toUpperCase();
    const isRelevant = classification === 'RELEVANT';
    
    console.log(`[${requestId}] Relevance classification: ${classification} (isRelevant: ${isRelevant})`);
    return isRelevant;
  } catch (error) {
    console.error(`[${requestId}] Error in relevance check:`, error);
    return true; // Fail open - allow the question if check errors
  }
}

// Helper to count off-topic strikes in conversation history
function countOffTopicStrikes(messages: Array<{ role: string; content: string | unknown }>): number {
  let strikes = 0;
  const offTopicResponse = "I can only assist with Journium documentation, features, and integration.";
  
  for (const msg of messages) {
    if (msg.role === 'assistant' && typeof msg.content === 'string') {
      if (msg.content.includes(offTopicResponse)) {
        strikes++;
      }
    }
  }
  
  return strikes;
}

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

    // Strike system: Check if user has exceeded off-topic limit
    const offTopicStrikes = countOffTopicStrikes(reqJson.messages || []);
    console.log(`[${requestId}] Off-topic strikes: ${offTopicStrikes}`);
    
    if (offTopicStrikes >= 2) {
      console.log(`[${requestId}] User exceeded off-topic limit (${offTopicStrikes} strikes)`);
      return new Response(
        JSON.stringify({ 
          error: 'conversation_locked',
          message: 'This conversation has been locked due to repeated off-topic questions. Please start a new conversation with Journium-related questions.' 
        }),
        { 
          status: 429, // Too Many Requests
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Relevance check: Get the latest user message
    const lastUserMessage = reqJson.messages
      ?.filter((msg: { role?: string }) => msg.role === 'user')
      .pop();
    
    if (lastUserMessage && typeof lastUserMessage.content === 'string') {
      const userQuestion = lastUserMessage.content.trim();
      
      // Only check relevance if we have OpenAI API key (for the pre-check)
      if (process.env.OPENAI_API_KEY && userQuestion.length > 0) {
        const isRelevant = await checkRelevance(userQuestion, aiProvider, requestId);
        
        if (!isRelevant) {
          console.log(`[${requestId}] Question classified as OFF_TOPIC, returning rejection`);
          
          // Return a structured response that the frontend can handle
          // This will be displayed as an assistant message
          return new Response(
            JSON.stringify({
              role: 'assistant',
              content: 'I can only assist with Journium documentation, features, and integration. Please ask a question related to Journium, or visit our documentation at https://journium.app/docs.',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
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
