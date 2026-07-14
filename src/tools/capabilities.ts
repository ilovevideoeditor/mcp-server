import type { LayerType } from '@ilovevideoeditor/core';
import {
  getEffectMetadata,
  getEffectsForLayerType,
  getTransitionsForLayerType,
  isKnownLayerType,
  TRANSITION_LAYER_COMPATIBILITY,
} from '@ilovevideoeditor/core';

export const layerCapabilitiesTool = {
  name: 'ilovevideoeditor_get_layer_capabilities',
  description:
    'Return the built-in effects and transitions that are compatible with a given layer type (text, image, video, shape, audio, etc.). Use this before choosing effects or transitions for a layer.',
  inputSchema: {
    type: 'object',
    properties: {
      layerType: {
        type: 'string',
        description:
          'Layer type to query: text, image, video, shape, audio, captions, composition, group, empty',
      },
      includeMetadata: {
        type: 'boolean',
        description: 'When true, include labels, notes and recommended flags.',
      },
    },
    required: ['layerType'],
  },
};

export function handleLayerCapabilities(
  layerType: LayerType,
  includeMetadata = false,
) {
  if (!isKnownLayerType(layerType)) {
    throw new Error(
      `Unknown layer type "${layerType}". Valid types: text, image, video, shape, audio, captions, composition, group, empty.`,
    );
  }

  const effects = getEffectsForLayerType(layerType).map((name) => {
    if (!includeMetadata) return name;
    const meta = getEffectMetadata(name);
    return {
      name,
      label: meta?.label ?? name,
      recommended: meta?.recommended ?? false,
      notes: meta?.notes,
    };
  });

  const transitions = getTransitionsForLayerType(layerType).map((name) => {
    if (!includeMetadata) return name;
    const compat = TRANSITION_LAYER_COMPATIBILITY[name];
    return {
      name,
      category: compat?.category,
      notes: compat?.notes,
    };
  });

  return {
    layerType,
    effects,
    transitions,
  };
}
