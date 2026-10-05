import { getSchemaBadge } from '@draft/special/catalogue/patterns/helpers.js';
import { interpret } from '@src_next/core/slot-resolver.js';
import stagingRules from '../../schemas/staging-rules.json';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

export const ARCHETYPE_ORDER = {
  action: 1,
  control: 2,
  selection: 3,
  'value-input': 4,
  feedback: 5,
  navigation: 6,
  structure: 7
};

/**
 * Scan all draft component schemas dynamically via Vite native glob.
 * Enforces strict fail-fast validation (Zero-Tolerance, Zero-Fallback).
 */
export const scanComponentSchemas = () => {
  const schemaModules = import.meta.glob('@draft/components/*/schema.json', { eager: true });
  const schemas = [];
  const registeredBlocks = new Set();

  for (const [path, mod] of Object.entries(schemaModules)) {
    const schema = mod.default || mod;
    if (!schema || typeof schema !== 'object') {
      throw new Error(`[Schema Violation] Invalid or missing schema JSON object at "${path}".`);
    }

    const block = schema.block || schema.name;
    if (!block || typeof block !== 'string') {
      throw new Error(`[Schema Violation] Component schema at "${path}" must define a non-empty string "block" or "name".`);
    }

    if (registeredBlocks.has(block)) {
      throw new Error(`[Schema Violation] Duplicate component block "${block}" detected at "${path}". Conflict must be resolved.`);
    }
    registeredBlocks.add(block);

    if (!Array.isArray(schema.sizes) || schema.sizes.length === 0) {
      throw new Error(`[Schema Violation] Component "${block}" at "${path}" must declare a non-empty "sizes" array.`);
    }

    if (!Array.isArray(schema.modifiers) || schema.modifiers.length === 0) {
      throw new Error(`[Schema Violation] Component "${block}" at "${path}" must declare a non-empty "modifiers" array.`);
    }

    if (!schema.description || typeof schema.description !== 'string') {
      throw new Error(`[Schema Violation] Component "${block}" at "${path}" must provide a valid descriptive "description" string.`);
    }

    schemas.push(schema);
  }

  // Sort components by canonical archetype priority, then alphabetical by title/block
  return schemas.sort((a, b) => {
    const prioA = ARCHETYPE_ORDER[a.archetype || 'other'] || 99;
    const prioB = ARCHETYPE_ORDER[b.archetype || 'other'] || 99;
    if (prioA !== prioB) return prioA - prioB;
    const nameA = a.title || a.name || a.block;
    const nameB = b.title || b.name || b.block;
    return nameA.localeCompare(nameB);
  });
};

/**
 * Derive modifier column list from schema definition, ensuring state modifiers like disabled are included
 */
const deriveColumns = (schema) => {
  const mods = schema.modifiers ? schema.modifiers.filter(m => m !== 'open') : ['neutral'];
  const hasDisabled = Boolean(schema.props?.disabled);
  if (hasDisabled && !mods.includes('disabled')) {
    mods.push('disabled');
  }
  return mods;
};

/**
 * Generate pure declarative Matrix Frame Spec for a component schema.
 * Zero JavaScript closures or ad-hoc render functions.
 */
const createComponentMatrixSpec = (schema) => {
  const block = schema.block || schema.name;
  const frameType = stagingRules.overrides[schema.id]?.frame || stagingRules.defaultFrames.components || 'matrix-frame';
  return {
    pattern: frameType,
    props: {
      id: schema.id || `draft-ui-${block}`,
      title: schema.title || schema.name || block,
      badge: getSchemaBadge(schema),
      status: schema.status || 'draft',
      description: schema.description,
      variants: schema.variants || schema.variantDimensions,
      columns: deriveColumns(schema),
      rows: schema.sizes || ['sm', 'md', 'lg'],
      block,
      schema
    }
  };
};

// Build page spec from automatically scanned and validated components
export const scannedComponentSchemas = scanComponentSchemas();

export const componentsPageSpec = {
  type: 'container',
  className: 'catalogue-page catalogue-page--components',
  attributes: {
    style: 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;'
  },
  children: scannedComponentSchemas.map(createComponentMatrixSpec)
};

export function renderComponentsPage() {
  return interpret(componentsPageSpec);
}
