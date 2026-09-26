export function initDropdown(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const trigger = element.querySelector('.ui-dropdown__trigger');
  const menu = element.querySelector('.ui-dropdown__menu');
  if (!trigger || !menu) return;

  const searchInput = element.querySelector('.ui-dropdown__search-input');

  const onDocClick = (e) => {
    if (!element.contains(e.target) && !menu.contains(e.target)) {
      toggle(false);
    }
  };

  const onDocKeyDown = (e) => {
    if (e.key === 'Escape') {
      toggle(false);
      trigger.focus();
    }
  };

  const toggle = (force) => {
    if (element.classList.contains('ui-dropdown--disabled') || trigger.disabled) return;
    const currentIsOpen = element.classList.contains('ui-dropdown--open');
    const nextIsOpen = force !== undefined ? force : !currentIsOpen;
    if (currentIsOpen === nextIsOpen) return;

    if (nextIsOpen) {
      // Mutual Exclusivity: Opening one dropdown closes all other open dropdowns
      document.querySelectorAll('.ui-dropdown--open').forEach((other) => {
        if (other !== element) {
          if (typeof other._uiDropdownClose === 'function') {
            other._uiDropdownClose();
          } else {
            other.classList.remove('ui-dropdown--open');
            other.classList.remove('ui-dropdown--dropup');
            const otherTrig = other.querySelector('.ui-dropdown__trigger');
            if (otherTrig) otherTrig.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // Boundary check: auto flip to dropup if constrained near bottom
      const rect = trigger.getBoundingClientRect();
      const parentCard = element.closest('.matrix-card, .pattern-card, [role="region"], table');
      const parentBottom = parentCard ? parentCard.getBoundingClientRect().bottom : window.innerHeight;
      const spaceBelow = Math.min(window.innerHeight - rect.bottom, parentBottom - rect.bottom);
      const isDropup = spaceBelow < 90 && rect.top > 90;
      element.classList.toggle('ui-dropdown--dropup', isDropup);
    } else {
      element.classList.remove('ui-dropdown--dropup');
    }

    element.classList.toggle('ui-dropdown--open', nextIsOpen);
    trigger.setAttribute('aria-expanded', nextIsOpen ? 'true' : 'false');

    if (nextIsOpen) {
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onDocKeyDown);
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 50);
      }
    } else {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onDocKeyDown);
    }

    element.dispatchEvent(new CustomEvent('toggle', {
      detail: { open: nextIsOpen },
      bubbles: true
    }));
  };

  element._uiDropdownClose = () => toggle(false);

  const onTriggerClick = (e) => {
    e.stopPropagation();
    toggle();
  };

  const onMenuItemClick = (e) => {
    const item = e.target.closest('.ui-dropdown__item');
    if (!item) return;
    if (item.classList.contains('ui-dropdown__item--disabled') || item.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      return;
    }
    const action = item.getAttribute('data-action') || item.textContent.trim();
    element.dispatchEvent(new CustomEvent('select', {
      detail: { action, item },
      bubbles: true
    }));
    toggle(false);
  };

  const onSearchInput = (e) => {
    const q = e.target.value.toLowerCase().trim();
    const items = menu.querySelectorAll('.ui-dropdown__item');
    items.forEach(it => {
      const text = it.textContent.toLowerCase();
      it.style.display = text.includes(q) ? '' : 'none';
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', onSearchInput);
  }

  trigger.addEventListener('click', onTriggerClick);
  menu.addEventListener('click', onMenuItemClick);

  if (element.classList.contains('ui-dropdown--open')) {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKeyDown);
  }

  element._uiCleanup = () => {
    delete element._uiDropdownClose;
    element.classList.remove('ui-dropdown--open');
    element.classList.remove('ui-dropdown--dropup');
    trigger.removeEventListener('click', onTriggerClick);
    menu.removeEventListener('click', onMenuItemClick);
    if (searchInput) {
      searchInput.removeEventListener('input', onSearchInput);
    }
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onDocKeyDown);
    delete element._uiBound;
  };
}
