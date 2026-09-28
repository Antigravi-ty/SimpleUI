import { getSchemaBadge } from '@draft/special/catalogue/patterns/helpers.js';
import { interpret } from '@src_next/core/slot-resolver.js';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

const ARCHETYPE_ORDER = {
  action: 1,
  selection: 2,
  input: 3,
  indicator: 4,
  display: 5,
  navigation: 6,
  structure: 7
};

const starSvg = '<svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

/**
 * Scan all draft component schemas dynamically via Vite native glob.
 * Enforces strict fail-fast validation (Zero-Tolerance, Zero-Fallback).
 */
const scanComponentSchemas = () => {
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
 * Pure semantic cell resolution derived dynamically from schema conventions
 */
const deriveCellSpec = (schema, size, mod, idx, variantState = {}) => {
  const block = schema.block || schema.name;
  const isDisabled = mod === 'disabled';
  const activeMod = isDisabled ? 'neutral' : mod;
  const contentMode = variantState?.content || 'text';

  const defaultText = schema.elements?.[0]?.defaultText || schema.props?.triggerText?.default || schema.props?.label?.default || 'Action';

  const props = {
    size,
    modifier: activeMod,
    disabled: isDisabled,
    ...variantState
  };

  if (schema.collection || block === 'segmented-control') {
    props.items = [
      { value: 'option-1', label: 'Option 1' },
      { value: 'option-2', label: 'Option 2' },
      { value: 'option-3', label: 'Option 3' }
    ];
    props.value = 'option-1';
  } else if (block === 'checkbox') {
    props.checked = true;
    props.label = contentMode === 'standalone' ? '' : `${size.toUpperCase()} Option`;
  } else if (block === 'slider') {
    props.value = 50;
    props.unit = contentMode === 'minimal' ? '' : '%';
  } else {
    if (contentMode === 'icon-only') {
      props.element = 'icon-only';
      props.content = starSvg;
    } else if (contentMode === 'leading-icon') {
      props.content = `${starSvg}<span>${defaultText}</span>`;
    } else if (contentMode === 'trailing-icon') {
      props.content = `<span>${defaultText}</span>${starSvg}`;
    } else if (contentMode === 'dot') {
      props.element = 'dot';
      props.content = 'Active';
    } else if (contentMode === 'pill') {
      props.element = 'pill';
      props.content = '99+';
    } else {
      props.content = isDisabled ? 'Disabled' : `${size.toUpperCase()} ${defaultText}`;
      props.triggerLabel = isDisabled ? 'Disabled' : `${size.toUpperCase()} ${block.charAt(0).toUpperCase() + block.slice(1)}`;
      props.placeholder = `Centered Container Placeholder (${variantState?.align || 'left'})`;
    }
  }

  return {
    block,
    props
  };
};

/**
 * Generate declarative Matrix Frame Spec for a component schema
 */
const createComponentMatrixSpec = (schema) => {
  const block = schema.block || schema.name;
  return {
    pattern: 'matrix-frame',
    props: {
      id: schema.id || `draft-ui-${block}`,
      title: schema.title || schema.name || block,
      badge: getSchemaBadge(schema),
      status: schema.status || 'draft',
      description: schema.description,
      variantDimensions: schema.variantDimensions,
      columns: deriveColumns(schema),
      rows: schema.sizes || ['sm', 'md', 'lg'],
      block,
      renderCell: (size, mod, idx, variantState) => deriveCellSpec(schema, size, mod, idx, variantState)
    }
  };
};

// Build page spec from automatically scanned and validated components
const scannedComponentSchemas = scanComponentSchemas();

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
