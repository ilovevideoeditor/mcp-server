import { type ChildProcess, spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ILoveVideoEditor } from '@ilovevideoeditor/core';
import type { VideoJSON } from '@ilovevideoeditor/core/types';
import { type Browser, chromium, type Page } from 'playwright-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '../../../..');
const previewDir = resolve(rootDir, 'apps/preview');
const previewTarget = resolve(previewDir, 'src/preview.ts');
const previewUrl = 'http://localhost:5176';

let viteProcess: ChildProcess | null = null;
let browser: Browser | null = null;
let page: Page | null = null;

async function installPreviewSource(filePath: string) {
  const absoluteInput = resolve(rootDir, filePath);
  const content = await readFile(absoluteInput, 'utf8');
  await mkdir(dirname(previewTarget), { recursive: true });
  await writeFile(previewTarget, content, 'utf8');
  return relative(rootDir, absoluteInput);
}

export async function startLocalPreview(filePath?: string): Promise<{
  status: string;
  url: string;
  source?: string;
}> {
  if (filePath) {
    const source = await installPreviewSource(filePath);
    if (viteProcess) {
      // Already running; Vite HMR will pick up the new preview.ts content.
      return { status: 'running', url: previewUrl, source };
    }
  }

  if (viteProcess) {
    return { status: 'running', url: previewUrl };
  }

  return new Promise((resolvePromise, reject) => {
    const proc = spawn(
      'npm',
      ['run', 'dev', '-w', '@ilovevideoeditor/preview'],
      {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        detached: true,
      },
    );

    viteProcess = proc;

    let stdout = '';
    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
      if (stdout.includes(previewUrl) || stdout.includes('Local:')) {
        resolvePromise({
          status: 'started',
          url: previewUrl,
          source: filePath
            ? relative(rootDir, resolve(rootDir, filePath))
            : undefined,
        });
      }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      // Vite prints HMR updates and other info to stderr; only reject on fatal errors.
      if (text.includes('error') && !viteProcess) {
        reject(new Error(text));
      }
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      viteProcess = null;
      if (code && code !== 0) {
        reject(new Error(`Vite dev server exited with code ${code}`));
      }
    });

    // Failsafe: resolve after a few seconds even if we missed the ready signal.
    setTimeout(() => {
      resolvePromise({
        status: 'started',
        url: previewUrl,
        source: filePath
          ? relative(rootDir, resolve(rootDir, filePath))
          : undefined,
      });
    }, 4000);
  });
}

export async function stopLocalPreview(): Promise<{ status: string }> {
  if (page) {
    await page.close().catch(() => {});
    page = null;
  }
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
  if (viteProcess) {
    try {
      // Kill the entire process group spawned via shell.
      process.kill(-viteProcess.pid!, 'SIGTERM');
    } catch {
      viteProcess.kill('SIGTERM');
    }
    viteProcess = null;
  }
  return { status: 'stopped' };
}

async function ensureBrowser(): Promise<Page> {
  if (page && !page.isClosed()) return page;

  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  page = await ctx.newPage();
  await page.goto(previewUrl, { waitUntil: 'networkidle' });
  return page;
}

export async function captureLocalFrame(options: {
  time?: number;
  format?: 'png' | 'jpeg';
  fullPage?: boolean;
}): Promise<{ imageBase64: string; width: number; height: number }> {
  await startLocalPreview();
  const p = await ensureBrowser();

  if (typeof options.time === 'number' && Number.isFinite(options.time)) {
    await p.evaluate((timeSec: number) => {
      const g = globalThis as PreviewGlobal;
      const renderer = g.__previewRenderer;
      if (renderer) {
        renderer.seek(Math.round(timeSec * renderer.fps));
      }
    }, options.time);
    // Wait for fonts/animations to settle.
    await p.waitForTimeout(300);
  } else {
    await p.waitForTimeout(300);
  }

  const screenshot = await p.screenshot({
    type: options.format ?? 'png',
    fullPage: options.fullPage ?? false,
  });

  const imageBase64 = Buffer.from(screenshot).toString('base64');
  const viewport = p.viewportSize();
  return {
    imageBase64,
    width: viewport?.width ?? 0,
    height: viewport?.height ?? 0,
  };
}

