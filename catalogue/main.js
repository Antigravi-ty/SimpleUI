import { CatalogueShellLayout } from '@catalogue/special/shell/shell-layout/index.js';
import { renderStandardFrame } from '@catalogue/special/patterns/standard-frame/index.js';
import { renderMatrixCard } from '@catalogue/special/components/matrix-card/index.js';
import { renderContainer } from '@draft/primitives/container/index.js';
import { renderStack } from '@draft/primitives/stack/index.js';
import { renderRow } from '@draft/primitives/row/index.js';
import { renderCenterPlaceholder } from '@draft/primitives/center-placeholder/index.js';
import { renderThreeStageContainer } from '@draft/patterns/three-stage/index.js';
import { renderSpecialPage } from '@catalogue/special/pages/special-page/index.js';
import buttonComponent from '@src_next/components/button/index.js';
import { bindAllBehaviors } from '@src_next/index.js';

const appRoot = document.getElementById('catalogue-root');
if (appRoot) {
  const shell = new CatalogueShellLayout();
  const { content, setActivePage } = shell.mount(appRoot);

  const sidebarItems = {
    draft: [
      { label: 'Container', href: '#/primitives' },
      { label: 'Vertical Stack', href: '#/primitives' },
      { label: 'Horizontal Stack', href: '#/primitives' },
      { label: 'Center Placeholder', href: '#/primitives' },
      { label: 'Three-Stage Container', href: '#/patterns' }
    ],
    core: [
      { label: 'Button', href: '#/components' }
    ],
    special: [
      { label: 'Standard Frame', href: '#/specials' },
      { label: 'Matrix Frame', href: '#/specials' },
      { label: 'Interaction Frame', href: '#/specials' },
      { label: 'Catalogue Shell Layout', href: '#/specials' }
    ]
  };

  // 1. Components View: Automated 2D Matrix Pioneer (Button)
  const renderComponentsView = () => {
    const frag = document.createDocumentFragment();
    const btnMatrix = renderMatrixCard(buttonComponent.schema);
    frag.appendChild(btnMatrix);
    return frag;
  };

  // 2. Primitives View: Draft primitives rendered with zero inline style hacks
  const renderPrimitivesView = () => {
    const frag = document.createDocumentFragment();

    // 1) Container Primitive
    const containerInner = renderCenterPlaceholder({
      content: `
        <div class="ui-stack ui-stack--center">
          <h4 class="ui-headline" style="margin: 0;">Squircle Surface Container</h4>
          <p class="ui-caption" style="margin: 0; color: var(--ui-text-muted);">
            Solidified container with tokenized continuous radius, border subtle, and neutral surface.
          </p>
        </div>
      `
    });
    const containerSample = renderContainer({ content: containerInner });
    const containerFrame = renderStandardFrame({
      id: 'primitive-container',
      title: 'Container',
      badge: '.draft-ui-container',
      status: 'draft',
      description: 'Continuous squircle boundary with neutral surface, tokenized radius, and subtle border.',
      stageContent: containerSample,
      footerText: 'Radius: var(--ui-radius-lg) • Surface: var(--ui-bg-surface) • Border: var(--ui-border-subtle)'
    });
    frag.appendChild(containerFrame);

    // 2) Vertical Stack Primitive
    const stackSample = renderStack({
      gap: 'md',
      children: [
        renderCenterPlaceholder({ content: '<span class="ui-caption">Vertical Stack Item 1</span>' }),
        renderCenterPlaceholder({ content: '<span class="ui-caption">Vertical Stack Item 2</span>' }),
        renderCenterPlaceholder({ content: '<span class="ui-caption">Vertical Stack Item 3</span>' })
      ]
    });
    const stackFrame = renderStandardFrame({
      id: 'primitive-stack',
      title: 'Vertical Stack',
      badge: '.draft-ui-stack',
      status: 'draft',
      description: 'Auto-layout flex container grouping child elements along a vertical column with tokenized gap spacing.',
      stageContent: stackSample,
      footerText: 'Direction: column • Gap: var(--ui-space-3) • Alignment: stretch'
    });
    frag.appendChild(stackFrame);

    // 3) Horizontal Stack Primitive
    const rowSample = renderRow({
      gap: 'md',
      justify: 'center',
      children: [
        renderCenterPlaceholder({ content: '<span class="ui-caption">Row Item 1</span>' }),
        renderCenterPlaceholder({ content: '<span class="ui-caption">Row Item 2</span>' }),
        renderCenterPlaceholder({ content: '<span class="ui-caption">Row Item 3</span>' })
      ]
    });
    const rowFrame = renderStandardFrame({
      id: 'primitive-row',
      title: 'Horizontal Stack',
      badge: '.draft-ui-row',
      status: 'draft',
      description: 'Auto-layout flex container distributing child elements along a horizontal row with tokenized gap spacing.',
      stageContent: rowSample,
      footerText: 'Direction: row • Gap: var(--ui-space-3) • Alignment: center'
    });
    frag.appendChild(rowFrame);

    // 4) Center Placeholder Primitive
    const placeholderSample = renderCenterPlaceholder({
      content: '<span class="ui-caption">Centered Staging Placeholder</span>'
    });
    const placeholderFrame = renderStandardFrame({
      id: 'primitive-center-placeholder',
      title: 'Center Placeholder',
      badge: '.draft-ui-center-placeholder',
      status: 'draft',
      description: 'Neutral staging placeholder primitive providing geometry centering and clean visual boundaries.',
      stageContent: placeholderSample,
      footerText: 'Surface: var(--ui-bg-surface) • Border: 1px solid var(--ui-border-subtle) • Alignment: center'
    });
    frag.appendChild(placeholderFrame);

    return frag;
  };

  // 3. Patterns View: Three-stage structural container pattern
  const renderPatternsView = () => {
    const frag = document.createDocumentFragment();
    const pureThreeStageSample = renderThreeStageContainer({
      header: renderCenterPlaceholder({ content: '<span class="ui-headline">Header Slot</span>' }),
      content: renderCenterPlaceholder({ content: '<span class="ui-body" style="color: var(--ui-text-muted);">Content Slot</span>' }),
      footer: renderCenterPlaceholder({ content: '<span class="ui-caption" style="color: var(--ui-text-muted);">Footer Slot</span>' })
    });

    const threeStageFrame = renderStandardFrame({
      id: 'pattern-three-stage',
      title: 'Three-Stage Container',
      badge: '.draft-ui-three-stage',
      status: 'draft',
      description: 'Pure 3-stage structural container pattern isolating Header, Content, and optional Footer slots.',
      stageContent: pureThreeStageSample,
      footerText: 'Header Slot • Content Slot • Optional Footer Slot'
    });
    frag.appendChild(threeStageFrame);
    return frag;
  };

  // 4. Specials View: Catalogue Special specifications page
  const renderSpecialsView = () => {
    return renderSpecialPage();
  };

  // Declarative Route Registry Map
  const ROUTES = {
    '#/components': { pageId: 'components', render: renderComponentsView },
    '#/primitives': { pageId: 'primitives', render: renderPrimitivesView },
    '#/patterns': { pageId: 'patterns', render: renderPatternsView },
    '#/animations': { pageId: 'animations', render: renderComponentsView },
    '#/specials': { pageId: 'specials', render: renderSpecialsView }
  };

  const ALIASES = {
    '': '#/components',
    '#/': '#/components',
    '#/structural-patterns': '#/patterns',
    '#/catalogue-special': '#/specials',
    '#/special': '#/specials'
  };

  const dispatchRoute = () => {
    const rawHash = (window.location.hash || '').split('?')[0];
    const targetHash = ALIASES[rawHash] || (rawHash.startsWith('#special-') ? '#/specials' : rawHash);
    const route = ROUTES[targetHash] || ROUTES['#/components'];

    setActivePage(route.pageId, sidebarItems);
    content.innerHTML = '';
    content.appendChild(route.render());
    bindAllBehaviors(content);

    if (rawHash.startsWith('#special-')) {
      setTimeout(() => {
        const targetEl = content.querySelector(rawHash);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  window.addEventListener('hashchange', dispatchRoute);
  dispatchRoute();
}
