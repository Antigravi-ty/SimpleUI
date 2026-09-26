import './style.css';
import shellSchema from './schema.json';
import { PageComposer } from '@src_next/core/page-composer.js';
import { SimpleUIEngine } from '@src_next/core/engine.js';
import components, { initDropdown, initSlider } from '@src_next/components/index.js';
import { viewportEngine } from '@src_next/core/viewport-engine.js';

const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
const SAFE_AREA_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>`;

export const CATALOGUE_PAGES = [
  { id: 'components', label: 'Components', href: '#/components' },
  { id: 'primitives', label: 'Primitives', href: '#/primitives' },
  { id: 'patterns', label: 'Structural Patterns', href: '#/patterns' },
  { id: 'animations', label: 'Animations', href: '#/animations' },
  { id: 'specials', label: 'Catalogue Special', href: '#/specials' }
];

export class CatalogueShellLayout {
  constructor(options = {}) {
    this.engine = options.engine || new SimpleUIEngine();
    this.engine.loadBlocks(components);
    this.composer = new PageComposer(this.engine);
    this.root = null;
    this.activePage = options.activePage || 'components';
    this.viewportEngine = options.viewportEngine || viewportEngine;
    this._isRootOption = options.isRoot;
    this.isRoot = false;
  }

  mount(target) {
    this.isRoot = this._isRootOption !== undefined
      ? Boolean(this._isRootOption)
      : Boolean(target && (target.id === 'catalogue-root' || target === document.body));

    if (this.isRoot) {
      this.viewportEngine.init();
    }

    this.root = this.composer.renderPage(shellSchema);
    target.innerHTML = '';
    target.appendChild(this.root);

    this.initBrand();
    this.initThemeToggle();
    this.initSafeArea();
    this.initScale();
    this.initViewportSync();
    this.initNavDropdown();

    const sidebar = this.root.querySelector('.sp-cata-sidebar, #sp-cata-sidebar');
    if (sidebar) {
      this.renderSidebar(sidebar);
    }

    // When embedded in a container, delegate anchor clicks to prevent page jumps
    if (!this.isRoot) {
      this.root.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && !anchor.classList.contains('ui-dropdown__item')) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    return {
      header: this.root.querySelector('.sp-cata-header, #sp-cata-header'),
      sidebar,
      content: this.root.querySelector('.sp-cata-content, #sp-cata-content'),
      setActivePage: (id) => this.setActivePage(id)
    };
  }

  initThemeToggle() {
    const btn = this.root.querySelector('.sp-cata-header__theme-toggle, #sp-cata-theme-toggle');
    if (!btn) return;

    if (this.isRoot) {
      const current = localStorage.getItem('simpleui-theme') || 'light';
      document.documentElement.setAttribute('data-theme', current);
      btn.innerHTML = current === 'dark' ? SUN_SVG : MOON_SVG;
      btn.className = 'sp-cata-header__theme-toggle app-header__theme-toggle';
      btn.setAttribute('aria-label', current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');

      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('simpleui-theme', next);
        btn.innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      });
    } else {
      btn.innerHTML = MOON_SVG;
      btn.className = 'sp-cata-header__theme-toggle app-header__theme-toggle';
      btn.setAttribute('aria-label', 'Toggle theme');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }

  initBrand() {
    const brand = this.root.querySelector('.sp-cata-header__logo-group, #sp-cata-brand-link');
    if (!brand) return;
    brand.addEventListener('click', (e) => {
      if (this.isRoot) {
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          window.location.href = '/';
        }
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  initSafeArea() {
    const btn = this.root.querySelector('.sp-cata-header__safe-area-btn, #sp-cata-safe-area-toggle');
    if (!btn) return;
    btn.innerHTML = `${SAFE_AREA_SVG}<span>Safe Area</span>`;
    btn.className = 'ui-btn ui-btn--sm ui-btn--neutral app-header__safe-area-btn sp-cata-header__safe-area-btn';
    btn.setAttribute('aria-label', 'Toggle Safe Area Overlay');
    btn.title = 'Toggle Safe Area Overlay';

    if (this.isRoot) {
      btn.classList.toggle('is-active', this.viewportEngine.safeAreaVisible);
      btn.addEventListener('click', () => {
        this.viewportEngine.toggleSafeArea();
      });
    } else {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }

  initScale() {
    const sliderEl = this.root.querySelector('.sp-cata-header__scale-slider, #sp-cata-scale-slider');
    if (!sliderEl) return;
    sliderEl.dataset.unit = '%';
    const rangeInput = sliderEl.querySelector('input');
    const valueDisplay = sliderEl.querySelector('.ui-slider__value');

    if (this.isRoot) {
      const initialScale = this.viewportEngine.userScale;
      if (rangeInput) rangeInput.value = initialScale;
      if (valueDisplay) valueDisplay.textContent = `${initialScale}%`;
      initSlider(sliderEl);

      sliderEl.addEventListener('change', (e) => {
        const val = e.detail?.value !== undefined ? e.detail.value : (rangeInput ? Number(rangeInput.value) : 100);
        this.viewportEngine.setUserScale(val);
      });
    } else {
      if (rangeInput) rangeInput.value = 100;
      if (valueDisplay) valueDisplay.textContent = '100%';
      initSlider(sliderEl);

      sliderEl.addEventListener('change', (e) => {
        e.stopPropagation();
      });
      if (rangeInput) {
        rangeInput.addEventListener('input', (e) => {
          e.stopPropagation();
        });
      }
    }
  }

  initViewportSync() {
    if (!this.isRoot) return;
    this.viewportEngine.subscribe((m) => {
      if (!this.root || !this.root.isConnected) return;
      const btn = this.root.querySelector('.sp-cata-header__safe-area-btn, #sp-cata-safe-area-toggle');
      if (btn) {
        btn.classList.toggle('is-active', this.viewportEngine.safeAreaVisible);
      }
      const sliderEl = this.root.querySelector('.sp-cata-header__scale-slider, #sp-cata-scale-slider');
      if (sliderEl) {
        const rangeInput = sliderEl.querySelector('input');
        const valueDisplay = sliderEl.querySelector('.ui-slider__value');
        if (rangeInput && document.activeElement !== rangeInput) {
          rangeInput.value = m.userScale;
        }
        if (valueDisplay) {
          valueDisplay.textContent = `${m.userScale}%`;
        }
      }
    });
  }

  initNavDropdown() {
    const dropdown = this.root.querySelector('.sp-cata-nav-dropdown, #sp-cata-nav-dropdown');
    if (!dropdown) return;

    if (typeof dropdown._uiCleanup === 'function') {
      dropdown._uiCleanup();
    }
    delete dropdown._uiBound;

    dropdown.className = 'ui-dropdown ui-dropdown--md ui-dropdown--neutral sp-cata-nav-dropdown app-nav-dropdown';
    const activeItem = CATALOGUE_PAGES.find(p => p.id === this.activePage) || CATALOGUE_PAGES[0];

    dropdown.innerHTML = `
      <button type="button" class="ui-dropdown__trigger" aria-haspopup="true" aria-expanded="false">
        <span class="ui-dropdown__trigger-text">${activeItem.label}</span>
        <svg class="ui-dropdown__arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="ui-dropdown__menu" role="menu">
        ${CATALOGUE_PAGES.map(p => `
          <a href="${p.href}" class="ui-dropdown__item ${p.id === this.activePage ? 'ui-dropdown__item--active' : ''}" role="menuitem" data-page="${p.id}">
            <span class="ui-dropdown__item-text">${p.label}</span>
            ${p.id === this.activePage ? '<span class="ui-badge ui-badge--neutral ui-badge--sm ui-dropdown__item-badge--plain">Current</span>' : ''}
          </a>
        `).join('')}
      </div>
    `;

    dropdown.querySelectorAll('.ui-dropdown__item').forEach(link => {
      link.addEventListener('click', (e) => {
        const pageId = link.getAttribute('data-page');
        if (this.isRoot) {
          if (pageId === this.activePage) {
            e.preventDefault();
            e.stopPropagation();
          }
        } else {
          e.preventDefault();
          e.stopPropagation();
          this.setActivePage(pageId);
        }
        if (typeof dropdown._uiDropdownClose === 'function') {
          dropdown._uiDropdownClose();
        } else {
          dropdown.classList.remove('ui-dropdown--open');
        }
      });
    });

    initDropdown(dropdown);
  }

  setActivePage(pageId) {
    let normalized = pageId;
    if (pageId === 'specials' || pageId === 'special') normalized = 'specials';
    if (pageId === 'patterns' || pageId === 'structural_patterns' || pageId === 'structural-patterns') normalized = 'patterns';
    this.activePage = normalized;

    const dropdown = this.root.querySelector('.sp-cata-nav-dropdown, #sp-cata-nav-dropdown');
    if (dropdown) {
      const activeItem = CATALOGUE_PAGES.find(p => p.id === normalized) || CATALOGUE_PAGES[0];
      const triggerText = dropdown.querySelector('.ui-dropdown__trigger-text');
      if (triggerText) triggerText.textContent = activeItem.label;

      dropdown.querySelectorAll('.ui-dropdown__item').forEach(item => {
        const pId = item.getAttribute('data-page');
        const isActive = pId === normalized;
        item.classList.toggle('ui-dropdown__item--active', isActive);
        const existingBadge = item.querySelector('.ui-badge');
        if (isActive && !existingBadge) {
          const badge = document.createElement('span');
          badge.className = 'ui-badge ui-badge--neutral ui-badge--sm ui-dropdown__item-badge--plain';
          badge.textContent = 'Current';
          item.appendChild(badge);
        } else if (!isActive && existingBadge) {
          existingBadge.remove();
        }
      });
    }

    const sidebar = this.root.querySelector('.sp-cata-sidebar, #sp-cata-sidebar');
    if (sidebar) {
      this.renderSidebar(sidebar);
    }
  }

  renderSidebar(sidebarEl, items = {}) {
    if (!sidebarEl) {
      console.error('[CatalogueShellLayout] renderSidebar failed: sidebarEl is null or undefined.');
      return;
    }
    if (typeof items !== 'object' || items === null) {
      console.error('[CatalogueShellLayout] renderSidebar failed: items must be a valid object.');
      return;
    }
    const { draft = [], core = [], special = [] } = items;
    if (!Array.isArray(draft) || !Array.isArray(core) || !Array.isArray(special)) {
      console.error('[CatalogueShellLayout] renderSidebar failed: draft, core, and special must be arrays.');
      return;
    }

    const currentTitle = CATALOGUE_PAGES.find(p => p.id === this.activePage)?.label || 'Navigation';

    sidebarEl.innerHTML = `
      <div class="sp-cata-sidebar__content">
        <h4 class="sp-cata-sidebar__heading">${currentTitle}</h4>
        <nav class="sp-cata-sidebar__nav">
          <!-- 1. Draft Section (Top, Red) -->
          <div class="sp-cata-sidebar__section">
            <div class="sp-cata-sidebar__section-title sp-cata-sidebar__section-title--draft">
              <span>Draft</span>
              <span class="sp-cata-sidebar__badge--draft">In Design</span>
            </div>
            ${draft.length > 0
              ? draft.map(item => `<a href="${item.href}" class="sp-cata-sidebar__link ${item.active ? 'sp-cata-sidebar__link--active' : ''}"><span>${item.label}</span></a>`).join('')
              : '<span class="sp-cata-sidebar__link--none">None</span>'}
          </div>

          <!-- 2. Core Section (Middle, Blue) -->
          <div class="sp-cata-sidebar__section">
            <div class="sp-cata-sidebar__section-title sp-cata-sidebar__section-title--core">
              <span>Core</span>
              <span class="sp-cata-sidebar__badge--core">Stable</span>
            </div>
            ${core.length > 0
              ? core.map(item => `<a href="${item.href}" class="sp-cata-sidebar__link ${item.active ? 'sp-cata-sidebar__link--active' : ''}"><span>${item.label}</span></a>`).join('')
              : '<span class="sp-cata-sidebar__link--none">None</span>'}
          </div>

          <!-- 3. Catalogue Special Section (Bottom, Purple) -->
          <div class="sp-cata-sidebar__section">
            <div class="sp-cata-sidebar__section-title sp-cata-sidebar__section-title--special">
              <span>Catalogue</span>
              <span class="sp-cata-sidebar__badge--special">Special</span>
            </div>
            ${special.length > 0
              ? special.map(item => `<a href="${item.href}" class="sp-cata-sidebar__link ${item.active ? 'sp-cata-sidebar__link--active' : ''}"><span>${item.label}</span></a>`).join('')
              : '<span class="sp-cata-sidebar__link--none">None</span>'}
          </div>
        </nav>
      </div>
      <div class="sp-cata-sidebar__footer">
        <a href="/examples/index.html" class="sp-cata-sidebar__more-demos-link">want to view more demos? ↗</a>
      </div>
    `;
  }
}
