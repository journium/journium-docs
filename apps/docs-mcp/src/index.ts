import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

const PORT = process.env.PORT || 3000;

// Create Express app
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'docs-mcp' });
});

// MCP Server setup
const server = new Server(
  {
    name: 'journium-docs-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: 'search_docs',
    description: 'Search the Journium documentation',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
      },
      required: ['query'],
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_docs': {
      const query = args?.query as string;
      // TODO: Implement actual search logic
      return {
        content: [
          {
            type: 'text',
            text: `Search results for: ${query}\n\nTODO: Implement search functionality`,
          },
        ],
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start MCP server with stdio transport
async function startMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Journium Docs MCP server started on stdio');
}

// Start Express server
function startExpressServer() {
  app.listen(PORT, () => {
    console.error(`Express server running on http://localhost:${PORT}`);
  });
}

// Run both servers
async function main() {
  if (process.env.MCP_MODE === 'stdio') {
    await startMCPServer();
  } else {
    startExpressServer();
    // Optionally start MCP server too
    // await startMCPServer();
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
