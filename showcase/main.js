import { SimpleUIEngine } from '../src/core/engine.js';
import { UIRouter } from '../src/navigation/index.js';
import { attachMatrixFilter } from './matrix-filter.js';
import { initAppHeader } from './header-nav.js';
import './main.css';

// Initialize Core Engine and Router
const engine = new SimpleUIEngine();
new UIRouter({ root: document.body });

// Auto-discover all block schemas via Vite's import.meta.glob
const blockModules = import.meta.glob('../src/blocks/*/schema.json', { eager: true });
engine.loadAutoDiscoveredSchemas(blockModules);

const sidebarNav = document.getElementById('sidebar-nav');
const contentArea = document.getElementById('content-area');

// 1. Populate 3-Tier Sidebar Navigation (Draft -> Core -> Showcase)
if (sidebarNav) {
  // Section 1: Draft (Top, Red) - Components has no draft items
  const draftSection = document.createElement('div');
  draftSection.className = 'app-sidebar__section';
  draftSection.innerHTML = `
    <div class="app-sidebar__section-title app-sidebar__section-title--draft">
      <span>Draft</span>
      <span class="app-sidebar__badge--draft">In Design</span>
    </div>
    <span class="app-sidebar__link app-sidebar__link--none">None</span>
  `;
  sidebarNav.appendChild(draftSection);

  // Section 2: Core (Middle, Blue) - All stable components on this page
  const coreSection = document.createElement('div');
  coreSection.className = 'app-sidebar__section';
  coreSection.innerHTML = `
    <div class="app-sidebar__section-title app-sidebar__section-title--core">
      <span>Core</span>
      <span class="app-sidebar__badge--core">Stable</span>
    </div>
  `;

  // Populate stable component anchors
  const blocks = engine.getAllBlocks().filter(schema => schema.block !== 'panel');
  blocks.forEach((schema) => {
    const link = document.createElement('a');
    link.className = 'app-sidebar__link';
    link.href = `#block-${schema.block}`;
    link.innerHTML = `<span>${schema.block}</span><span class="ui-badge ui-badge--neutral ui-badge--sm">${schema.modifiers.length}</span>`;
    coreSection.appendChild(link);

    const matrixCard = engine.renderMatrix(schema);
    attachMatrixFilter(matrixCard, schema);
    contentArea?.appendChild(matrixCard);
  });
  sidebarNav.appendChild(coreSection);

  // Section 3: Showcase (Bottom, Purple) - Components has no special items
  const specialSection = document.createElement('div');
  specialSection.className = 'app-sidebar__section';
  specialSection.innerHTML = `
    <div class="app-sidebar__section-title app-sidebar__section-title--special">
      <span>Showcase</span>
      <span class="app-sidebar__badge--special">Special</span>
    </div>
    <span class="app-sidebar__link app-sidebar__link--none">None</span>
  `;
  sidebarNav.appendChild(specialSection);
}

// Initialize Unified App Header & Nav Dropdown Switcher
initAppHeader({ activePage: 'components' });
