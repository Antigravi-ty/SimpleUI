export function initPanel(element, options = {}) {
  if (element._uiBound) return;
  element._uiBound = true;

  const descEl = element.querySelector('.ui-panel__desc');
  const defaultDesc = element.dataset.defaultDesc || (descEl ? descEl.textContent.trim() : '');
  const backButtons = Array.from(element.querySelectorAll('.ui-panel__back-btn, .ui-panel__footer-back'));

  const isSandboxed = options.sandbox || element.dataset.sandbox === 'true';

  const handleBack = (e) => {
    e?.preventDefault();
    element.dispatchEvent(new CustomEvent('panel:back', { bubbles: true }));
    if (isSandboxed) {
      if (descEl) {
        const prev = descEl.textContent;
        descEl.textContent = 'Back action triggered (sandboxed)';
        setTimeout(() => { descEl.textContent = prev; }, 1200);
      }
      return;
    }
    if (element.dataset.backUrl) {
      window.location.href = element.dataset.backUrl;
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  backButtons.forEach(btn => btn.addEventListener('click', handleBack));

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && (element.contains(document.activeElement) || element.classList.contains('is-focused'))) {
      handleBack(e);
    }
  };

  const enableKeydown = options.listenKeyboard !== false && element.dataset.noKeyboard !== 'true' && !isSandboxed;
  if (enableKeydown) {
    element.addEventListener('keydown', handleKeyDown);
  }

  const content = element.querySelector('.ui-panel__content');
  let currentTarget = null;

  const updateDesc = (text, isActive = true) => {
    if (!descEl) return;
    descEl.textContent = text;
    if (isActive) {
      descEl.classList.add('ui-panel__desc--active');
      descEl.setAttribute('aria-live', 'polite');
    } else {
      descEl.classList.remove('ui-panel__desc--active');
    }
  };

  const handlePointerEnter = (e) => {
    const descHost = e.target.closest('[data-description], [aria-description], [data-help]');
    if (!descHost || !content?.contains(descHost)) return;
    currentTarget = descHost;
    const text = descHost.dataset.description || descHost.getAttribute('aria-description') || descHost.dataset.help;
    if (text) updateDesc(text, true);
  };

  const handlePointerLeave = (e) => {
    if (e.target === currentTarget) {
      currentTarget = null;
      updateDesc(defaultDesc, false);
    }
  };

  const handleFocusIn = (e) => {
    const descHost = e.target.closest('[data-description], [aria-description], [data-help]');
    if (!descHost || !content?.contains(descHost)) return;
    currentTarget = descHost;
    const text = descHost.dataset.description || descHost.getAttribute('aria-description') || descHost.dataset.help;
    if (text) updateDesc(text, true);
  };

  const handleFocusOut = (e) => {
    if (e.target === currentTarget) {
      currentTarget = null;
      updateDesc(defaultDesc, false);
    }
  };

  if (content) {
    content.addEventListener('mouseenter', handlePointerEnter, true);
    content.addEventListener('mouseleave', handlePointerLeave, true);
    content.addEventListener('focusin', handleFocusIn);
    content.addEventListener('focusout', handleFocusOut);
  }

  element._uiCleanup = () => {
    backButtons.forEach(btn => btn.removeEventListener('click', handleBack));
    if (enableKeydown) {
      element.removeEventListener('keydown', handleKeyDown);
    }
    if (content) {
      content.removeEventListener('mouseenter', handlePointerEnter, true);
      content.removeEventListener('mouseleave', handlePointerLeave, true);
      content.removeEventListener('focusin', handleFocusIn);
      content.removeEventListener('focusout', handleFocusOut);
    }
    delete element._uiBound;
  };
}
