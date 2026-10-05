import { scannedComponentSchemas } from './pages/components/index.js';
import { draftPrimitives } from '@draft/primitives/index.js';
import { draftPatterns } from '@draft/patterns/index.js';
import {
  standardFrameSchema,
  matrixFrameSchema,
  interactionFrameSchema
} from '@draft/special/catalogue/patterns/index.js';
import shellSchema from '@draft/special/catalogue/shell-layout/schema.json';

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
  // 1. Components (directly synchronized with scannedComponentSchemas from components page)
  const componentItems = scannedComponentSchemas.map(s => ({
    label: formatTitle(s),
    href: `#${s.id}`
  }));

  // 2. Primitives
  const primitiveSchemas = Object.values(draftPrimitives);

  // 3. Patterns
  const patternSchemas = Object.values(draftPatterns);

  // 4. Specials
  const specialDraftSchemas = [standardFrameSchema, matrixFrameSchema, interactionFrameSchema];

  return {
    components: {
      draft: componentItems,
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
