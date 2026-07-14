import { templateDefinitions } from './builder.js';

export interface TemplateTool {
  name: string;
  description: string;
  inputSchema: object;
}

export const listTemplatesTool: TemplateTool = {
  name: 'ilovevideoeditor_list_templates',
  description:
    'List all available iLoveVideoEditor templates for generating personalized videos.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getTemplateTool: TemplateTool = {
  name: 'ilovevideoeditor_get_template',
  description:
    'Get detailed information about a specific template, including its variable schema.',
  inputSchema: {
    type: 'object',
    properties: {
      templateId: {
        type: 'string',
        description: 'The template ID (e.g., lovable_good_morning)',
      },
    },
    required: ['templateId'],
  },
};

export function handleListTemplates() {
  return {
    templates: templateDefinitions.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      variables: t.variablesSchema,
    })),
  };
}

export function handleGetTemplate(templateId: string) {
  const tmpl = templateDefinitions.find((t) => t.id === templateId);
  if (!tmpl) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return {
    id: tmpl.id,
    name: tmpl.name,
    description: tmpl.description,
    variables: tmpl.variablesSchema,
  };
}
