import { initAppHeader } from './header-nav.js';
import { SimpleUIEngine } from '../src/core/engine.js';
import { PageComposer } from '../src/core/page-composer.js';
import { UIRouter } from '../src/navigation/index.js';
import { bindAllBehaviors } from '../src/blocks/index.js';
import { initLivePreview } from '../src/core/live-preview.js';
import floatingWindowSchema from '../src/schemas/pages/floating_window.json';
import livePreviewSchema from '../src/schemas/pages/live_preview.json';
import './paradigms.css';

// 1. Initialize Unified App Header
initAppHeader({ activePage: 'viewport_paradigms' });

// 2. Engine and Schemas
const engine = new SimpleUIEngine();
const blockModules = import.meta.glob('../src/blocks/*/schema.json', { eager: true });
engine.loadAutoDiscoveredSchemas(blockModules);

const composer = new PageComposer(engine);

// 3. Mount Paradigm 1: Floating Window
const mountFloating = document.getElementById('mount-floating-window');
if (mountFloating) {
  const win = composer.renderPage(floatingWindowSchema);
  win.style.position = 'relative';
  win.style.left = '0px';
  win.style.top = '0px';
  win.style.margin = '0 auto';
  mountFloating.appendChild(win);

  // Drag interaction within stage well
  const header = win.querySelector('#floating-window-header');
  let isDragging = false, startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

  header?.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    const parentRect = mountFloating.getBoundingClientRect();
    initialLeft = rect.left - parentRect.left;
    initialTop = rect.top - parentRect.top;

    const onMouseMove = (ev) => {
      if (!isDragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      win.style.position = 'absolute';
      win.style.left = `${Math.max(10, Math.min(parentRect.width - 240, initialLeft + dx))}px`;
      win.style.top = `${Math.max(10, Math.min(parentRect.height - 100, initialTop + dy))}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// 4. Mount Paradigm 2: Live Preview
const mountLivePreview = document.getElementById('mount-live-preview');
if (mountLivePreview) {
  const win = composer.renderPage(livePreviewSchema);
  mountLivePreview.appendChild(win);
  win.dataset.sandbox = 'true';
  win.dataset.noKeyboard = 'true';
  initLivePreview(win, { shortcutKey: 'Tab', sandbox: true, listenKeyboard: false });

  const statusBadge = document.getElementById('live-preview-status');
  win.addEventListener('livepreview:toggle', (e) => {
    if (statusBadge) {
      const isCollapsed = e.detail.collapsed;
      statusBadge.textContent = isCollapsed ? 'Docked (Live Preview)' : 'Centered';
      statusBadge.className = isCollapsed
        ? 'ui-badge ui-badge--success ui-badge--sm'
        : 'ui-badge ui-badge--neutral ui-badge--sm';
    }
  });

  const btnToggleDock = document.getElementById('btn-toggle-dock');
  btnToggleDock?.addEventListener('click', () => {
    win.dispatchEvent(new CustomEvent('livepreview:command', { detail: { action: 'toggle' } }));
  });
}

// 5. Router and Behaviors
bindAllBehaviors(document.body);
new UIRouter({ root: document.body });
