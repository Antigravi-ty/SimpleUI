import { CatalogueShellLayout } from '@catalogue/special/shell/shell-layout/index.js';
import { renderComponentsPage } from './pages/components/index.js';
import { renderPrimitivesPage } from './pages/primitives/index.js';
import { renderPatternsPage } from './pages/patterns/index.js';
import { renderAnimationsPage } from './pages/animations/index.js';
import { renderSpecialsPage } from './pages/specials/index.js';
import { bindAllBehaviors } from '@src_next/index.js';

const appRoot = document.getElementById('catalogue-root');
if (appRoot) {
  const shell = new CatalogueShellLayout();
  const { content, setActivePage } = shell.mount(appRoot);

  // Keep sidebar items empty during initial component matrix verification
  const sidebarItems = {};

  // Declarative Route Registry Map mapping hashes to modular page renderers
  const ROUTES = {
    '#/components': { pageId: 'components', render: renderComponentsPage },
    '#/primitives': { pageId: 'primitives', render: renderPrimitivesPage },
    '#/patterns': { pageId: 'patterns', render: renderPatternsPage },
    '#/animations': { pageId: 'animations', render: renderAnimationsPage },
    '#/specials': { pageId: 'specials', render: renderSpecialsPage }
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
