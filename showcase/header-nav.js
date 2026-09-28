import { initDropdown } from '../src/blocks/dropdown/behavior.js';
import { initSlider } from '../src/blocks/slider/behavior.js';
import { viewportEngine } from '../src/core/viewport-engine.js';

const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
const SAFE_AREA_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>`;

export const NAV_PAGES = [
  { id: 'components', label: 'Components', href: '/showcase/components.html' },
  { id: 'primitives', label: 'Primitives', href: '/showcase/primitives.html' },
  { id: 'structural_patterns', label: 'Structural Patterns', href: '/showcase/structural_patterns.html' },
  { id: 'animations', label: 'Animations', href: '/showcase/animations.html' },
  { id: 'viewport_paradigms', label: 'Viewport Paradigms', href: '/showcase/viewport_paradigms.html' },
  { id: 'developer', label: 'Developer Reference', href: '/showcase/developer.html' },
  { id: 'showcase_special', label: 'Showcase Special', href: '/showcase/showcase_special.html' }
];

export function initAppHeader({ activePage = 'components' } = {}) {
  viewportEngine.init();

  // 1. Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('simpleui-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.innerHTML = savedTheme === 'dark' ? SUN_SVG : MOON_SVG;
    themeToggle.setAttribute('aria-label', savedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.onclick = () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('simpleui-theme', next);
      themeToggle.innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
      themeToggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    };
  }

  const actions = document.querySelector('.app-header__actions');

  // 2. Safe Area Toggle Button
  let safeAreaBtn = document.getElementById('safe-area-toggle');
  if (!safeAreaBtn && actions) {
    safeAreaBtn = document.createElement('button');
    safeAreaBtn.type = 'button';
    safeAreaBtn.id = 'safe-area-toggle';
    safeAreaBtn.className = 'ui-btn ui-btn--sm ui-btn--neutral app-header__safe-area-btn';
    safeAreaBtn.setAttribute('aria-label', 'Toggle Safe Area Overlay');
    safeAreaBtn.title = 'Toggle Safe Area Overlay';
    safeAreaBtn.innerHTML = `${SAFE_AREA_SVG}<span>Safe Area</span>`;
    actions.insertBefore(safeAreaBtn, actions.firstChild);
  }

  if (safeAreaBtn) {
    safeAreaBtn.onclick = () => {
      viewportEngine.toggleSafeArea();
    };
  }

  // 3. UI Scale Slider (Drag-only, 25% - 200%, no manual number text field)
  let scaleControl = document.querySelector('.app-header__scale-control');
  if (!scaleControl && actions) {
    scaleControl = document.createElement('div');
    scaleControl.className = 'app-header__scale-control';
    scaleControl.title = 'UI Scale (25% - 200%)';
    scaleControl.innerHTML = `
      <span class="app-header__scale-label">Scale</span>
      <div class="ui-slider ui-slider--sm ui-slider--neutral app-header__scale-slider" data-unit="%">
        <input type="range" min="25" max="200" step="1" value="${viewportEngine.userScale}" class="ui-slider__input" aria-label="UI Scale" data-unit="%">
        <span class="ui-slider__value">${viewportEngine.userScale}%</span>
      </div>
    `;
    const navDropdown = actions.querySelector('.app-nav-dropdown');
    if (navDropdown) actions.insertBefore(scaleControl, navDropdown);
    else actions.appendChild(scaleControl);
  }

  if (scaleControl) {
    const sliderEl = scaleControl.querySelector('.ui-slider');
    const rangeInput = scaleControl.querySelector('.ui-slider__input');
    const valueDisplay = scaleControl.querySelector('.ui-slider__value');

    if (sliderEl) {
      if (rangeInput) rangeInput.value = viewportEngine.userScale;
      if (valueDisplay) valueDisplay.textContent = `${viewportEngine.userScale}%`;
      initSlider(sliderEl);

      sliderEl.addEventListener('change', (e) => {
        if (e.detail && e.detail.value !== undefined) {
          viewportEngine.setUserScale(e.detail.value);
        }
      });
    }
  }

  // Synchronize Header controls with ViewportEngine state
  viewportEngine.subscribe((m) => {
    if (safeAreaBtn) {
      safeAreaBtn.classList.toggle('is-active', viewportEngine.safeAreaVisible);
    }
    if (scaleControl) {
      const rangeInput = scaleControl.querySelector('.ui-slider__input');
      const valueDisplay = scaleControl.querySelector('.ui-slider__value');
      if (rangeInput && document.activeElement !== rangeInput) {
        rangeInput.value = m.userScale;
      }
      if (valueDisplay) {
        valueDisplay.textContent = `${m.userScale}%`;
      }
    }
  });

  // 4. Flat Navigation switcher dropdown
  const navDropdown = document.querySelector('.app-nav-dropdown');
  if (navDropdown) {
    const triggerText = navDropdown.querySelector('.ui-dropdown__trigger-text');
    const activeItem = NAV_PAGES.find(p => p.id === activePage);
    if (triggerText) {
      triggerText.textContent = activeItem ? activeItem.label : (activePage === 'examples' ? 'Examples' : 'Components');
    }

    const menu = navDropdown.querySelector('.ui-dropdown__menu');
    if (menu) {
      menu.innerHTML = NAV_PAGES.map(p => `
        <a href="${p.href}" class="ui-dropdown__item ${p.id === activePage ? 'ui-dropdown__item--active' : ''}" role="menuitem" data-page="${p.id}">
          <span class="ui-dropdown__item-text">${p.label}</span>
          ${p.id === activePage ? '<span class="ui-badge ui-badge--neutral ui-badge--sm ui-dropdown__item-badge--plain">Current</span>' : ''}
        </a>
      `).join('');

      menu.querySelectorAll('.ui-dropdown__item').forEach(link => {
        link.addEventListener('click', (e) => {
          const pageId = link.getAttribute('data-page');
          if (pageId === activePage) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof navDropdown._uiDropdownClose === 'function') {
              navDropdown._uiDropdownClose();
            } else {
              navDropdown.classList.remove('ui-dropdown--open');
            }
          }
        });
      });
    }

    initDropdown(navDropdown);
  }
}
