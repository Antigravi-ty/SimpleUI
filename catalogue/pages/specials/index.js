import {
  standardFrameSchema,
  matrixFrameSchema,
  interactionFrameSchema,
  getSchemaBadge
} from '@draft/special/catalogue/patterns/index.js';
import shellSchema from '@draft/special/catalogue/shell-layout/schema.json';
import stagingRules from '../../schemas/staging-rules.json';
import { interpret } from '@src_next/core/slot-resolver.js';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

/**
 * Dynamically scan all draft special schemas via Vite native glob.
 * Enforces strict fail-fast validation (Zero-Tolerance, Zero-Fallback).
 */
export const scanSpecialSchemas = () => {
  const schemaModules = import.meta.glob('@draft/special/catalogue/**/schema.json', { eager: true });
  const schemasMap = new Map();

  for (const [path, mod] of Object.entries(schemaModules)) {
    const schema = mod.default || mod;
    if (!schema || typeof schema !== 'object') {
      throw new Error(`[Schema Violation] Invalid or missing special schema JSON object at "${path}".`);
    }

    const id = schema.id;
    if (!id || typeof id !== 'string') {
      throw new Error(`[Schema Violation] Special schema at "${path}" must define a non-empty string "id".`);
    }

    if (!schema.description || typeof schema.description !== 'string') {
      throw new Error(`[Schema Violation] Special schema "${id}" at "${path}" must provide a valid "description" string.`);
    }

    if (schemasMap.has(id)) {
      throw new Error(`[Schema Violation] Duplicate special schema id "${id}" detected at "${path}". Conflict must be resolved.`);
    }
    schemasMap.set(id, schema);
  }

  // Canonical ordering
  const CANONICAL_ORDER = [
    standardFrameSchema.id,
    matrixFrameSchema.id,
    interactionFrameSchema.id,
    shellSchema.id
  ];

  const ordered = [];
  for (const cid of CANONICAL_ORDER) {
    if (!schemasMap.has(cid)) {
      throw new Error(`[Catalogue Fail-Fast] Required canonical special schema "${cid}" missing from disk.`);
    }
    ordered.push(schemasMap.get(cid));
  }

  // Append any extra schemas discovered
  for (const [id, schema] of schemasMap.entries()) {
    if (!CANONICAL_ORDER.includes(id)) {
      ordered.push(schema);
    }
  }

  return ordered;
};

export const scannedSpecialSchemas = scanSpecialSchemas();

/**
 * Stage 1: Standard Frame Spec (Showcased via Interaction Frame with real-time optional toggles)
 */
