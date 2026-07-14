import type { VideoJSON } from '@ilovevideoeditor/core';
import { type ApologyVariables, buildApology } from './apology.js';
import { buildGoodMorning, type GoodMorningVariables } from './goodMorning.js';
import {
  buildMemoryMontage,
  type MemoryMontageVariables,
} from './memoryMontage.js';

export type TemplateId =
  | 'lovable_good_morning'
  | 'lovable_apology'
  | 'lovable_memory_montage';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  variablesSchema: Record<string, unknown>;
}

export const templateDefinitions: TemplateDefinition[] = [
  {
    id: 'lovable_good_morning',
    name: 'Good Morning',
    description:
      'A warm morning greeting with companion photo and personalized message.',
    variablesSchema: {
      companionName: { type: 'string', required: true },
      userName: { type: 'string', required: true },
      dayNumber: { type: 'number', required: false },
      message: { type: 'string', required: false },
      backgroundImage: { type: 'string', format: 'url', required: false },
      companionPhoto: { type: 'string', format: 'url', required: false },
    },
  },
  {
    id: 'lovable_apology',
    name: 'Apology',
    description: 'A sincere (or playful) apology video from the companion.',
    variablesSchema: {
      companionName: { type: 'string', required: true },
      userName: { type: 'string', required: true },
      message: { type: 'string', required: false },
      mood: {
        type: 'string',
        enum: ['sincere', 'playful', 'dramatic'],
        required: false,
      },
      backgroundImage: { type: 'string', format: 'url', required: false },
      companionPhoto: { type: 'string', format: 'url', required: false },
    },
  },
  {
    id: 'lovable_memory_montage',
    name: 'Memory Montage',
    description: 'A photo montage celebrating a milestone or occasion.',
    variablesSchema: {
      companionName: { type: 'string', required: true },
      userName: { type: 'string', required: true },
      occasion: { type: 'string', required: true },
      photos: {
        type: 'array',
        items: { type: 'string', format: 'url' },
        required: true,
      },
      caption: { type: 'string', required: false },
    },
  },
];

export async function compileTemplate(
  id: TemplateId,
  variables: unknown,
): Promise<VideoJSON> {
  switch (id) {
    case 'lovable_good_morning':
      return buildGoodMorning(variables as GoodMorningVariables);
    case 'lovable_apology':
      return buildApology(variables as ApologyVariables);
    case 'lovable_memory_montage':
      return buildMemoryMontage(variables as MemoryMontageVariables);
    default:
      throw new Error(`Unknown template: ${id}`);
  }
}

export type { ApologyVariables, GoodMorningVariables, MemoryMontageVariables };
export { buildApology, buildGoodMorning, buildMemoryMontage };
