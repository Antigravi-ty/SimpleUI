import {
  standardFrameSchema,
  matrixFrameSchema,
  interactionFrameSchema,
  getSchemaBadge,
  renderStandardFrame,
  renderInteractionFrame,
  renderMatrixFrame
} from '@draft/special/catalogue/patterns/index.js';
import { CatalogueShellLayout } from '@draft/special/catalogue/shell-layout/index.js';
import shellSchema from '@draft/special/catalogue/shell-layout/schema.json';
import specialsPageSchema from './schema.json';
import { interpret } from '@src_next/core/slot-resolver.js';

import '@draft/primitives/index.js';
import '@draft/special/catalogue/patterns/index.js';

export function renderSpecialsPage() {
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
    description: 'Standard catalogue staging frame consuming the 3-stage pattern with title, badge, description, and preview well.',
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
    description: '2D Matrix staging frame consuming the 3-stage pattern for multidimensional component evaluation across sizes, modifiers, and lenses.',
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
    description: 'Interactive catalogue staging frame consuming the 3-stage pattern for runtime parameter tweaking, live states, and responsive bounds testing.',
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
  // Card 4: Catalogue Shell Layout Staging
  // ----------------------------------------------------
  const innerShellContainer = document.createElement('div');
  innerShellContainer.style.cssText = 'max-width: 680px; width: 100%; min-height: 220px;';

  const card4State = {
    showHeader: true,
    showSidebar: true,
    showSafeOverlay: false,
    showScale: true
  };

  const updateCard4 = () => {
    innerShellContainer.innerHTML = '';
    const embeddedShell = new CatalogueShellLayout({
      isRoot: false,
      activePage: 'specials',
      sidebarItems: {
        draft: [{ label: 'Matrix Frame', href: '#' + matrixFrameSchema.id, active: true }],
        core: [{ label: 'Overview', href: '#' }],
        special: [{ label: 'Interaction Frame', href: '#' + interactionFrameSchema.id }]
      }
    });

    const { header, sidebar } = embeddedShell.mount(innerShellContainer);

    if (header) {
      header.style.display = card4State.showHeader ? '' : 'none';
      const scaleEl = header.querySelector('.sp-cata-header__scale-box, #sp-cata-scale-slider');
      if (scaleEl) scaleEl.style.display = card4State.showScale ? '' : 'none';
      const safeBtn = header.querySelector('.sp-cata-header__safe-area-btn, #sp-cata-safe-area-toggle');
      if (safeBtn) safeBtn.classList.toggle('is-active', card4State.showSafeOverlay);
    }

    if (sidebar) {
      sidebar.style.display = card4State.showSidebar ? '' : 'none';
    }
  };
  updateCard4();

  const card4 = {
    pattern: 'interaction-frame',
    id: shellSchema.id,
    title: 'Catalogue Shell Layout',
    badge: getSchemaBadge(shellSchema),
    status: 'draft',
    description: 'Application shell architecture establishing canonical 56px Header, Safe Area HUD, UI Scale, and 3-Tier Sidebar navigation (Draft Incubator).',
    hasRedirectReference: true,
    redirectLink: {
      toSee: 'Standard Staging Frame',
      checkText: 'documentation',
      url: '#' + standardFrameSchema.id
    },
    controls: [
      {
        block: 'checkbox',
        id: 'ctrl-card4-header',
        props: {
          label: 'Header (56px)',
          size: 'sm',
          modifier: 'neutral',
          checked: card4State.showHeader,
          onChange: (checked) => {
            card4State.showHeader = checked;
            updateCard4();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card4-sidebar',
        props: {
          label: 'Sidebar (3-Tier)',
          size: 'sm',
          modifier: 'neutral',
          checked: card4State.showSidebar,
          onChange: (checked) => {
            card4State.showSidebar = checked;
            updateCard4();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card4-safe',
        props: {
          label: 'Safe Area Overlay',
          size: 'sm',
          modifier: 'neutral',
          checked: card4State.showSafeOverlay,
          onChange: (checked) => {
            card4State.showSafeOverlay = checked;
            updateCard4();
          }
        }
      },
      {
        block: 'checkbox',
        id: 'ctrl-card4-scale',
        props: {
          label: 'UI Scale Control',
          size: 'sm',
          modifier: 'neutral',
          checked: card4State.showScale,
          onChange: (checked) => {
            card4State.showScale = checked;
            updateCard4();
          }
        }
      }
    ],
    stageContent: innerShellContainer,
    footerText: 'Header (56px) • 3-Tier Sidebar (Draft / Core / Special) • Resilient Content Viewport'
  };

  const pageSpec = {
    type: 'container',
    className: 'catalogue-page catalogue-page--specials',
    attributes: {
      style: 'display: flex; flex-direction: column; gap: var(--ui-space-6); width: 100%;'
    },
    children: [card1, card2, card3, card4]
  };

  return interpret(pageSpec);
}
