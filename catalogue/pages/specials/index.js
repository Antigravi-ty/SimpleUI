import {
  standardFrameSchema,
  matrixFrameSchema,
  interactionFrameSchema,
  getSchemaBadge
} from '@draft/special/catalogue/patterns/index.js';
import { CatalogueShellLayout } from '@draft/special/catalogue/shell-layout/index.js';
import shellSchema from '@draft/special/catalogue/shell-layout/schema.json';
import stagingRules from '../../schemas/staging-rules.json';
import { interpret } from '@src_next/core/slot-resolver.js';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

/**
 * Dynamically scan all draft special schemas via Vite native glob.
 * Enforces strict fail-fast validation (Zero-Tolerance, Zero-Fallback).
 */
const scanSpecialSchemas = () => {
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

  return schemasMap;
};

const specialSchemasMap = scanSpecialSchemas();

export function renderSpecialsPage() {
  // Ensure all canonical schemas exist in the scanned set (Strict Fail-Fast)
  const canonicalIds = [
    standardFrameSchema.id,
    matrixFrameSchema.id,
    interactionFrameSchema.id,
    shellSchema.id
  ];

  for (const cid of canonicalIds) {
    if (!specialSchemasMap.has(cid)) {
      throw new Error(`[Catalogue Fail-Fast] Required canonical special schema "${cid}" missing from disk.`);
    }
  }

  // ----------------------------------------------------
  // Card 1: Standard Frame Spec (Showcased via Interaction Frame with real-time optional toggles)
  // ----------------------------------------------------
  const innerStandardContainer = document.createElement('div');
  innerStandardContainer.style.cssText = 'max-width: 680px; width: 100%;';

  const card1State = {
    showRefLink: true,
    showFlush: false,
    showFooter: true
  };

  const getCard1SampleSpec = (state) => ({
    pattern: 'standard-frame',
    title: 'Title',
    badge: getSchemaBadge(standardFrameSchema),
    description: 'Relative description',
    hasRedirectReference: state.showRefLink,
    redirectLink: state.showRefLink ? {
      toSee: '[Relative Component]',
      checkText: '[Relative Documentation]',
      prefixText: 'Optional: To see [Relative Component], check '
    } : null,
    wellPadding: state.showFlush ? 'none' : 'normal',
    stageContent: {
      type: 'box',
      attributes: {
        style: 'padding: var(--ui-space-6); background: var(--ui-bg-surface); border: 1px dashed var(--ui-border-subtle); border-radius: var(--ui-radius-md); text-align: center; color: var(--ui-text-muted); font-size: var(--ui-font-sm);'
      },
      text: state.showFlush ? 'Custom content (Flush edge well)' : 'Custom content'
    },
    hasFooter: state.showFooter,
    footerText: state.showFooter ? 'Optional: Relative description' : null
  });

  const updateCard1 = () => {
    innerStandardContainer.replaceChildren(interpret(getCard1SampleSpec(card1State)));
  };
  updateCard1();

  const card1 = {
    pattern: 'interaction-frame',
    id: standardFrameSchema.id,
    title: 'Standard Frame',
    badge: getSchemaBadge(standardFrameSchema),
    status: 'draft',
    description: standardFrameSchema.description,
    hasRedirectReference: true,
    redirectLink: {
      toSee: '2D Matrix Frame',
      checkText: 'documentation',
      url: '#' + matrixFrameSchema.id
    },
    controls: [
      {
        block: 'checkbox',
        id: 'ctrl-card1-ref',
        props: {
          label: 'Optional: Reference Link',
          size: 'sm',
          modifier: 'neutral',
          checked: card1State.showRefLink,
          onChange: (checked) => {
            card1State.showRefLink = checked;
            updateCard1();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card1-flush',
        props: {
          label: 'Optional: Flush Edge Well',
          size: 'sm',
          modifier: 'neutral',
          checked: card1State.showFlush,
          onChange: (checked) => {
            card1State.showFlush = checked;
            updateCard1();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card1-footer',
        props: {
          label: 'Optional: Footer Slot',
          size: 'sm',
          modifier: 'neutral',
          checked: card1State.showFooter,
          onChange: (checked) => {
            card1State.showFooter = checked;
            updateCard1();
          }
        }
      }
    ],
    stageContent: innerStandardContainer,
    footerText: 'Header • Well (Standard / Flush) • (optional)Footer'
  };

  // ----------------------------------------------------
  // Card 2: 2D Matrix Frame Spec
  // ----------------------------------------------------
  const innerMatrixContainer = document.createElement('div');
  innerMatrixContainer.style.cssText = 'max-width: 680px; width: 100%;';

  const card2State = {
    showRefLink: true,
    showFilter: true,
    showLens: true
  };

  const getCard2SampleSpec = (state) => ({
    pattern: 'matrix-frame',
    title: 'Title',
    badge: getSchemaBadge(matrixFrameSchema),
    description: 'Relative description',
    hasRedirectReference: state.showRefLink,
    redirectLink: state.showRefLink ? {
      toSee: '[Relative Component]',
      checkText: '[Relative Documentation]',
      prefixText: 'Optional: To see [Relative Component], check '
    } : null,
    hasFilterBar: state.showFilter,
    haveFilterBar: state.showFilter,
    hasVariantDimensions: state.showLens,
    haveVariantDimensions: state.showLens,
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

  const updateCard2 = () => {
    innerMatrixContainer.replaceChildren(interpret(getCard2SampleSpec(card2State)));
  };
  updateCard2();

  const card2 = {
    pattern: 'interaction-frame',
    id: matrixFrameSchema.id,
    title: '2D Matrix Frame',
    badge: getSchemaBadge(matrixFrameSchema),
    status: 'draft',
    description: matrixFrameSchema.description,
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Interactive Frame',
      checkText: 'documentation',
      url: '#' + interactionFrameSchema.id
    },
    controls: [
      {
        block: 'checkbox',
        id: 'ctrl-card2-ref',
        props: {
          label: 'Optional: Reference Link',
          size: 'sm',
          modifier: 'neutral',
          checked: card2State.showRefLink,
          onChange: (checked) => {
            card2State.showRefLink = checked;
            updateCard2();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card2-filter',
        props: {
          label: 'Optional: Filter Bar',
          size: 'sm',
          modifier: 'neutral',
          checked: card2State.showFilter,
          onChange: (checked) => {
            card2State.showFilter = checked;
            updateCard2();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card2-lens',
        props: {
          label: 'Optional: Lens Bar',
          size: 'sm',
          modifier: 'neutral',
          checked: card2State.showLens,
          onChange: (checked) => {
            card2State.showLens = checked;
            updateCard2();
          }
        }
      }
    ],
    stageContent: innerMatrixContainer,
    footerText: 'Header • Appearance Filter • Dimension Lens • 2D Table Matrix'
  };

  // ----------------------------------------------------
  // Card 3: Interactive Staging Frame Spec
  // ----------------------------------------------------
  const card3 = {
    pattern: 'interaction-frame',
    id: interactionFrameSchema.id,
    title: 'Interactive Frame',
    badge: getSchemaBadge(interactionFrameSchema),
    status: 'draft',
    description: interactionFrameSchema.description,
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

  // ----------------------------------------------------
  // Card 4: Catalogue Shell Layout (Standard Frame with flush edge and prevent-default isolation)
  // ----------------------------------------------------
  const card4 = {
    pattern: stagingRules.overrides[shellSchema.id]?.frame || 'standard-frame',
    id: shellSchema.id,
    title: 'Catalogue Shell Layout',
    badge: getSchemaBadge(shellSchema),
    status: 'draft',
    description: shellSchema.description,
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Standard Staging Frame',
      checkText: 'documentation',
      url: '#' + standardFrameSchema.id
    },
    wellPadding: stagingRules.overrides[shellSchema.id]?.wellPadding || 'none',
    preventDefault: stagingRules.overrides[shellSchema.id]?.preventDefault ?? true,
    stageContent: () => {
      const container = document.createElement('div');
      container.style.cssText = 'max-width: 680px; width: 100%; min-height: 220px;';
      const embeddedShell = new CatalogueShellLayout({
        isRoot: false,
        activePage: 'specials',
        sidebarItems: {
          draft: [{ label: 'Matrix Frame', href: '#' + matrixFrameSchema.id, active: true }],
          core: [{ label: 'Overview', href: '#' }],
          special: [{ label: 'Interaction Frame', href: '#' + interactionFrameSchema.id }]
        }
      });
      embeddedShell.mount(container);
      return container;
    },
    footerText: 'Header (56px) • 3-Tier Sidebar • Embedded Canvas Sandbox'
  };

  const knownCards = [card1, card2, card3, card4];
  const handledIds = new Set(canonicalIds);

  // Discover and stage any new or unknown special patterns automatically using default frame
  const extraCards = [];
  for (const [id, schema] of specialSchemasMap.entries()) {
    if (handledIds.has(id)) continue;
    const defaultFrame = stagingRules.defaultFrames.specials || 'standard-frame';
    extraCards.push({
      pattern: stagingRules.overrides[id]?.frame || defaultFrame,
      id: schema.id,
      title: schema.title || schema.name || schema.block,
      badge: getSchemaBadge(schema),
      status: schema.status || 'draft',
      description: schema.description,
      wellPadding: stagingRules.overrides[id]?.wellPadding || 'normal',
      preventDefault: stagingRules.overrides[id]?.preventDefault ?? false,
      stageContent: {
        pattern: 'center-placeholder',
        content: `${schema.title || schema.id} Preview`
      },
      footerText: `${schema.title || schema.id} • Dynamic Auto-Discovered Staging`
    });
  }

  const pageSpec = {
    type: 'container',
    className: 'catalogue-page catalogue-page--specials',
    attributes: {
      style: 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;'
    },
    children: [...knownCards, ...extraCards]
  };

  return interpret(pageSpec);
}