export function resolveVideoJSON(mod: {
  video?: ILoveVideoEditor;
  videoJSON?: VideoJSON;
  default?: VideoJSON | ILoveVideoEditor;
}): Promise<VideoJSON> {
  if (mod.video instanceof ILoveVideoEditor) {
    return mod.video.compile();
  }
  if (mod.videoJSON) {
    return Promise.resolve(mod.videoJSON);
  }
  if (mod.default instanceof ILoveVideoEditor) {
    return mod.default.compile();
  }
  if (mod.default) {
    return Promise.resolve(mod.default as VideoJSON);
  }
  throw new Error(
    'Preview module must export `video` (ILoveVideoEditor), `videoJSON` (VideoJSON), or a default.',
  );
}

export const localPreviewTool = {
  name: 'ilovevideoeditor_local_preview',
  description:
    'Start or stop the local preview dev server. Use this before capturing frames.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start', 'stop', 'status'],
        description: 'Action to perform on the local preview server.',
      },
      file: {
        type: 'string',
        description:
          'Path to a TypeScript preview file to load. Required for start.',
      },
    },
    required: ['action'],
  },
};

export const localCaptureTool = {
  name: 'ilovevideoeditor_local_capture',
  description:
    'Capture a screenshot from the running local preview at a given time.',
  inputSchema: {
    type: 'object',
    properties: {
      time: {
        type: 'number',
        description: 'Time in seconds to capture. Defaults to current frame.',
      },
      format: {
        type: 'string',
        enum: ['png', 'jpeg'],
        description: 'Image format.',
      },
    },
  },
};

export const localAnalyzeTool = {
  name: 'ilovevideoeditor_local_analyze',
  description:
    'Analyze the generated VideoJSON layout in the local preview and return structured metrics and issues (overflow, overlap, font fallback, etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      time: {
        type: 'number',
        description: 'Time in seconds to analyze. Defaults to current frame.',
      },
    },
  },
};

export async function handleLocalPreview(args: {
  action: string;
  file?: string;
}): Promise<Record<string, unknown>> {
  switch (args.action) {
    case 'start':
      return startLocalPreview(args.file);
    case 'stop':
      return stopLocalPreview();
    case 'status':
      return {
        status: viteProcess ? 'running' : 'stopped',
        url: previewUrl,
      };
    default:
      throw new Error(`Unknown action: ${args.action}`);
  }
}

export async function handleLocalCapture(args: {
  time?: number;
  format?: 'png' | 'jpeg';
}): Promise<Record<string, unknown>> {
  return captureLocalFrame(args);
}

interface LayoutReport {
  canvas: { width: number; height: number };
  frame: number;
  layers: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    metrics?:
      | {
          kind: 'text';
          text: string;
          requestedFont: string;
          computedFont: string;
          fontLoaded: boolean;
          fontSizePx: number;
          lineHeightPx: number;
          estimatedLines: number;
          charCount: number;
          boxWidth: number;
          boxHeight: number;
        }
      | {
          kind: 'shape';
          shapeType: string;
          fill: string | undefined;
          strokeColor: string | undefined;
          strokeWidth: number;
          strokeAlignment: string | undefined;
          svgBBox: {
            x: number;
            y: number;
            width: number;
            height: number;
          } | null;
          visualWidth: number;
          visualHeight: number;
          padding: {
            top: number;
            right: number;
            bottom: number;
            left: number;
          };
        };
  }>;
  issues: Array<{
    type: string;
    severity: string;
    layerId: string;
    message: string;
    suggestion: string;
  }>;
  summary: {
    totalLayers: number;
    visibleLayers: number;
    errorCount: number;
    warningCount: number;
  };
}

type PreviewGlobal = typeof globalThis & {
  __previewRenderer?: { seek: (frame: number) => Promise<void>; fps: number };
  __previewAnalysis?: { measureLayout: () => LayoutReport };
};

export async function analyzeLocalLayout(options: {
  time?: number;
}): Promise<LayoutReport> {
  await startLocalPreview();
  const p = await ensureBrowser();

  if (typeof options.time === 'number' && Number.isFinite(options.time)) {
    await p.evaluate((timeSec: number) => {
      const g = globalThis as PreviewGlobal;
      const renderer = g.__previewRenderer;
      if (renderer) {
        renderer.seek(Math.round(timeSec * renderer.fps));
      }
    }, options.time);
    await p.waitForTimeout(300);
  } else {
    await p.waitForTimeout(300);
  }

  return p.evaluate(() => {
    const g = globalThis as PreviewGlobal;
    const analysis = g.__previewAnalysis;
    if (!analysis) {
      throw new Error(
        'Preview analysis not ready. Wait for the preview to load.',
      );
    }
    return analysis.measureLayout();
  });
}

export async function handleLocalAnalyze(args: {
  time?: number;
}): Promise<LayoutReport> {
  return analyzeLocalLayout(args);
}
