/**
 * Live Preview Paradigm Headless Behavior
 * Orchestrates 3-stage Apple morph between centered window and right-docked pill.
 * Default shortcut: Tab (customizable via options.shortcutKey or data-shortcut).
 */

export function initLivePreview(element, options = {}) {
  if (element._uiBound) return;
  element._uiBound = true;

  const shortcutKey = (options.shortcutKey || element.dataset.shortcut || 'Tab').toLowerCase();
  let isCollapsed = options.collapsed ?? element.classList.contains('ui-live-preview-window--collapsed');
  let isAnimating = false;

  const morphContent = element.querySelector('.ui-live-preview__morph-content') || element;
  const expandedView = element.querySelector('#live-preview-expanded-view, .ui-live-preview-window__expanded');
  const collapsedView = element.querySelector('#live-preview-collapsed-view, .ui-live-preview-dock');

  const fadeDuration = options.fadeDuration ?? 100;
  const resizeDuration = options.resizeDuration ?? 150;
  const isSandboxed = options.sandbox || element.dataset.sandbox === 'true';

  const applyStateClass = () => {
    if (isCollapsed) {
      element.classList.add('ui-live-preview-window--collapsed');
      if (expandedView) expandedView.classList.add('is-hidden');
      if (collapsedView) collapsedView.classList.remove('is-hidden');
    } else {
      element.classList.remove('ui-live-preview-window--collapsed');
      if (expandedView) expandedView.classList.remove('is-hidden');
      if (collapsedView) collapsedView.classList.add('is-hidden');
    }
  };

  applyStateClass();

  const toggle = (targetState) => {
    if (isAnimating) return;
    const nextState = typeof targetState === 'boolean' ? targetState : !isCollapsed;
    if (nextState === isCollapsed) return;

    isAnimating = true;

    // Stage 1: Content Fade Out
    morphContent.classList.add('ui-morph-content--faded');

    setTimeout(() => {
      // Stage 2: Switch Views & Morph Container Geometry
      isCollapsed = nextState;
      applyStateClass();

      element.dispatchEvent(new CustomEvent('livepreview:toggle', {
        bubbles: true,
        detail: { collapsed: isCollapsed, shortcut: shortcutKey }
      }));

      // Stage 3: Content Fade In after resize completes
      setTimeout(() => {
        morphContent.classList.remove('ui-morph-content--faded');
        isAnimating = false;
      }, resizeDuration);
    }, fadeDuration);
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    element.dispatchEvent(new CustomEvent('livepreview:back', { bubbles: true }));
    if (isSandboxed) return;
    if (element.dataset.backUrl) {
      window.location.href = element.dataset.backUrl;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === shortcutKey) {
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active.type !== 'range';
      if (isInput && shortcutKey !== 'tab') return;
      e.preventDefault();
      toggle();
    } else if (e.key === 'Escape' && !isCollapsed) {
      handleBack(e);
    }
  };

  const handleClick = (e) => {
    const toggleTrigger = e.target.closest('[data-action="live_preview.toggle"], .ui-live-preview-dock, .ui-live-preview__toggle-btn');
    if (toggleTrigger && element.contains(toggleTrigger)) {
      e.preventDefault();
      toggle();
      return;
    }

    const backTrigger = e.target.closest('[data-action="live_preview.back"], .ui-live-preview__back-btn');
    if (backTrigger && element.contains(backTrigger)) {
      e.preventDefault();
      handleBack(e);
    }
  };

  const enableKeyboard = options.listenKeyboard !== false && element.dataset.noKeyboard !== 'true' && !isSandboxed;
  if (enableKeyboard) {
    window.addEventListener('keydown', handleKeyDown);
  }
  element.addEventListener('click', handleClick);

  // Expose headless controller on element
  element.livePreview = {
    toggle,
    collapse: () => toggle(true),
    expand: () => toggle(false),
    isCollapsed: () => isCollapsed
  };

  element._uiCleanup = () => {
    if (enableKeyboard) {
      window.removeEventListener('keydown', handleKeyDown);
    }
    element.removeEventListener('click', handleClick);
    delete element.livePreview;
    delete element._uiBound;
  };
}
