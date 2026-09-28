import { draftComponents } from '@draft/components/index.js';
import { draftPrimitives } from '@draft/primitives/index.js';
import { draftPatterns } from '@draft/patterns/index.js';
import {
  standardFrameSchema,
  matrixFrameSchema,
  interactionFrameSchema
} from '@draft/special/catalogue/patterns/index.js';
import shellSchema from '@draft/special/catalogue/shell-layout/schema.json';

const ARCHETYPE_ORDER = {
  action: 1,
  control: 2,
  selection: 3,
  'value-input': 4,
  feedback: 5,
  navigation: 6,
  structure: 7
};

function getArchetypePriority(schema) {
  const arc = schema.archetype || 'other';
  return ARCHETYPE_ORDER[arc] || 99;
}

function sortSchemas(schemas) {
  return [...schemas].sort((a, b) => {
    const prioA = getArchetypePriority(a);
    const prioB = getArchetypePriority(b);
    if (prioA !== prioB) return prioA - prioB;
    const nameA = a.title || a.name || a.block || '';
    const nameB = b.title || b.name || b.block || '';
    return nameA.localeCompare(nameB);
  });
}

function formatTitle(schema) {
  if (schema.title) return schema.title;
  const raw = schema.name || schema.block || '';
  return raw
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Dynamically builds 3-tier sidebar structure for all catalogue pages from exported schemas
 */
export function buildCatalogueSidebars() {
  // 1. Components (sorted by archetype priority, then alphabetical)
  const componentSchemas = Object.values(draftComponents).map(c => c.schema);
  const sortedComponents = sortSchemas(componentSchemas);

  // 2. Primitives
  const primitiveSchemas = Object.values(draftPrimitives);

  // 3. Patterns
  const patternSchemas = Object.values(draftPatterns);

  // 4. Specials
  const specialDraftSchemas = [standardFrameSchema, matrixFrameSchema, interactionFrameSchema];

  return {
    components: {
      draft: sortedComponents.map(s => ({ label: formatTitle(s), href: `#${s.id}` })),
      core: [],
      special: []
    },
    primitives: {
      draft: primitiveSchemas.map(s => ({ label: formatTitle(s), href: `#${s.id}` })),
      core: [],
      special: []
    },
    patterns: {
      draft: patternSchemas.map(s => ({ label: formatTitle(s), href: `#${s.id}` })),
      core: [],
      special: []
    },
    animations: {
      draft: [],
      core: [],
      special: []
    },
    specials: {
      draft: specialDraftSchemas.map(s => ({ label: formatTitle(s), href: `#${s.id}` })),
      core: [],
      special: [
        { label: formatTitle(shellSchema), href: `#${shellSchema.id}` }
      ]
    }
  };
}
