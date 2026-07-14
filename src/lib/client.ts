import type { VideoJSON } from '@ilovevideoeditor/core';

export interface ILoveVideoEditorClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface QueuedRender {
  jobId: string;
  status: string;
}

export interface RenderStatus {
  jobId: string;
  status: 'pending' | 'rendering' | 'completed' | 'failed';
  progress: number;
  url: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface RefreshUrlResponse {
  downloadUrl: string;
  expiresInSeconds: number;
}

export class iLoveVideoEditorApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ILoveVideoEditorClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error');
      throw new Error(`iLoveVideoEditor API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async queueRender(videoJSON: VideoJSON): Promise<QueuedRender> {
    return this.request<QueuedRender>('POST', '/v1/render', { videoJSON });
  }

  async getRenderStatus(jobId: string): Promise<RenderStatus> {
    return this.request<RenderStatus>('GET', `/v1/render/${jobId}`);
  }

  async refreshDownloadUrl(jobId: string): Promise<RefreshUrlResponse> {
    return this.request<RefreshUrlResponse>(
      'POST',
      `/v1/render/${jobId}/refresh-url`,
    );
  }
}

export function createClientFromEnv(): iLoveVideoEditorApiClient {
  const baseUrl =
    process.env.VF_API_BASE_URL ?? 'https://api.ilovevideoeditor.com';
  const apiKey = process.env.VF_API_KEY;

  if (!apiKey) {
    throw new Error(
      'VF_API_KEY environment variable is required. Set it to your iLoveVideoEditor API key.',
    );
  }

  return new iLoveVideoEditorApiClient({ baseUrl, apiKey });
}
