import { CatalogueShellLayout } from '@draft/special/catalogue/shell-layout/index.js';
import { renderComponentsPage } from './pages/components/index.js';
import { renderPrimitivesPage } from './pages/primitives/index.js';
import { renderPatternsPage } from './pages/patterns/index.js';
import { renderAnimationsPage } from './pages/animations/index.js';
import { renderSpecialsPage } from './pages/specials/index.js';
import { bindAllBehaviors } from '@src_next/index.js';
import { buildCatalogueSidebars } from './sidebar-builder.js';

const appRoot = document.getElementById('catalogue-root');
if (appRoot) {
  const shell = new CatalogueShellLayout();
  const { content, setActivePage } = shell.mount(appRoot);

  const PAGE_SIDEBARS = buildCatalogueSidebars();

  // Declarative Route Registry Map mapping hashes to modular page renderers
  const ROUTES = {
    '#/components': { pageId: 'components', render: renderComponentsPage },
    '#/primitives': { pageId: 'primitives', render: renderPrimitivesPage },
    '#/patterns': { pageId: 'patterns', render: renderPatternsPage },
    '#/animations': { pageId: 'animations', render: renderAnimationsPage },
    '#/specials': { pageId: 'specials', render: renderSpecialsPage },
    '#/catalogs': { pageId: 'specials', render: renderSpecialsPage }
  };

  const ALIASES = {
    '': '#/components',
    '#/': '#/components',
    '#/structural-patterns': '#/patterns',
    '#/structural_patterns': '#/patterns',
    '#/catalogue-special': '#/specials',
    '#/special': '#/specials',
    '#/catalogs': '#/specials',
    '#/catalog': '#/specials'
  };

  const dispatchRoute = () => {
    const rawHash = (window.location.hash || '').split('?')[0];

    // If anchor target exists on current page, smooth-scroll to it without re-rendering
    if (rawHash && !rawHash.startsWith('#/')) {
      const targetEl = content.querySelector(rawHash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    const targetHash = ALIASES[rawHash] || (rawHash.startsWith('#special-') ? '#/specials' : rawHash);
    const route = ROUTES[targetHash] || ROUTES['#/components'];

    const sidebarItems = PAGE_SIDEBARS[route.pageId] || {};
    setActivePage(route.pageId, sidebarItems);
    const renderedPage = route.render();
    if (renderedPage) {
      content.replaceChildren(renderedPage);
    }
    bindAllBehaviors(content);

    if (rawHash.startsWith('#special-') || rawHash.startsWith('#primitive-') || rawHash.startsWith('#pattern-') || rawHash.startsWith('#block-')) {
      setTimeout(() => {
        const targetEl = content.querySelector(rawHash);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  window.addEventListener('hashchange', dispatchRoute);
  dispatchRoute();
}