function createStandardFrameExhibit(schema) {
  const container = document.createElement('div');
  container.style.cssText = 'max-width: 680px; width: 100%;';

  const state = {
    showRefLink: true,
    showFlush: false,
    showFooter: true
  };

  const getSampleSpec = (s) => ({
    pattern: 'standard-frame',
    title: 'Title',
    badge: getSchemaBadge(schema),
    description: 'Relative description',
    hasRedirectReference: s.showRefLink,
    redirectLink: s.showRefLink ? {
      toSee: '[Relative Component]',
      checkText: '[Relative Documentation]',
      prefixText: 'Optional: To see [Relative Component], check '
    } : null,
    wellPadding: s.showFlush ? 'none' : 'normal',
    stageContent: {
      type: 'box',
      attributes: {
        style: 'padding: var(--ui-space-6); background: var(--ui-bg-surface); border: 1px dashed var(--ui-border-subtle); border-radius: var(--ui-radius-md); text-align: center; color: var(--ui-text-muted); font-size: var(--ui-font-sm);'
      },
      text: s.showFlush ? 'Custom content (Flush edge well)' : 'Custom content'
    },
    hasFooter: s.showFooter,
    footerText: s.showFooter ? 'Optional: Relative description' : null
  });

  const update = () => {
    container.replaceChildren(interpret(getSampleSpec(state)));
  };
  update();

  return {
    pattern: 'interaction-frame',
    id: schema.id,
    title: schema.title || 'Standard Frame',
    badge: getSchemaBadge(schema),
    status: schema.status || 'draft',
    description: schema.description,
    hasRedirectReference: true,
    redirectLink: {
      toSee: '2D Matrix Frame',
      checkText: 'documentation',
      url: '#' + matrixFrameSchema.id
    },
    controls: [
      {
        block: 'checkbox',
        id: 'ctrl-standard-ref',
        props: {
          label: 'Optional: Reference Link',
          size: 'sm',
          modifier: 'neutral',
          checked: state.showRefLink,
          onChange: (checked) => {
            state.showRefLink = checked;
            update();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-standard-flush',
        props: {
          label: 'Optional: Flush Edge Well',
          size: 'sm',
          modifier: 'neutral',
          checked: state.showFlush,
          onChange: (checked) => {
            state.showFlush = checked;
            update();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-standard-footer',
        props: {
          label: 'Optional: Footer Slot',
          size: 'sm',
          modifier: 'neutral',
          checked: state.showFooter,
          onChange: (checked) => {
            state.showFooter = checked;
            update();
          }
        }
      }
    ],
    stageContent: container,
    footerText: 'Header • Well (Standard / Flush) • (optional)Footer'
  };
}

/**
 * Stage 2: 2D Matrix Frame Spec
 */
function createMatrixFrameExhibit(schema) {
  const container = document.createElement('div');
  container.style.cssText = 'max-width: 680px; width: 100%;';

  const state = {
    showRefLink: true,
    showFilter: true,
    showLens: true
  };

  const getSampleSpec = (s) => ({
    pattern: 'matrix-frame',
    title: 'Title',
    badge: getSchemaBadge(schema),
    description: 'Relative description',
    hasRedirectReference: s.showRefLink,
    redirectLink: s.showRefLink ? {
      toSee: '[Relative Component]',
      checkText: '[Relative Documentation]',
      prefixText: 'Optional: To see [Relative Component], check '
    } : null,
    hasFilterBar: s.showFilter,
    haveFilterBar: s.showFilter,
    hasVariantDimensions: s.showLens,
    haveVariantDimensions: s.showLens,
    variantDimensions: {
      mode: {
        label: 'Mode',
        default: 'a',
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' }
        ]
      }
    },
    columns: ['Neutral', 'Primary', 'Success'],
    rows: ['sm', 'md'],
    renderCell: (size, mod) => ({
      type: 'box',
      attributes: {
        style: 'padding: var(--ui-space-2); font-size: var(--ui-font-xs); color: var(--ui-text-muted); text-align: center; background: var(--ui-bg-surface); border-radius: var(--ui-radius-sm); border: 1px solid var(--ui-border-subtle);'
      },
      text: `${size}-${mod}`
    })
  });

  const update = () => {
    container.replaceChildren(interpret(getSampleSpec(state)));
  };
  update();

  return {
    pattern: 'interaction-frame',
    id: schema.id,
    title: schema.title || '2D Matrix Frame',
    badge: getSchemaBadge(schema),
    status: schema.status || 'draft',
    description: schema.description,
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Interactive Frame',
      checkText: 'documentation',
      url: '#' + interactionFrameSchema.id
    },
    controls: [
      {
        block: 'checkbox',
        id: 'ctrl-matrix-ref',
        props: {
          label: 'Optional: Reference Link',
          size: 'sm',
          modifier: 'neutral',
          checked: state.showRefLink,
          onChange: (checked) => {
            state.showRefLink = checked;
            update();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-matrix-filter',
        props: {
          label: 'Optional: Filter Bar',
          size: 'sm',
          modifier: 'neutral',
          checked: state.showFilter,
          onChange: (checked) => {
            state.showFilter = checked;
            update();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-matrix-lens',
        props: {
          label: 'Optional: Lens Bar',
          size: 'sm',
          modifier: 'neutral',
          checked: state.showLens,
          onChange: (checked) => {
            state.showLens = checked;
            update();
          }
        }
      }
    ],
    stageContent: container,
    footerText: 'Header • Appearance Filter • Dimension Lens • 2D Table Matrix'
  };
}

/**
 * Stage 3: Interactive Staging Frame Spec
 */
function createInteractionFrameExhibit(schema) {
  return {
    pattern: 'interaction-frame',
    id: schema.id,
    title: schema.title || 'Interactive Frame',
    badge: getSchemaBadge(schema),
    status: schema.status || 'draft',
    description: schema.description,
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Catalogue Shell Layout',
      checkText: 'documentation',
      url: '#' + shellSchema.id
    },
    controls: {
      type: 'row',
      className: 'sp-cata-hero__btn-group',
      attributes: { style: 'display: flex; gap: var(--ui-space-3);' },
      children: [
        {
          block: 'button',
          props: {
            text: 'Catalogue Special',
            size: 'sm',
            modifier: 'primary',
            className: 'sp-cata-hero__btn'
          }
        },
        {
          block: 'button',
          props: {
            text: 'Documentation',
            size: 'sm',
            modifier: 'neutral',
            className: 'sp-cata-hero__btn'
          }
        }
      ]
    },
    stageContent: {
      type: 'box',
      className: 'sp-cata-hero__preview',
      attributes: {
        style: 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ui-space-3); padding: var(--ui-space-8); min-height: 160px; background: var(--ui-bg-surface); border: 1px dashed var(--ui-border-subtle); border-radius: var(--ui-radius-md); text-align: center;'
      },
      children: [
        {
          tag: 'p',
          attributes: { style: 'margin: 0; font-size: var(--ui-font-sm); color: var(--ui-text-muted);' },
          text: 'Interactive Canvas Slot - Controls in header directly orchestrate this preview stage.'
        },
        {
          block: 'checkbox',
          props: {
            label: 'Nested Live Option (Checked)',
            size: 'sm',
            modifier: 'neutral',
            checked: true,
            attributes: { style: 'user-select: none;' }
          }
        }
      ]
    },
    footerText: 'Header with Live Controls • Dynamic Interactive Stage Canvas • Context Footer'
  };
}

/**
 * Stage 4: Catalogue Shell Layout
 * Standard Frame with wellPadding: 'none', mounted with stripDuplicateIds: true.
 * Pure declarative Spec with zero closures.
 */
function createShellLayoutExhibit(schema) {
  const frameType = stagingRules.overrides[schema.id]?.frame || 'standard-frame';
  const wellPadding = stagingRules.overrides[schema.id]?.wellPadding || 'none';
  const preventDefault = stagingRules.overrides[schema.id]?.preventDefault ?? true;

  return {
    pattern: frameType,
    props: {
      id: schema.id,
      title: schema.title || 'Catalogue Shell Layout',
      badge: getSchemaBadge(schema),
      status: schema.status || 'draft',
      description: schema.description,
      hasRedirectReference: true,
      redirectLink: {
        toSee: 'Standard Staging Frame',
        checkText: 'documentation',
        url: '#' + standardFrameSchema.id
      },
      wellPadding,
      preventDefault,
      stripDuplicateIds: true,
      stageContent: {
        pattern: 'catalogue-shell-layout',
        props: {
          isRoot: false,
          stripDuplicateIds: true,
          sidebarItems: {
            draft: [{ label: 'Matrix Frame', href: '#' + matrixFrameSchema.id, active: true }],
            core: [{ label: 'Overview', href: '#' }],
            special: [{ label: 'Interaction Frame', href: '#' + interactionFrameSchema.id }]
          }
        }
      },
      footerText: 'Header (56px) • 3-Tier Sidebar • Embedded Canvas Sandbox'
    }
  };
}

/**
 * Maps any scanned special schema to its corresponding declarative frame spec
 */
export function createSpecialFrameSpec(schema) {
  if (schema.id === standardFrameSchema.id) {
    return createStandardFrameExhibit(schema);
  }
  if (schema.id === matrixFrameSchema.id) {
    return createMatrixFrameExhibit(schema);
  }
  if (schema.id === interactionFrameSchema.id) {
    return createInteractionFrameExhibit(schema);
  }
  if (schema.id === shellSchema.id) {
    return createShellLayoutExhibit(schema);
  }

  // Fallback for dynamically auto-discovered specials
  const defaultFrame = stagingRules.defaultFrames.specials || 'standard-frame';
  return {
    pattern: stagingRules.overrides[schema.id]?.frame || defaultFrame,
    id: schema.id,
    title: schema.title || schema.name || schema.block,
    badge: getSchemaBadge(schema),
    status: schema.status || 'draft',
    description: schema.description,
    wellPadding: stagingRules.overrides[schema.id]?.wellPadding || 'normal',
    preventDefault: stagingRules.overrides[schema.id]?.preventDefault ?? false,
    stageContent: {
      pattern: 'center-placeholder',
      content: `${schema.title || schema.id} Preview`
    },
    footerText: `${schema.title || schema.id} • Dynamic Auto-Discovered Staging`
  };
}

export const specialsPageSpec = {
  type: 'container',
  className: 'catalogue-page catalogue-page--specials',
  attributes: {
    style: 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;'
  },
  children: scannedSpecialSchemas.map(createSpecialFrameSpec)
};

export function renderSpecialsPage() {
  return interpret(specialsPageSpec);
}
