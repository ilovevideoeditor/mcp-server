import { z } from 'zod';
import { templateDefinitions } from '../templates/lovable/index.js';

const templateIds = new Set<string>(templateDefinitions.map((t) => t.id));

export const templateIdSchema = z
  .string()
  .min(1)
  .refine((id) => templateIds.has(id), {
    message: `templateId must be one of: ${[...templateIds].join(', ')}`,
  });

export const videoJSONSchema = z.record(z.string(), z.unknown());

export const jobIdSchema = z.string().uuid();

export const listTemplatesArgsSchema = z.object({});

export const getTemplateArgsSchema = z.object({
  templateId: templateIdSchema,
});

export const renderJSONArgsSchema = z.object({
  videoJSON: videoJSONSchema,
});

export const renderTemplateArgsSchema = z.object({
  templateId: templateIdSchema,
  variables: z.record(z.string(), z.unknown()).default({}),
});

export const getRenderStatusArgsSchema = z.object({
  jobId: jobIdSchema,
});

export const getDownloadUrlArgsSchema = z.object({
  jobId: jobIdSchema,
});
