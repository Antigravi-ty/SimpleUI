export function initSelectiveCard(element) {
  if (element._uiBound) return;
  element._uiBound = true;

  const getContainer = () => {
    return element.closest('[data-selection-mode], .ui-selective-group, [role="radiogroup"]');
  };

  const isSingleSelect = () => {
    if (element.dataset.selection === 'single') return true;
    if (element.dataset.selection === 'multi') return false;
    if (element.dataset.group) return true;
    const container = getContainer();
    if (container) {
      return container.dataset.selectionMode === 'single' ||
             container.classList.contains('ui-selective-group--single') ||
             container.getAttribute('role') === 'radiogroup';
    }
    return false;
  };

  const getGroupMembers = () => {
    if (element.dataset.group) {
      return Array.from(document.querySelectorAll(`.ui-selective-card[data-group="${element.dataset.group}"]`));
    }
    const container = getContainer();
    if (container) {
      return Array.from(container.querySelectorAll('.ui-selective-card'));
    }
    return [element];
  };

  const select = () => {
    if (element.classList.contains('ui-selective-card--disabled')) return;

    if (isSingleSelect()) {
      const members = getGroupMembers();
      members.forEach((card) => {
        card.classList.remove('ui-selective-card--selected');
        card.setAttribute('aria-pressed', 'false');
        card.setAttribute('aria-checked', 'false');
      });
      element.classList.add('ui-selective-card--selected');
      element.setAttribute('aria-pressed', 'true');
      element.setAttribute('aria-checked', 'true');
      element.dispatchEvent(new CustomEvent('change', {
        detail: {
          selected: true,
          value: element.dataset.value || element.textContent.trim(),
          index: members.indexOf(element)
        },
        bubbles: true
      }));
    } else {
      const isSelected = element.classList.toggle('ui-selective-card--selected');
      element.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      element.dispatchEvent(new CustomEvent('change', {
        detail: {
          selected: isSelected,
          value: element.dataset.value || element.textContent.trim()
        },
        bubbles: true
      }));
    }
  };

  const onClick = () => select();

  const onKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      select();
    } else if (isSingleSelect() && (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp')) {
      const members = getGroupMembers().filter(c => !c.classList.contains('ui-selective-card--disabled'));
      const idx = members.indexOf(element);
      if (idx >= 0) {
        e.preventDefault();
        const nextIdx = (e.key === 'ArrowRight' || e.key === 'ArrowDown')
          ? (idx + 1) % members.length
          : (idx - 1 + members.length) % members.length;
        members[nextIdx].focus();
        members[nextIdx].click();
      }
    }
  };

  element.addEventListener('click', onClick);
  element.addEventListener('keydown', onKeyDown);

  element._uiCleanup = () => {
    element.removeEventListener('click', onClick);
    element.removeEventListener('keydown', onKeyDown);
    delete element._uiBound;
  };
}
