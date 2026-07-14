#!/usr/bin/env node

/**
 * iLoveVideoEditor MCP Server
 *
 * Exposes video rendering capabilities to AI agents via the Model Context Protocol.
 * Supports listing templates, generating VideoJSON from templates, and queueing renders.
 *
 * Usage:
 *   node dist/server.js          # stdio transport (default for MCP)
 *   node dist/server.js --http   # optional HTTP/SSE transport for debugging
 */

import type { LayerType } from '@ilovevideoeditor/core';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  handleLayerCapabilities,
  layerCapabilitiesTool,
} from './tools/capabilities.js';
import {
  handleLocalAnalyze,
  handleLocalCapture,
  handleLocalPreview,
  localAnalyzeTool,
  localCaptureTool,
  localPreviewTool,
} from './tools/localPreview.js';
import {
  getDownloadUrlTool,
  getRenderStatusTool,
  handleGetDownloadUrl,
  handleGetRenderStatus,
  handleRenderJSON,
  handleRenderTemplate,
  renderFromTemplateTool,
  renderVideoJSONTool,
} from './tools/render.js';
import {
  getTemplateTool,
  handleGetTemplate,
  handleListTemplates,
  listTemplatesTool,
} from './tools/templates.js';

const server = new Server(
  {
    name: 'ilovevideoeditor-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      listTemplatesTool,
      getTemplateTool,
      layerCapabilitiesTool,
      renderVideoJSONTool,
      renderFromTemplateTool,
      getRenderStatusTool,
      getDownloadUrlTool,
      localPreviewTool,
      localCaptureTool,
      localAnalyzeTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'ilovevideoeditor_list_templates': {
        const result = handleListTemplates();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_get_template': {
        const { templateId } = args as { templateId: string };
        const result = handleGetTemplate(templateId);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_get_layer_capabilities': {
        const { layerType, includeMetadata } = args as {
          layerType: LayerType;
          includeMetadata?: boolean;
        };
        const result = handleLayerCapabilities(layerType, includeMetadata);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_render_json': {
        const { videoJSON } = args as { videoJSON: object };
        const result = await handleRenderJSON(
          videoJSON as Record<string, unknown>,
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_render_template': {
        const { templateId, variables } = args as {
          templateId: string;
          variables: object;
        };
        const result = await handleRenderTemplate(templateId, variables);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_get_render_status': {
        const { jobId } = args as { jobId: string };
        const result = await handleGetRenderStatus(jobId);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_get_download_url': {
        const { jobId } = args as { jobId: string };
        const result = await handleGetDownloadUrl(jobId);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_local_preview': {
        const { action, file } = args as { action: string; file?: string };
        const result = await handleLocalPreview({ action, file });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_local_capture': {
        const { time, format } = args as {
          time?: number;
          format?: 'png' | 'jpeg';
        };
        const result = await handleLocalCapture({ time, format });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'ilovevideoeditor_local_analyze': {
        const { time } = args as { time?: number };
        const result = await handleLocalAnalyze({ time });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Diagnostics on stderr so stdout stays pure JSON-RPC
  console.error('iLoveVideoEditor MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error starting MCP server:', err);
  process.exit(1);
});
