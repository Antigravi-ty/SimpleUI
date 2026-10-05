import shellSchema from './schema.json' with { type: 'json' };
import './style.css';
import { PageComposer } from '@src_next/core/page-composer.js';
import { interpret } from '@src_next/core/slot-resolver.js';
import { SimpleUIEngine } from '@src_next/core/engine.js';
import { draftComponents, initDropdown, initSlider } from '@draft/components/index.js';
import { viewportEngine } from '@src_next/core/viewport-engine.js';
import { defaultStore } from '@src_next/core/store.js';

import { getIcon } from '@draft/icons/index.js';

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
    this.engine.loadBlocks(draftComponents);
    this.composer = new PageComposer(this.engine);
    this.root = null;
    this.activePage = options.activePage || 'components';
    this.sidebarItems = options.sidebarItems || {};
    this.viewportEngine = options.viewportEngine || viewportEngine;
    this._isRootOption = options.isRoot;
    this.stripDuplicateIds = options.stripDuplicateIds ?? false;
    this.isRoot = false;
  }

  mount(target) {
    this.isRoot = this._isRootOption !== undefined
      ? Boolean(this._isRootOption)
      : Boolean(target && (target.id === 'catalogue-root' || target === document.body));

    this.root = this.composer.renderPage(shellSchema);

    // Private API Gatekeeper Check for Embedded Sandbox Layouts
    if (!this.isRoot) {
      const isDuplicateAllowed = Boolean(this.stripDuplicateIds);
      const collidingElements = [];
      const innerElementsWithId = this.root.querySelectorAll("[id]");
      innerElementsWithId.forEach(el => {
        if (typeof document !== "undefined" && document.getElementById(el.id)) {
          collidingElements.push(el);
        }
      });
      if (this.root.id && typeof document !== "undefined" && document.getElementById(this.root.id)) {
        collidingElements.push(this.root);
      }

      if (collidingElements.length > 0 && !isDuplicateAllowed) {
        throw new Error(
          `[Catalogue Shell Sandbox Conflict] Embedded shell detected ${collidingElements.length} duplicate host ID(s) (including #${collidingElements[0].id}). You must explicitly pass "stripDuplicateIds: true" to safely embed the layout without hijacking host components.`
        );
      }

      if (isDuplicateAllowed) {
        // Strip duplicate IDs from the inner embedded subtree so outer host components are preserved
        collidingElements.forEach(el => el.removeAttribute("id"));
        const canonicalShellIds = [
          "sp-cata-header", "sp-cata-brand-link", "sp-cata-theme-toggle",
          "sp-cata-safe-area-toggle", "sp-cata-scale-slider", "sp-cata-nav-dropdown",
          "sp-cata-sidebar", "sp-cata-content"
        ];
        canonicalShellIds.forEach(id => {
          const el = this.root.querySelector("#" + id);
          if (el) el.removeAttribute("id");
        });
      }
    }

    target.innerHTML = '';
    target.appendChild(this.root);

    if (this.isRoot) {
      this.viewportEngine.init();
      this.viewportEngine.update();
    }

    this.initBrand();
    this.initThemeToggle();
    this.initSafeArea();
    this.initScale();
    this.initViewportSync();
    this.initNavDropdown();

    const sidebar = this.root.querySelector('.sp-cata-sidebar, #sp-cata-sidebar');
    if (sidebar) {
      this.renderSidebar(sidebar, this.sidebarItems || {});
    }

    // When embedded in a container, delegate anchor clicks to prevent page jumps
    if (!this.isRoot) {
      this.root.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && !anchor.classList.contains('ui-dropdown__item') && !anchor.classList.contains('ui-dropdown-menu__item')) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    return {
      header: this.root.querySelector('.sp-cata-header, #sp-cata-header'),
      sidebar,
      content: this.root.querySelector('.sp-cata-content, #sp-cata-content'),
      setActivePage: (id, items) => this.setActivePage(id, items)
    };
  }

  initThemeToggle() {
    const btn = this.root.querySelector('.sp-cata-header__theme-toggle, #sp-cata-theme-toggle');
    if (!btn) return;

    if (this.isRoot) {
      const current = localStorage.getItem('simpleui-theme') || 'light';
      document.documentElement.setAttribute('data-theme', current);
      defaultStore.set('system.theme', current);

      const updateBtn = (theme) => {
        const isDark = theme === 'dark';
        btn.innerHTML = isDark ? getIcon('sun') : getIcon('moon');
        btn.className = 'sp-cata-header__theme-toggle app-header__theme-toggle';
        btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      };
      updateBtn(current);
      defaultStore.subscribe('system.theme', updateBtn);

      defaultStore.registerAction('theme.toggle', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('simpleui-theme', next);
        defaultStore.set('system.theme', next);
      });
    }
  }

  initBrand() {
    if (!this.isRoot) return;
    defaultStore.registerAction('nav.to_root', ({ event }) => {
      if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        window.location.href = '/';
      }
    });
  }

  initSafeArea() {
    const btn = this.root.querySelector('.sp-cata-header__safe-area-btn, #sp-cata-safe-area-toggle');
    if (!btn) return;

    if (this.isRoot) {
      btn.classList.toggle('is-active', this.viewportEngine.safeAreaVisible);
      defaultStore.registerAction('viewport.toggle_safe_area', () => {
        this.viewportEngine.toggleSafeArea();
      });
    }
  }

  initScale() {
    const sliderEl = this.root.querySelector('.sp-cata-header__scale-slider, #sp-cata-scale-slider');
    if (!sliderEl) return;

    if (this.isRoot) {
      defaultStore.initEventDelegation(this.root);
      defaultStore.set('viewport.userScale', this.viewportEngine.userScale);

      defaultStore.subscribe('viewport.userScale', (val) => {
        if (val !== undefined && val !== this.viewportEngine.userScale) {
          this.viewportEngine.setUserScale(val);
        }
      });
    } else {
      initSlider(sliderEl);
      sliderEl.addEventListener('change', (e) => {
        e.stopPropagation();
      });
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
      defaultStore.set('viewport.userScale', m.userScale);
    });
  }

  initNavDropdown() {
    const dropdownEl = this.root.querySelector('.sp-cata-nav-dropdown, #sp-cata-nav-dropdown');
    if (!dropdownEl) return;

    initDropdown(dropdownEl);

    dropdownEl.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.ui-dropdown__item, .ui-dropdown-menu__item, [role="menuitem"], a');
      if (!itemEl) return;

      const pId = itemEl.dataset.page || itemEl.dataset.item || (itemEl.getAttribute('href') || '').replace('#/', '');
      if (!pId) return;

      if (this.isRoot) {
        if (pId === this.activePage) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          window.location.hash = '#/' + pId;
        }
      } else {
        e.preventDefault();
        e.stopPropagation();
        this.setActivePage(pId);
      }

      if (typeof dropdownEl._uiDropdownClose === 'function') {
        dropdownEl._uiDropdownClose();
      } else {
        dropdownEl.classList.remove('ui-dropdown--open');
      }
    });

    this.syncNavDropdownState();
  }

  syncNavDropdownState() {
    const dropdown = this.root?.querySelector('.sp-cata-nav-dropdown, #sp-cata-nav-dropdown');
    if (!dropdown) return;

    const activeItem = CATALOGUE_PAGES.find(p => p.id === this.activePage) || CATALOGUE_PAGES[0];
    defaultStore.set('route.activePage', this.activePage);
    defaultStore.set('route.activePageLabel', activeItem.label);

    const triggerText = dropdown.querySelector('.ui-dropdown__trigger-text');
    if (triggerText) {
      triggerText.textContent = activeItem.label;
    }

    dropdown.querySelectorAll('.ui-dropdown-menu__item, .ui-dropdown__item').forEach(item => {
      const pId = item.dataset.item || item.getAttribute('data-page') || (item.getAttribute('href') || '').replace('#/', '');
      const isActive = pId === this.activePage || (this.activePage === 'specials' && (pId === 'catalogs' || pId === 'specials'));
      item.classList.toggle('ui-dropdown-menu__item--active', isActive);
      item.classList.toggle('ui-dropdown__item--active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      const existingBadge = item.querySelector('.ui-badge, .draft-ui-badge');
      if (isActive && !existingBadge) {
        const badge = interpret({
          block: 'badge',
          content: 'Current',
          size: 'sm',
          modifier: 'neutral',
          className: 'ui-dropdown__item-badge--plain'
        });
        if (badge) item.appendChild(badge);
      } else if (!isActive && existingBadge) {
        existingBadge.remove();
      }
    });
  }

  setActivePage(pageId, sidebarItems) {
    if (sidebarItems) this.sidebarItems = sidebarItems;
    let normalized = pageId;
    if (pageId === 'specials' || pageId === 'special' || pageId === 'catalogs' || pageId === 'catalog') normalized = 'specials';
    if (pageId === 'patterns' || pageId === 'structural_patterns' || pageId === 'structural-patterns') normalized = 'patterns';
    this.activePage = normalized;

    const dropdown = this.root.querySelector('.sp-cata-nav-dropdown, #sp-cata-nav-dropdown');
    if (dropdown && typeof dropdown._uiDropdownClose === 'function') {
      dropdown._uiDropdownClose();
    }
    this.syncNavDropdownState();

    const sidebar = this.root.querySelector('.sp-cata-sidebar, #sp-cata-sidebar');
    if (sidebar) {
      this.renderSidebar(sidebar, this.sidebarItems || {});
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

    const buildSection = (title, badgeText, badgeClass, list) => ({
      type: 'box',
      className: 'sp-cata-sidebar__section',
      children: [
        {
          type: 'row',
          className: `sp-cata-sidebar__section-title sp-cata-sidebar__section-title--${badgeClass}`,
          children: [
            { tag: 'span', text: title },
            { tag: 'span', className: `sp-cata-sidebar__badge--${badgeClass}`, text: badgeText }
          ]
        },
        ...(list.length > 0
          ? list.map(item => ({
              tag: 'a',
              className: `sp-cata-sidebar__link ${item.active ? 'sp-cata-sidebar__link--active' : ''}`.trim(),
              attributes: { href: item.href },
              children: [{ tag: 'span', text: item.label }]
            }))
          : [{ tag: 'span', className: 'sp-cata-sidebar__link--none', text: 'None' }]
        )
      ]
    });

    const sidebarSpec = {
      type: 'container',
      className: 'sp-cata-sidebar__wrapper',
      children: [
        {
          type: 'container',
          className: 'sp-cata-sidebar__content',
          children: [
            { tag: 'h4', className: 'sp-cata-sidebar__heading', text: currentTitle },
            {
              tag: 'nav',
              className: 'sp-cata-sidebar__nav',
              children: [
                buildSection('Draft', 'In Design', 'draft', draft),
                buildSection('Core', 'Stable', 'core', core),
                buildSection('Catalogue', 'Special', 'special', special)
              ]
            }
          ]
        },
        {
          type: 'box',
          className: 'sp-cata-sidebar__footer',
          children: [
            {
              tag: 'a',
              className: 'sp-cata-sidebar__more-demos-link',
              attributes: { href: '/examples/index.html' },
              text: 'want to view more demos? ↗'
            }
          ]
        }
      ]
    };

    const rendered = interpret(sidebarSpec, { engine: this.engine, store: defaultStore });
    if (rendered) {
      sidebarEl.replaceChildren(rendered);
    }
  }
}

/**
 * renderCatalogueShellLayout - Pure declarative pattern macro for Catalogue Shell Layout.
 * Enables direct JSON spec usage: { pattern: "catalogue-shell-layout", props: { isRoot: false, stripDuplicateIds: true } }
 */
export function renderCatalogueShellLayout(options = {}, context = {}) {
  const container = document.createElement("div");
  container.className = "sp-cata-embedded-shell-wrapper";
  container.style.cssText = "width: 100%; min-height: 240px;";

  const shell = new CatalogueShellLayout({
    isRoot: false,
    stripDuplicateIds: options.stripDuplicateIds ?? true,
    activePage: options.activePage || "specials",
    sidebarItems: options.sidebarItems || {
      draft: [{ label: "Matrix Frame", href: "#draft-sp-cata-matrix-frame", active: true }],
      core: [{ label: "Overview", href: "#" }],
      special: [{ label: "Interaction Frame", href: "#draft-sp-cata-interaction-frame" }]
    },
    ...options
  });
  shell.mount(container);
  return container;
}
