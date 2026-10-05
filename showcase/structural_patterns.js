import { initAppHeader } from './header-nav.js';
import { SimpleUIEngine } from '../src/core/engine.js';
import { PageComposer } from '../src/core/page-composer.js';
import { UIRouter } from '../src/navigation/index.js';
import { bindAllBehaviors } from '../src/blocks/index.js';
import { initPanel } from '../src/blocks/panel/behavior.js';
import './patterns.css';

// 1. Initialize Unified App Header
initAppHeader({ activePage: 'structural_patterns' });

// 2. Engine and Schemas
const engine = new SimpleUIEngine();
const blockModules = import.meta.glob('../src/blocks/*/schema.json', { eager: true });
engine.loadAutoDiscoveredSchemas(blockModules);

const composer = new PageComposer(engine);
const pageModules = import.meta.glob('../src/schemas/pages/**/*.json', { eager: true });
for (const [path, mod] of Object.entries(pageModules)) {
  const s = mod.default || mod;
  const key = path.replace(/^.*\/schemas\/pages\//, '').replace(/\.json$/, '');
  composer.registerSubSchema(key, s);
}

// 3. Mount Patterns
// Mount Pattern 1: Standard 3-Stage Panel
const mountPanelStd = document.getElementById('mount-panel-standard');
if (mountPanelStd) {
  const panelSchema = blockModules['../src/blocks/panel/schema.json']?.default || blockModules['../src/blocks/panel/schema.json'];
  if (panelSchema) {
    const cardEl = document.createElement('div');
    cardEl.className = 'ui-panel ui-panel--neutral';
    cardEl.dataset.sandbox = 'true';
    cardEl.dataset.noKeyboard = 'true';
    cardEl.setAttribute('role', 'region');
    cardEl.setAttribute('aria-label', 'Standard Panel');
    cardEl.innerHTML = `
      <header class="ui-panel__header">
        <div class="ui-panel__header-left">
          <button type="button" class="ui-panel__back-btn" aria-label="Go Back" title="Back (ESC)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h3 class="ui-panel__title">Title</h3>
        </div>
        <span class="ui-badge ui-badge--neutral ui-badge--sm">Badge</span>
      </header>
      <div class="ui-panel__content">
        <div class="ui-panel__content-slot" style="display: flex; flex-direction: column; gap: var(--ui-space-3);">
          <p style="margin: 0; font-size: var(--ui-font-sm); color: var(--ui-text-muted); line-height: 1.5;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--ui-space-2);">
            <span style="font-size: var(--ui-font-sm); font-weight: var(--ui-weight-medium);">Option title</span>
            <div class="ui-stepper ui-stepper--sm ui-stepper--neutral" data-description="Adjust incremental quantity value">
              <button type="button" class="ui-stepper__btn ui-stepper__btn--dec" aria-label="Decrement">-</button>
              <span class="ui-stepper__val">3</span>
              <button type="button" class="ui-stepper__btn ui-stepper__btn--inc" aria-label="Increment">+</button>
            </div>
          </div>
        </div>
      </div>
      <footer class="ui-panel__footer">
        <div class="ui-panel__desc" role="status" aria-live="polite">Relative description</div>
        <span class="ui-panel__hint">ESC</span>
      </footer>
    `;
    mountPanelStd.appendChild(cardEl);
    initPanel(cardEl, { sandbox: true, listenKeyboard: false });
  }
}

// Mount Pattern 2: 3-Stage Panel with Bottom Action
const mountPanelFooter = document.getElementById('mount-panel-footer-back');
if (mountPanelFooter) {
  const cardEl = document.createElement('div');
  cardEl.className = 'ui-panel ui-panel--neutral ui-panel--with-footer-back';
  cardEl.dataset.sandbox = 'true';
  cardEl.dataset.noKeyboard = 'true';
  cardEl.setAttribute('role', 'region');
  cardEl.setAttribute('aria-label', 'Footer Action Panel');
  cardEl.innerHTML = `
    <header class="ui-panel__header">
      <div class="ui-panel__header-left">
        <h3 class="ui-panel__title">Title</h3>
      </div>
      <span class="ui-badge ui-badge--neutral ui-badge--sm">Badge</span>
    </header>
    <div class="ui-panel__content">
      <div class="ui-panel__content-slot">
        <p style="margin: 0 0 var(--ui-space-3) 0; font-size: var(--ui-font-sm); color: var(--ui-text-muted); line-height: 1.5;">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <label class="ui-checkbox ui-checkbox--sm ui-checkbox--neutral ui-checkbox--checked" data-description="Toggle system option state">
          <input type="checkbox" class="ui-checkbox__input" checked>
          <span class="ui-checkbox__box">
            <svg class="ui-checkbox__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 4.5"/></svg>
          </span>
          <span class="ui-checkbox__label">Option title</span>
        </label>
      </div>
    </div>
    <footer class="ui-panel__footer">
      <div class="ui-panel__desc" role="status" aria-live="polite">Relative description</div>
      <button type="button" class="ui-btn ui-btn--sm ui-btn--neutral ui-panel__footer-back" aria-label="Action">Action</button>
    </footer>
  `;
  mountPanelFooter.appendChild(cardEl);
  initPanel(cardEl, { sandbox: true, listenKeyboard: false });
}

// Mount Pattern 4: Balanced Grid Selective Group
const mountBalanced = document.getElementById('mount-balanced-group');
if (mountBalanced) {
  const groupEl = document.createElement('div');
  groupEl.className = 'ui-selective-group ui-selective-group--balanced';
  groupEl.setAttribute('role', 'radiogroup');
  groupEl.setAttribute('data-selection-mode', 'single');
  groupEl.innerHTML = `
    <div class="ui-selective-card ui-selective-card--selected" role="radio" aria-checked="true" data-value="alpha" tabindex="0">
      <div class="ui-selective-card__body">
        <div class="ui-selective-card__title">Option Title</div>
        <div class="ui-selective-card__desc">Relative description</div>
      </div>
    </div>
    <div class="ui-selective-card" role="radio" aria-checked="false" data-value="beta" tabindex="0">
      <div class="ui-selective-card__body">
        <div class="ui-selective-card__title">Option Title</div>
        <div class="ui-selective-card__desc">Relative description</div>
      </div>
    </div>
    <div class="ui-selective-card" role="radio" aria-checked="false" data-value="gamma" tabindex="0">
      <div class="ui-selective-card__body">
        <div class="ui-selective-card__title">Option Title</div>
        <div class="ui-selective-card__desc">Relative description</div>
      </div>
    </div>
    <div class="ui-selective-card" role="radio" aria-checked="false" data-value="delta" tabindex="0">
      <div class="ui-selective-card__body">
        <div class="ui-selective-card__title">Option Title</div>
        <div class="ui-selective-card__desc">Relative description</div>
      </div>
    </div>
  `;
  mountBalanced.appendChild(groupEl);
}

// 4. Interactive Searchable Dropdown Menu Filter
document.querySelectorAll('.ui-dropdown__search-input').forEach((input) => {
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const menu = input.closest('.ui-dropdown__menu');
    if (!menu) return;
    menu.querySelectorAll('.ui-dropdown__item').forEach((it) => {
      const text = it.textContent.toLowerCase();
      it.style.display = text.includes(q) ? '' : 'none';
    });
  });
});

// 5. Initialize Behaviors and Declarative Router
bindAllBehaviors(document.body);
new UIRouter({ root: document.body });
