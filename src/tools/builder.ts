import type { VideoJSON } from '@ilovevideoeditor/core';
import {
  compileTemplate,
  type TemplateId,
  templateDefinitions,
} from '../templates/lovable/index.js';

export type { TemplateId };
export { compileTemplate, templateDefinitions };

export interface CompiledVideo {
  videoJSON: VideoJSON;
  templateId: TemplateId;
}

export async function buildFromTemplate(
  templateId: TemplateId,
  variables: unknown,
): Promise<CompiledVideo> {
  const videoJSON = await compileTemplate(templateId, variables);
  return { videoJSON, templateId };
}
