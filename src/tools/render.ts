import type { VideoJSON } from '@ilovevideoeditor/core';
import {
  createClientFromEnv,
  type iLoveVideoEditorApiClient,
  type RefreshUrlResponse,
  type RenderStatus,
} from '../lib/client.js';
import { buildFromTemplate, type TemplateId } from './builder.js';

export interface RenderTool {
  name: string;
  description: string;
  inputSchema: object;
}

// Lazy-init client so env vars are read at first use, not import time
let _client: iLoveVideoEditorApiClient | null = null;
function getClient(): iLoveVideoEditorApiClient {
  if (!_client) {
    _client = createClientFromEnv();
  }
  return _client;
}

export const renderVideoJSONTool: RenderTool = {
  name: 'ilovevideoeditor_render_json',
  description:
    'Submit a raw VideoJSON payload to the iLoveVideoEditor render queue and receive a job ID.',
  inputSchema: {
    type: 'object',
    properties: {
      videoJSON: {
        type: 'object',
        description: 'A valid VideoJSON scene definition',
      },
    },
    required: ['videoJSON'],
  },
};

export const renderFromTemplateTool: RenderTool = {
  name: 'ilovevideoeditor_render_template',
  description:
    'Generate a video from a named template with variables, queue it for rendering, and return a job ID.',
  inputSchema: {
    type: 'object',
    properties: {
      templateId: {
        type: 'string',
        description:
          'Template ID (e.g., lovable_good_morning, lovable_apology, lovable_memory_montage)',
      },
      variables: {
        type: 'object',
        description:
          'Template-specific variables (userName, companionName, message, photos, etc.)',
      },
    },
    required: ['templateId', 'variables'],
  },
};

export const getRenderStatusTool: RenderTool = {
  name: 'ilovevideoeditor_get_render_status',
  description: 'Check the status of a render job by its job ID.',
  inputSchema: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description:
          'The render job ID returned by ilovevideoeditor_render_json or ilovevideoeditor_render_template',
      },
    },
    required: ['jobId'],
  },
};

export const getDownloadUrlTool: RenderTool = {
  name: 'ilovevideoeditor_get_download_url',
  description: 'Get a fresh signed download URL for a completed render job.',
  inputSchema: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'Completed render job ID',
      },
    },
    required: ['jobId'],
  },
};

export async function handleRenderJSON(videoJSON: object) {
  const client = getClient();
  const result = await client.queueRender(videoJSON as VideoJSON);
  return {
    jobId: result.jobId,
    status: result.status,
    message: 'Render job queued successfully.',
  };
}

export async function handleRenderTemplate(
  templateId: string,
  variables: unknown,
) {
  const { videoJSON } = await buildFromTemplate(
    templateId as TemplateId,
    variables,
  );
  return handleRenderJSON(videoJSON);
}

export async function handleGetRenderStatus(jobId: string) {
  const client = getClient();
  const status: RenderStatus = await client.getRenderStatus(jobId);
  return {
    jobId: status.jobId,
    status: status.status,
    progress: status.progress,
    url: status.url,
    error: status.error,
    createdAt: status.createdAt,
    completedAt: status.completedAt,
  };
}

export async function handleGetDownloadUrl(jobId: string) {
  const client = getClient();
  const result: RefreshUrlResponse = await client.refreshDownloadUrl(jobId);
  return {
    jobId: jobId,
    downloadUrl: result.downloadUrl,
    expiresInSeconds: result.expiresInSeconds,
  };
}
